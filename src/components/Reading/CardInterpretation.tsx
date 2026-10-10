import React, { useState, useRef } from 'react';
import { ReadingCard } from '../../types/tarot';
import { Eye, Star, Bot, Volume2, VolumeX, Send, ExternalLink, ClipboardPaste, Check, Loader2, Clock, AlertCircle, Link2 } from 'lucide-react';
import { AgentType, AGENTS, buildCardPrompt, sendToAgentAndWait, sendViaUrl, AgentWaitStatus, CardInterpretationRequest } from '../../services/agentService';

interface CardInterpretationProps {
  readingCard: ReadingCard | null;
  selectedAgent: AgentType;
  question: string;
  spreadType: string;
  userName?: string;
  birthDate?: string;
}

type WaitState = 'idle' | 'sending' | 'waiting' | 'received' | 'timeout' | 'manual';

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
  const [pasteText, setPasteText] = useState('');
  const [showManualPaste, setShowManualPaste] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const lastPromptRef = useRef<string>('');
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
      question: question || 'Qual é a revelação do universo?',
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

  const handleAskAgent = async () => {
    const req = buildRequest();
    if (!req) return;
    const prompt = buildCardPrompt(req);
    lastPromptRef.current = prompt;
    setAiInterpretation(null);
    setWaitState('sending');

    const response = await sendToAgentAndWait(selectedAgent, prompt, (status: AgentWaitStatus) => {
      if (status.state === 'waiting') setWaitState('waiting');
      else if (status.state === 'checking') setWaitState('waiting');
    });

    if (response && response.length > 20) {
      setAiInterpretation(response);
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
    setAiInterpretation(text);
    setPasteText('');
    setShowManualPaste(false);
    setWaitState('received');
    speakText(text);
  };

  const handleCopyPrompt = async () => {
    const req = buildRequest();
    if (!req) return;
    const prompt = buildCardPrompt(req);
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      // ignore
    }
  };

  if (!readingCard) {
    return (
      <div className="p-6 bg-indigo-950/50 rounded-lg text-center">
        <p className="text-purple-300">Selecione uma carta para ver sua interpretação.</p>
      </div>
    );
  }

  const { card, position, isReversed, interpretation } = readingCard;
  const agentInfo = AGENTS[selectedAgent];

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
            <span
              key={index}
              className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded-full"
            >
              {keyword}
            </span>
          ))}
        </div>

        {/* Position meaning */}
        <div className="mb-4">
          <h4 className="text-lg text-yellow-400 flex items-center mb-2">
            <Eye className="w-4 h-4 mr-2" />
            Significado na Posição
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
            Interpretação de Crowley
          </h4>
          <div className="pl-4 border-l-2 border-yellow-700">
            <p className="text-purple-200">{interpretation}</p>
            {isReversed && (
              <p className="mt-2 text-purple-300 italic">
                A inversão da carta intensifica as qualidades desafiadoras ou inverte as energias tradicionais,
                conforme as correspondências astrológicas opostas descritas por Crowley.
              </p>
            )}
          </div>
        </div>

        {/* Correspondences section */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="p-3 bg-indigo-900/30 rounded-lg">
            <h5 className="text-sm text-yellow-400 mb-1">Correspondências</h5>
            <div className="text-sm text-purple-200">
              {card.element && <div><span className="text-purple-400">Elemento:</span> {card.element}</div>}
              {card.suit && <div><span className="text-purple-400">Naipe:</span> {card.suit}</div>}
              {card.number && <div><span className="text-purple-400">Número:</span> {card.number}</div>}
            </div>
          </div>
          <div className="p-3 bg-indigo-900/30 rounded-lg">
            <h5 className="text-sm text-yellow-400 mb-1">No Livro de Thoth</h5>
            <div className="text-sm text-purple-200">
              <div><span className="text-purple-400">Nome em inglês:</span> {card.englishName}</div>
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

        {/* AI Agent Interpretation Section */}
        <div className="mt-4 p-4 bg-indigo-900/40 rounded-lg border border-purple-700/30">
          <h4 className="text-lg text-yellow-400 flex items-center mb-3">
            <Bot className="w-4 h-4 mr-2" />
            Interpretação pelo {agentInfo.name} (Persona: Aleister Crowley)
          </h4>

          {/* Initial state - button to send to agent */}
          {waitState === 'idle' && !aiInterpretation && (
            <div>
              <p className="text-purple-300 text-sm mb-3">
                Envie esta carta para o {agentInfo.name} interpretar como Aleister Crowley.
                O prompt será copiado, o agente abrirá, e o site aguardará sua resposta automaticamente.
              </p>
              <button
                onClick={handleAskAgent}
                className="px-4 py-2 bg-yellow-500 text-indigo-900 rounded-md hover:bg-yellow-400 transition flex items-center text-sm font-medium"
              >
                <Bot className="w-4 h-4 mr-2" />
                Enviar carta para {agentInfo.name}
              </button>
            </div>
          )}

          {/* Sending state */}
          {waitState === 'sending' && (
            <div className="flex items-center gap-3 text-purple-200">
              <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
              <span className="text-sm">Preparando prompt e abrindo {agentInfo.name}...</span>
            </div>
          )}

          {/* Waiting state - watching clipboard */}
          {waitState === 'waiting' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-purple-200">
                <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span className="text-sm">
                  Aguardando resposta do {agentInfo.name}...
                </span>
              </div>
              <div className="p-3 bg-indigo-950/50 rounded-md border border-purple-700/30">
                <p className="text-purple-300 text-xs mb-2">
                  O prompt foi copiado e o <strong className="text-yellow-300">{agentInfo.name}</strong> foi aberto em nova aba.
                </p>
                <ol className="text-purple-400 text-xs space-y-1 list-decimal pl-4 mb-3">
                  <li>Cole o prompt no {agentInfo.name} (Ctrl+V) e aguarde a resposta.</li>
                  <li>Selecione e copie a resposta gerada (Ctrl+C).</li>
                  <li>Volte para esta aba do Tarot — a resposta será capturada automaticamente.</li>
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
                    onClick={() => { const req = buildRequest(); if (req) sendViaUrl(selectedAgent, buildCardPrompt(req)); }}
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
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-orange-300">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                <span className="text-sm">Tempo esgotado aguardando resposta automática.</span>
              </div>
              <p className="text-purple-300 text-xs">
                Você pode colar a resposta manualmente abaixo, ou reenviar para o agente.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleAskAgent}
                  className="px-4 py-2 bg-yellow-500 text-indigo-900 rounded-md hover:bg-yellow-400 transition flex items-center text-sm"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Reenviar para {agentInfo.name}
                </button>
              </div>
            </div>
          )}

          {/* Manual paste area */}
          {showManualPaste && waitState !== 'received' && (
            <div className="mt-3">
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={`Cole aqui a interpretação de ${card.name} recebida do ${agentInfo.name}...`}
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
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* AI Interpretation display with TTS */}
          {aiInterpretation && waitState === 'received' && (
            <div>
              <div className="flex items-start gap-2 mb-3">
                <button
                  onClick={() => (isSpeaking ? stopSpeaking() : speakText(aiInterpretation))}
                  className="mt-1 p-1.5 rounded-full hover:bg-purple-700/50 transition-colors flex-shrink-0"
                  title="Ouvir interpretação"
                >
                  {isSpeaking ? (
                    <VolumeX className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-yellow-400" />
                  )}
                </button>
                <div className="bg-indigo-800/50 text-yellow-200 rounded-lg p-3 flex-1 whitespace-pre-wrap text-sm leading-relaxed">
                  {aiInterpretation}
                </div>
              </div>
              <button
                onClick={() => {
                  setAiInterpretation(null);
                  setWaitState('idle');
                }}
                className="px-3 py-1.5 bg-indigo-700 text-yellow-300 rounded-md hover:bg-indigo-600 transition flex items-center text-xs"
              >
                <Bot className="w-4 h-4 mr-1" />
                Nova Interpretação
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
