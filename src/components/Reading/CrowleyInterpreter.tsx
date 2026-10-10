import React, { useState, useEffect, useRef } from 'react';
import { ReadingCard } from '../../types/tarot';
import { AgentType, AGENTS, AGENT_LIST, buildPrompt, sendToAgentAndWait, sendViaUrl, AgentWaitStatus, InterpretationRequest } from '../../services/agentService';
import { Sparkles, Volume2, VolumeX, Send, ClipboardPaste, ExternalLink, Bot, Check, Loader2, Clock, AlertCircle, Link2 } from 'lucide-react';

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

type WaitState = 'idle' | 'sending' | 'waiting' | 'received' | 'timeout' | 'manual';

export const CrowleyInterpreter: React.FC<Props> = ({ reading, readingState, selectedAgent }) => {
  const [messages, setMessages] = useState<Array<{type: 'user' | 'crowley', text: string}>>([]);
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [waitState, setWaitState] = useState<WaitState>('idle');
  const [pasteText, setPasteText] = useState('');
  const [showManualPaste, setShowManualPaste] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [agentOpened, setAgentOpened] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const lastPromptRef = useRef<string>('');
  const synthesis = window.speechSynthesis;

  const speakText = (text: string) => {
    synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.pitch = 0.9;
    const voices = synthesis.getVoices();
    const portugueseVoice = voices.find(voice => voice.lang.includes('pt'));
    if (portugueseVoice) {
      utterance.voice = portugueseVoice;
    }
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

  useEffect(() => {
    if (reading && readingState === 'complete' && messages.length === 0 && waitState === 'idle' && !agentOpened) {
      handleInitialInterpretation();
    }
    return () => {
      synthesis.cancel();
    };
  }, [reading, readingState]);

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
    question: qOverride || reading!.question || "Qual é a revelação do universo?",
    userName: reading!.userName,
    birthDate: reading!.birthDate
  });

  const handleInitialInterpretation = async () => {
    const prompt = buildPrompt(buildRequest());
    lastPromptRef.current = prompt;
    setAgentOpened(true);
    setWaitState('sending');

    const response = await sendToAgentAndWait(selectedAgent, prompt, (status: AgentWaitStatus) => {
      if (status.state === 'waiting' || status.state === 'checking') setWaitState('waiting');
    });

    if (response && response.length > 20) {
      setMessages([{ type: 'crowley', text: response }]);
      setWaitState('received');
      speakText(response);
    } else {
      setWaitState('timeout');
      setShowManualPaste(true);
    }
  };

  const handlePasteInterpretation = () => {
    const text = pasteText.trim();
    if (!text) return;
    setMessages(prev => [...prev, { type: 'crowley', text }]);
    setPasteText('');
    setShowManualPaste(false);
    setWaitState('received');
    speakText(text);
  };

  const handleSendFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !reading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    stopSpeaking();

    const followUpPrompt = buildPrompt(buildRequest(userMessage));
    lastPromptRef.current = followUpPrompt;
    setWaitState('sending');

    sendToAgentAndWait(selectedAgent, followUpPrompt, (status: AgentWaitStatus) => {
      if (status.state === 'waiting' || status.state === 'checking') setWaitState('waiting');
    }).then((response) => {
      if (response && response.length > 20) {
        setMessages(prev => [...prev, { type: 'crowley', text: response }]);
        setWaitState('received');
        speakText(response);
      } else {
        setWaitState('timeout');
        setShowManualPaste(true);
      }
    });
  };

  const handleCopyPrompt = async () => {
    const prompt = lastPromptRef.current || buildPrompt(buildRequest(inputText || undefined));
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      // ignore
    }
  };

  if (!reading || readingState !== 'complete') {
    return null;
  }

  const agentInfo = AGENTS[selectedAgent];
  const isWaiting = waitState === 'sending' || waitState === 'waiting';

  return (
    <div className="bg-indigo-950/50 p-6 rounded-lg border border-purple-800/30 mt-6">
      <h3 className="text-xl text-yellow-400 mb-2 font-medium flex items-center">
        <Sparkles className="w-5 h-5 mr-2" />
        Interpretação Mística - Aleister Crowley
      </h3>
      <div className="mb-4 flex items-center gap-2 text-xs text-purple-300">
        <Bot className="w-4 h-4 text-yellow-400/70" />
        <span>Agente de interpretação: <strong className="text-yellow-300">{agentInfo.name}</strong></span>
      </div>

      {/* Sending state */}
      {waitState === 'sending' && (
        <div className="mb-4 flex items-center gap-3 text-purple-200 p-4 bg-indigo-900/40 rounded-lg">
          <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
          <span className="text-sm">Preparando prompt e abrindo {agentInfo.name}...</span>
        </div>
      )}

      {/* Waiting state - watching clipboard */}
      {waitState === 'waiting' && (
        <div className="mb-4 p-4 bg-indigo-900/40 rounded-lg border border-purple-700/30 space-y-3">
          <div className="flex items-center gap-3 text-purple-200">
            <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="text-sm">Aguardando resposta do {agentInfo.name}...</span>
          </div>
          <div className="p-3 bg-indigo-950/50 rounded-md border border-purple-700/30">
            <p className="text-purple-300 text-xs mb-2">
              O prompt foi copiado e o <strong className="text-yellow-300">{agentInfo.name}</strong> foi aberto com o prompt na URL.
            </p>
            <ol className="text-purple-400 text-xs space-y-1 list-decimal pl-4 mb-3">
              <li>No {agentInfo.name}: o prompt ja esta na caixa de conversa. Pressione Enter para enviar.</li>
              <li>Aguarde o {agentInfo.name} gerar a resposta.</li>
              <li>Selecione e copie a resposta gerada (Ctrl+C).</li>
              <li>Volte para esta aba do Tarot — a resposta sera capturada automaticamente e lida em voz alta.</li>
            </ol>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleCopyPrompt}
                className="px-3 py-1.5 bg-indigo-700 text-yellow-300 rounded-md hover:bg-indigo-600 transition flex items-center text-xs"
              >
                {copyStatus === 'copied' ? <Check className="w-4 h-4 mr-1" /> : <ClipboardPaste className="w-4 h-4 mr-1" />}
                {copyStatus === 'copied' ? 'Copiado!' : 'Copiar Prompt'}
              </button>
              <button
                onClick={() => { if (lastPromptRef.current) sendViaUrl(selectedAgent, lastPromptRef.current); }}
                className="px-3 py-1.5 bg-purple-700 text-yellow-300 rounded-md hover:bg-purple-600 transition flex items-center text-xs"
              >
                <Link2 className="w-4 h-4 mr-1" />
                Enviar via URL
              </button>
              <button
                onClick={() => window.open(agentInfo.url, '_blank', 'noopener,noreferrer')}
                className="px-3 py-1.5 bg-indigo-700 text-yellow-300 rounded-md hover:bg-indigo-600 transition flex items-center text-xs"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Reabrir {agentInfo.name}
              </button>
              <button
                onClick={() => { setWaitState('manual'); setShowManualPaste(true); }}
                className="px-3 py-1.5 bg-indigo-700 text-purple-200 rounded-md hover:bg-indigo-600 transition text-xs"
              >
                Colar Manualmente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeout state */}
      {waitState === 'timeout' && (
        <div className="mb-4 p-4 bg-indigo-900/40 rounded-lg border border-orange-700/30 space-y-3">
          <div className="flex items-center gap-3 text-orange-300">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            <span className="text-sm">Tempo esgotado aguardando resposta automática.</span>
          </div>
          <p className="text-purple-300 text-xs">
            Cole a resposta manualmente abaixo, ou use o botão para reenviar.
          </p>
        </div>
      )}

      {/* Manual paste area */}
      {showManualPaste && waitState !== 'received' && (
        <div className="mb-4">
          <label className="block text-purple-300 text-sm mb-2">Cole aqui a resposta do {agentInfo.name}:</label>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Cole a interpretação recebida do agente..."
            className="w-full p-3 rounded-md bg-indigo-900 border border-purple-700 text-purple-100 text-sm min-h-[120px] focus:outline-none focus:border-yellow-500"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handlePasteInterpretation}
              disabled={!pasteText.trim()}
              className="px-4 py-2 bg-yellow-500 text-indigo-900 rounded-md hover:bg-yellow-400 transition flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 mr-1" />
              Trazer Resposta
            </button>
            <button
              onClick={() => { setShowManualPaste(false); setWaitState('idle'); }}
              className="px-4 py-2 bg-indigo-800 text-purple-200 rounded-md hover:bg-indigo-700 transition text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="bg-indigo-900/30 rounded-lg p-4 mb-4 h-[400px] overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div className="flex items-start gap-2">
              {message.type === 'crowley' && (
                <button
                  onClick={() => isSpeaking ? stopSpeaking() : speakText(message.text)}
                  className="mt-2 p-1 rounded-full hover:bg-purple-700/50 transition-colors"
                  title="Ouvir mensagem"
                >
                  {isSpeaking ? (
                    <VolumeX className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-yellow-400" />
                  )}
                </button>
              )}
              <div
                className={`inline-block rounded-lg p-3 max-w-[80%] whitespace-pre-wrap ${
                  message.type === 'user'
                    ? 'bg-purple-700/50 text-purple-100'
                    : 'bg-indigo-800/50 text-yellow-200'
                }`}
              >
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
          placeholder="Faça uma pergunta sobre sua leitura..."
          disabled={isWaiting}
          className="flex-1 bg-indigo-900/30 border border-purple-700/30 rounded-lg px-4 py-2 text-purple-100 placeholder-purple-400 focus:outline-none focus:border-purple-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isWaiting}
          className="bg-yellow-500 text-indigo-900 px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isWaiting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};
