import React, { useState, useEffect, useCallback } from 'react';
import { ReadingCard } from '../../types/tarot';
import { Eye, Star, Bot, Volume2, VolumeX, Loader2, AlertCircle, RefreshCw, Send, ClipboardPaste, ExternalLink, Check, Wifi, WifiOff } from 'lucide-react';
import { AgentType, AGENTS, buildCardPrompt, sendToAgentAndWait, checkBridgeHealth, openChatGPTConversation, copyToClipboard, BridgeStatus, BridgeHealth, CardInterpretationRequest } from '../../services/agentService';

interface CardInterpretationProps {
  readingCard: ReadingCard | null;
  selectedAgent: AgentType;
  question: string;
  spreadType: string;
  userName?: string;
  birthDate?: string;
}

type WaitState = 'idle' | 'connecting' | 'queued' | 'opening_browser' | 'sending' | 'generating' | 'completed' | 'failed' | 'bridge_offline' | 'manual';

const STATUS_LABELS: Record<string, string> = {
  connecting: 'Conectando a ponte local...',
  queued: 'Leitura na fila...',
  opening_browser: 'Abrindo conversa do ChatGPT...',
  sending: 'Enviando pergunta ao ChatGPT...',
  generating: 'Aguardando geracao da resposta...',
};

export const CardInterpretation: React.FC<CardInterpretationProps> = ({
  readingCard,
  selectedAgent,
  question,
  spreadType,
  userName,
  birthDate,
}) => {
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null);
  const [waitState, setWaitState] = useState<WaitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [showManualPaste, setShowManualPaste] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [bridgeHealth, setBridgeHealth] = useState<BridgeHealth | null>(null);
  const synthesis = window.speechSynthesis;

  const buildRequest = (): CardInterpretationRequest | null => {
    if (!readingCard) return null;
    const { card, position, isReversed } = readingCard;
    return {
      cardName: card.name,
      cardEnglishName: card.englishName,
      position: position.name,
      isReversed,
      keywords: card.keywords,
      element: card.element,
      suit: card.suit,
      number: card.number,
      category: card.category,
      question: question || 'Qual e a revelacao do universo?',
      spreadType: spreadType || 'three-card',
      userName,
      birthDate,
    };
  };

  const speakText = (text: string) => {
    synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.pitch = 0.9;
    const voices = synthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.includes('pt'));
    if (ptVoice) utterance.voice = ptVoice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    synthesis.cancel();
    setIsSpeaking(false);
  };

  const checkBridge = useCallback(async () => {
    const health = await checkBridgeHealth();
    setBridgeHealth(health);
  }, []);

  useEffect(() => {
    checkBridge();
  }, [checkBridge]);

  const handleAskAgent = async () => {
    const req = buildRequest();
    if (!req) return;
    const prompt = buildCardPrompt(req);
    setAiInterpretation(null);
    setWaitState('connecting');
    setErrorMsg('');

    const response = await sendToAgentAndWait(
      selectedAgent,
      prompt,
      (status: BridgeStatus) => {
        if (status.state === 'bridge_offline') {
          setWaitState('bridge_offline');
        } else if (status.state === 'failed') {
          setWaitState('failed');
          setErrorMsg(status.message);
        } else if (status.state === 'completed') {
          // handled below
        } else {
          setWaitState(status.state as WaitState);
        }
      },
      {
        question: req.question,
        spreadType: req.spreadType,
        cards: [{ name: req.cardName, position: req.position, isReversed: req.isReversed }],
        userName: req.userName,
        birthDate: req.birthDate,
      }
    );

    if (response && response.length > 20) {
      setAiInterpretation(response);
      setWaitState('completed');
      speakText(response);
    } else if (waitState !== 'bridge_offline') {
      setWaitState('failed');
      if (!errorMsg) setErrorMsg('Nao foi possivel obter a interpretacao.');
    }

    checkBridge();
  };

  const handleCopyPrompt = async () => {
    const req = buildRequest();
    if (!req) return;
    const prompt = buildCardPrompt(req);
    const ok = await copyToClipboard(prompt);
    if (ok) {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const handlePasteInterpretation = () => {
    const text = pasteText.trim();
    if (!text) return;
    setAiInterpretation(text);
    setPasteText('');
    setShowManualPaste(false);
    setWaitState('completed');
    speakText(text);
  };

  if (!readingCard) {
    return (
      <div className="p-6 bg-indigo-950/50 rounded-lg text-center">
        <p className="text-purple-300">Selecione uma carta para ver sua interpretacao.</p>
      </div>
    );
  }

  const { card, position, isReversed, interpretation } = readingCard;
  const agentInfo = AGENTS[selectedAgent];
  const isProcessing = ['connecting', 'queued', 'opening_browser', 'sending', 'generating'].includes(waitState);

  return (
    <div className="p-6 bg-indigo-950/50 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-white">
          {card.name} {isReversed && "(Invertida)"}
        </h3>
        <div className="text-sm text-yellow-400 font-medium px-3 py-1 bg-indigo-900/50 rounded-full">
          {position.name}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Card keywords */}
        <div className="flex flex-wrap gap-2 mb-2">
          {card.keywords.map((keyword, index) => (
            <span key={index} className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded-full">
              {keyword}
            </span>
          ))}
        </div>

        {/* Position meaning */}
        <div className="mb-4">
          <h4 className="text-lg text-yellow-400 flex items-center mb-2">
            <Eye className="w-4 h-4 mr-2" />
            Significado na Posicao
          </h4>
          <p className="text-purple-200">{position.description}</p>
          <div className="mt-2 pl-4 border-l-2 border-purple-800">
            <p className="text-purple-300 italic text-sm">{position.crowleyInterpretation}</p>
          </div>
        </div>

        {/* Card interpretation in this position */}
        <div className="mb-4">
          <h4 className="text-lg text-yellow-400 flex items-center mb-2">
            <Star className="w-4 h-4 mr-2" />
            Interpretacao de Crowley
          </h4>
          <div className="pl-4 border-l-2 border-yellow-700">
            <p className="text-purple-200">{interpretation}</p>
            {isReversed && (
              <p className="mt-2 text-purple-300 italic">
                A inversao da carta intensifica as qualidades desafiadoras ou inverte as energias tradicionais,
                conforme as correspondencias astrologicas opostas descritas por Crowley.
              </p>
            )}
          </div>
        </div>

        {/* Correspondences section */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="p-3 bg-indigo-900/30 rounded-lg">
            <h5 className="text-sm text-yellow-400 mb-1">Correspondencias</h5>
            <div className="text-sm text-purple-200">
              {card.element && <div><span className="text-purple-400">Elemento:</span> {card.element}</div>}
              {card.suit && <div><span className="text-purple-400">Naipe:</span> {card.suit}</div>}
              {card.number && <div><span className="text-purple-400">Numero:</span> {card.number}</div>}
            </div>
          </div>
          <div className="p-3 bg-indigo-900/30 rounded-lg">
            <h5 className="text-sm text-yellow-400 mb-1">No Livro de Thoth</h5>
            <div className="text-sm text-purple-200">
              <div><span className="text-purple-400">Nome em ingles:</span> {card.englishName}</div>
              <div><span className="text-purple-400">Categoria:</span> {
                card.category === 'major'
                  ? 'Arcanos Maiores'
                  : card.category === 'court'
                    ? 'Cartas da Corte'
                    : 'Arcanos Menores'
              }</div>
            </div>
          </div>
        </div>

        {/* AI Interpretation Section */}
        <div className="mt-4 p-4 bg-indigo-900/40 rounded-lg border border-purple-700/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg text-yellow-400 flex items-center">
              <Bot className="w-4 h-4 mr-2" />
              Interpretacao pelo {agentInfo.name} (Persona: Aleister Crowley)
            </h4>
            {/* Bridge status indicator */}
            <div className="flex items-center gap-1.5 text-xs">
              {bridgeHealth ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-300">Ponte ativa</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-orange-300">Ponte offline</span>
                </>
              )}
            </div>
          </div>

          {/* Initial state */}
          {waitState === 'idle' && !aiInterpretation && (
            <div>
              <p className="text-purple-300 text-sm mb-3">
                {bridgeHealth
                  ? 'Clique para receber a interpretacao automatica. O prompt sera enviado ao ChatGPT pela ponte local e a resposta sera capturada automaticamente.'
                  : 'A ponte local nao esta ativa. Voce pode usar o modo manual abaixo ou iniciar a ponte local no seu computador.'}
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleAskAgent}
                  disabled={!bridgeHealth}
                  className="px-4 py-2 bg-yellow-500 text-indigo-900 rounded-md hover:bg-yellow-400 transition flex items-center text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Interpretar Automaticamente
                </button>
                <button
                  onClick={() => { setShowManualPaste(true); setWaitState('manual'); }}
                  className="px-4 py-2 bg-indigo-700 text-yellow-300 rounded-md hover:bg-indigo-600 transition flex items-center text-sm"
                >
                  <ClipboardPaste className="w-4 h-4 mr-2" />
                  Modo Manual
                </button>
              </div>
            </div>
          )}

          {/* Processing states */}
          {isProcessing && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
              <span className="text-purple-200 text-sm text-center">
                {STATUS_LABELS[waitState] || 'Processando...'}
              </span>
            </div>
          )}

          {/* Bridge offline */}
          {waitState === 'bridge_offline' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-orange-300">
                <WifiOff className="w-5 h-5 text-orange-400" />
                <span className="text-sm">Ponte local nao encontrada. Inicie o servico Python no seu computador para automatizar, ou use o modo manual.</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleAskAgent}
                  className="px-3 py-1.5 bg-yellow-500 text-indigo-900 rounded-md hover:bg-yellow-400 transition flex items-center text-xs"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Verificar Ponte
                </button>
                <button
                  onClick={() => { setShowManualPaste(true); setWaitState('manual'); }}
                  className="px-3 py-1.5 bg-indigo-700 text-yellow-300 rounded-md hover:bg-indigo-600 transition flex items-center text-xs"
                >
                  <ClipboardPaste className="w-4 h-4 mr-1" />
                  Modo Manual
                </button>
              </div>
            </div>
          )}

          {/* Error state */}
          {waitState === 'failed' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-orange-300">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                <span className="text-sm">{errorMsg}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAskAgent} className="px-4 py-2 bg-yellow-500 text-indigo-900 rounded-md hover:bg-yellow-400 transition flex items-center text-sm">
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
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap mb-2">
                <button
                  onClick={handleCopyPrompt}
                  className="px-3 py-1.5 bg-indigo-700 text-yellow-300 rounded-md hover:bg-indigo-600 transition flex items-center text-xs"
                >
                  {copyStatus === 'copied' ? <Check className="w-4 h-4 mr-1" /> : <ClipboardPaste className="w-4 h-4 mr-1" />}
                  {copyStatus === 'copied' ? 'Copiado!' : 'Copiar Prompt'}
                </button>
                <button
                  onClick={openChatGPTConversation}
                  className="px-3 py-1.5 bg-purple-700 text-yellow-300 rounded-md hover:bg-purple-600 transition flex items-center text-xs"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Abrir ChatGPT
                </button>
              </div>
              <p className="text-purple-400 text-xs">Cole o prompt no ChatGPT, envie, copie a resposta e cole abaixo.</p>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={`Cole aqui a interpretacao de ${card.name} recebida do ChatGPT...`}
                className="w-full p-3 rounded-md bg-indigo-900 border border-purple-700 text-purple-100 text-sm min-h-[120px] focus:outline-none focus:border-yellow-500"
              />
              <div className="flex gap-2">
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
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* AI Interpretation display with TTS */}
          {aiInterpretation && waitState === 'completed' && (
            <div>
              <div className="flex items-start gap-2 mb-3">
                <button
                  onClick={() => (isSpeaking ? stopSpeaking() : speakText(aiInterpretation))}
                  className="mt-1 p-1.5 rounded-full hover:bg-purple-700/50 transition-colors flex-shrink-0"
                  title="Ouvir interpretacao"
                >
                  {isSpeaking ? <VolumeX className="w-5 h-5 text-yellow-400" /> : <Volume2 className="w-5 h-5 text-yellow-400" />}
                </button>
                <div className="bg-indigo-800/50 text-yellow-200 rounded-lg p-3 flex-1 whitespace-pre-wrap text-sm leading-relaxed">
                  {aiInterpretation}
                </div>
              </div>
              <button
                onClick={() => { setAiInterpretation(null); setWaitState('idle'); }}
                className="px-3 py-1.5 bg-indigo-700 text-yellow-300 rounded-md hover:bg-indigo-600 transition flex items-center text-xs"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Nova Interpretacao
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
