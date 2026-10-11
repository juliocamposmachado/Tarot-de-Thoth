import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ReadingCard } from '../../types/tarot';
import { AgentType, AGENTS, buildPrompt, sendToAgentAndWait, checkBridgeHealth, waitForBridge, launchBridgeProtocol, openChatGPTConversation, copyToClipboard, BridgeStatus, BridgeHealth, InterpretationRequest } from '../../services/agentService';
import { Sparkles, Volume2, VolumeX, Send, Bot, Loader2, AlertCircle, RefreshCw, ClipboardPaste, ExternalLink, Check, Wifi, WifiOff, Rocket, Download } from 'lucide-react';

interface Props {
  reading: {
    cards: ReadingCard[];
    spreadType: string;
    question: string;
    userName?: string;
    birthDate?: string;
  } | null;
  readingState: string;
  selectedAgent: AgentType;
}

type WaitState = 'idle' | 'connecting' | 'queued' | 'opening_browser' | 'sending' | 'generating' | 'completed' | 'failed' | 'bridge_offline' | 'manual';

const STATUS_LABELS: Record<string, string> = {
  connecting: 'Conectando a ponte local...',
  queued: 'Leitura na fila...',
  opening_browser: 'Abrindo conversa do ChatGPT...',
  sending: 'Enviando pergunta ao ChatGPT...',
  generating: 'Aguardando geracao da resposta...',
};

export const CrowleyInterpreter: React.FC<Props> = ({ reading, readingState, selectedAgent }) => {
  const [messages, setMessages] = useState<Array<{type: 'user' | 'crowley', text: string}>>([]);
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [waitState, setWaitState] = useState<WaitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [autoStarted, setAutoStarted] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [showManualPaste, setShowManualPaste] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [bridgeHealth, setBridgeHealth] = useState<BridgeHealth | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [autoRetrying, setAutoRetrying] = useState(false);
  const [launchingBridge, setLaunchingBridge] = useState(false);
  const [launchStep, setLaunchStep] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const synthesis = window.speechSynthesis;

  const speakText = (text: string) => {
    synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.pitch = 0.9;
    const voices = synthesis.getVoices();
    const portugueseVoice = voices.find(voice => voice.lang.includes('pt'));
    if (portugueseVoice) utterance.voice = portugueseVoice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    synthesis.cancel();
    setIsSpeaking(false);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkBridge = useCallback(async () => {
    const health = await checkBridgeHealth();
    setBridgeHealth(health);
  }, []);

  useEffect(() => {
    checkBridge();
  }, [checkBridge]);

  useEffect(() => {
    if (reading && readingState === 'complete' && messages.length === 0 && waitState === 'idle' && !autoStarted) {
      if (bridgeHealth && bridgeHealth.authenticated) {
        handleInitialInterpretation();
      } else {
        setAutoRetrying(true);
        setWaitState('connecting');
        waitForBridge(5, 3000, (attempt) => setRetryCount(attempt)).then((health) => {
          setAutoRetrying(false);
          setBridgeHealth(health);
          if (health && health.authenticated) {
            handleInitialInterpretation();
          } else {
            setWaitState('bridge_offline');
          }
        });
      }
    }
    return () => { synthesis.cancel(); };
  }, [reading, readingState, bridgeHealth]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildRequest = (qOverride?: string): InterpretationRequest => ({
    cards: reading!.cards.map(c => ({
      name: c.card.name,
      position: c.position.name,
      isReversed: c.isReversed
    })),
    spreadType: reading!.spreadType,
    question: qOverride || reading!.question || "Qual e a revelacao do universo?",
    userName: reading!.userName,
    birthDate: reading!.birthDate
  });

  const handleInitialInterpretation = async () => {
    setAutoStarted(true);
    const prompt = buildPrompt(buildRequest());
    setWaitState('connecting');
    setErrorMsg('');

    const response = await sendToAgentAndWait(
      selectedAgent,
      prompt,
      (status: BridgeStatus) => {
        if (status.state === 'bridge_offline') setWaitState('bridge_offline');
        else if (status.state === 'failed') { setWaitState('failed'); setErrorMsg(status.message); }
        else if (status.state !== 'completed') setWaitState(status.state as WaitState);
      },
      {
        question: reading!.question || '',
        spreadType: reading!.spreadType,
        cards: reading!.cards.map(c => ({ name: c.card.name, position: c.position.name, isReversed: c.isReversed })),
        userName: reading!.userName,
        birthDate: reading!.birthDate,
      }
    );

    if (response && response.length > 20) {
      setMessages([{ type: 'crowley', text: response }]);
      setWaitState('completed');
      speakText(response);
    } else if (waitState !== 'bridge_offline') {
      setWaitState('failed');
      if (!errorMsg) setErrorMsg('Nao foi possivel obter a interpretacao.');
    }
    checkBridge();
  };

  const handleSendFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !reading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    stopSpeaking();

    const followUpPrompt = buildPrompt(buildRequest(userMessage));
    setWaitState('connecting');
    setErrorMsg('');

    sendToAgentAndWait(
      selectedAgent,
      followUpPrompt,
      (status: BridgeStatus) => {
        if (status.state === 'bridge_offline') setWaitState('bridge_offline');
        else if (status.state === 'failed') { setWaitState('failed'); setErrorMsg(status.message); }
        else if (status.state !== 'completed') setWaitState(status.state as WaitState);
      },
      {
        question: userMessage,
        spreadType: reading.spreadType,
        cards: reading.cards.map(c => ({ name: c.card.name, position: c.position.name, isReversed: c.isReversed })),
        userName: reading.userName,
        birthDate: reading.birthDate,
      }
    ).then((response) => {
      if (response && response.length > 20) {
        setMessages(prev => [...prev, { type: 'crowley', text: response }]);
        setWaitState('completed');
        speakText(response);
      } else {
        setWaitState('failed');
        if (!errorMsg) setErrorMsg('Nao foi possivel obter a resposta.');
      }
      checkBridge();
    });
  };

  const handleCopyPrompt = async () => {
    const prompt = buildPrompt(buildRequest(inputText || undefined));
    const ok = await copyToClipboard(prompt);
    if (ok) { setCopyStatus('copied'); setTimeout(() => setCopyStatus('idle'), 2000); }
  };

  const handlePasteInterpretation = () => {
    const text = pasteText.trim();
    if (!text) return;
    setMessages(prev => [...prev, { type: 'crowley', text }]);
    setPasteText('');
    setShowManualPaste(false);
    setWaitState('completed');
    speakText(text);
  };

  const handleLaunchBridge = () => {
    setLaunchingBridge(true);
    setLaunchStep('Solicitando inicio da ponte...');

    launchBridgeProtocol((status) => {
      if (status === 'launching') setLaunchStep('Solicitando inicio da ponte...');
      else if (status === 'waiting') setLaunchStep('Aguardando o navegador pedir confirmacao...');
      else if (status.startsWith('polling_')) {
        const n = status.split('_')[1];
        setLaunchStep(`Procurando a ponte... (tentativa ${n}/30)`);
      } else if (status === 'online') setLaunchStep('Ponte conectada!');
      else if (status === 'timeout') setLaunchStep('Tempo esgotado. Verifique se a ponte foi instalada.');
    }).then((health) => {
      setLaunchingBridge(false);
      setBridgeHealth(health);
      if (health && health.authenticated) {
        handleInitialInterpretation();
      } else if (health && !health.authenticated) {
        setWaitState('failed');
        setErrorMsg('Ponte iniciada mas sessao do ChatGPT nao esta autenticada. Faca login na janela aberta.');
      } else {
        setWaitState('bridge_offline');
      }
    });
  };

  if (!reading || readingState !== 'complete') return null;

  const agentInfo = AGENTS[selectedAgent];
  const isProcessing = ['connecting', 'queued', 'opening_browser', 'sending', 'generating'].includes(waitState);

  return (
    <div className="bg-indigo-950/50 p-6 rounded-lg border border-purple-800/30 mt-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl text-yellow-400 font-medium flex items-center">
          <Sparkles className="w-5 h-5 mr-2" />
          Interpretacao Mistica - Aleister Crowley
        </h3>
        <div className="flex items-center gap-2 text-xs">
          {bridgeHealth ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-300">Ponte ativa</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-orange-300">Ponte offline</span>
              {!launchingBridge && (
                <button
                  onClick={handleLaunchBridge}
                  className="ml-1 px-2 py-0.5 bg-green-600 text-white rounded text-xs hover:bg-green-500 transition flex items-center gap-1"
                >
                  <Rocket className="w-3 h-3" />
                  Iniciar
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <div className="mb-4 flex items-center gap-2 text-xs text-purple-300">
        <Bot className="w-4 h-4 text-yellow-400/70" />
        <span>Agente: <strong className="text-yellow-300">{agentInfo.name}</strong> via ponte local</span>
      </div>

      {(isProcessing || autoRetrying || launchingBridge) && (
        <div className="mb-4 flex items-center gap-3 text-purple-200 p-4 bg-indigo-900/40 rounded-lg">
          <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
          <span className="text-sm">
            {launchingBridge
              ? launchStep
              : autoRetrying
                ? `Procurando ponte local... (tentativa ${retryCount}/5)`
                : (STATUS_LABELS[waitState] || 'Processando...')}
          </span>
        </div>
      )}

      {waitState === 'bridge_offline' && (
        <div className="mb-4 p-4 bg-indigo-900/40 rounded-lg border border-orange-700/30 space-y-4">
          <div className="flex items-center gap-3 text-orange-300">
            <WifiOff className="w-5 h-5 text-orange-400" />
            <span className="text-sm">Ponte local nao encontrada. Voce pode iniciar automaticamente ou usar o modo manual.</span>
          </div>

          <button
            onClick={handleLaunchBridge}
            disabled={launchingBridge}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Rocket className="w-5 h-5" />
            Iniciar Ponte Automaticamente
          </button>

          <div className="bg-indigo-950/60 rounded-lg p-3 text-xs text-purple-300 space-y-1">
            <p className="text-yellow-400 font-medium">Primeira vez? Instale a ponte:</p>
            <p>1. Baixe e execute o instalador (botao abaixo)</p>
            <p>2. No terminal: <code className="bg-indigo-800 px-1 rounded">cd local_bridge && ./setup.sh</code></p>
            <p>3. Acesse <code className="bg-indigo-800 px-1 rounded">https://127.0.0.1:5318/api/v1/health</code> e aceite o certificado</p>
            <p>4. Faca login no ChatGPT na janela que abrira</p>
            <p>5. Depois da instalacao, clique em \"Iniciar Ponte Automaticamente\"</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button onClick={() => {
              setAutoRetrying(true);
              setWaitState('connecting');
              waitForBridge(5, 3000, (a) => setRetryCount(a)).then((health) => {
                setAutoRetrying(false);
                setBridgeHealth(health);
                if (health && health.authenticated) {
                  handleInitialInterpretation();
                } else {
                  setWaitState('bridge_offline');
                }
              });
            }} className="px-3 py-1.5 bg-yellow-500 text-indigo-900 rounded-md hover:bg-yellow-400 transition flex items-center text-xs">
              <RefreshCw className="w-4 h-4 mr-1" />
              Verificar Ponte
            </button>
            <button onClick={() => { setShowManualPaste(true); setWaitState('manual'); }} className="px-3 py-1.5 bg-indigo-700 text-yellow-300 rounded-md hover:bg-indigo-600 transition flex items-center text-xs">
              <ClipboardPaste className="w-4 h-4 mr-1" />
              Modo Manual
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {waitState === 'failed' && (
        <div className="mb-4 p-4 bg-indigo-900/40 rounded-lg border border-orange-700/30 space-y-3">
          <div className="flex items-center gap-3 text-orange-300">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            <span className="text-sm">{errorMsg}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { if (messages.length === 0) handleInitialInterpretation(); else setWaitState('completed'); }} className="px-4 py-2 bg-yellow-500 text-indigo-900 rounded-md hover:bg-yellow-400 transition flex items-center text-sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </button>
            <button onClick={() => { setShowManualPaste(true); setWaitState('manual'); }} className="px-4 py-2 bg-indigo-700 text-purple-200 rounded-md hover:bg-indigo-600 transition text-sm">
              Modo Manual
            </button>
          </div>
        </div>
      )}

      {/* Manual paste area */}
      {showManualPaste && waitState === 'manual' && (
        <div className="mb-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleCopyPrompt} className="px-3 py-1.5 bg-indigo-700 text-yellow-300 rounded-md hover:bg-indigo-600 transition flex items-center text-xs">
              {copyStatus === 'copied' ? <Check className="w-4 h-4 mr-1" /> : <ClipboardPaste className="w-4 h-4 mr-1" />}
              {copyStatus === 'copied' ? 'Copiado!' : 'Copiar Prompt'}
            </button>
            <button onClick={openChatGPTConversation} className="px-3 py-1.5 bg-purple-700 text-yellow-300 rounded-md hover:bg-purple-600 transition flex items-center text-xs">
              <ExternalLink className="w-4 h-4 mr-1" />
              Abrir ChatGPT
            </button>
          </div>
          <p className="text-purple-400 text-xs">Cole o prompt no ChatGPT, envie, copie a resposta e cole abaixo.</p>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Cole a interpretacao recebida do ChatGPT..."
            className="w-full p-3 rounded-md bg-indigo-900 border border-purple-700 text-purple-100 text-sm min-h-[120px] focus:outline-none focus:border-yellow-500"
          />
          <div className="flex gap-2">
            <button onClick={handlePasteInterpretation} disabled={!pasteText.trim()} className="px-4 py-2 bg-yellow-500 text-indigo-900 rounded-md hover:bg-yellow-400 transition flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <Send className="w-4 h-4 mr-1" />
              Trazer Resposta
            </button>
            <button onClick={() => { setShowManualPaste(false); setWaitState('idle'); }} className="px-4 py-2 bg-indigo-800 text-purple-200 rounded-md hover:bg-indigo-700 transition text-sm">
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="bg-indigo-900/30 rounded-lg p-4 mb-4 h-[400px] overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
            <div className="flex items-start gap-2">
              {message.type === 'crowley' && (
                <button
                  onClick={() => isSpeaking ? stopSpeaking() : speakText(message.text)}
                  className="mt-2 p-1 rounded-full hover:bg-purple-700/50 transition-colors"
                  title="Ouvir mensagem"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-yellow-400" /> : <Volume2 className="w-4 h-4 text-yellow-400" />}
                </button>
              )}
              <div className={`inline-block rounded-lg p-3 max-w-[80%] whitespace-pre-wrap ${
                message.type === 'user' ? 'bg-purple-700/50 text-purple-100' : 'bg-indigo-800/50 text-yellow-200'
              }`}>
                {message.text}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Follow-up question form */}
      <form onSubmit={handleSendFollowUp} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Faca uma pergunta sobre sua leitura..."
          disabled={isProcessing}
          className="flex-1 bg-indigo-900/30 border border-purple-700/30 rounded-lg px-4 py-2 text-purple-100 placeholder-purple-400 focus:outline-none focus:border-purple-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isProcessing}
          className="bg-yellow-500 text-indigo-900 px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};
