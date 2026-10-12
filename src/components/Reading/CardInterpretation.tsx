import React, { useState } from 'react';
import { ReadingCard } from '../../types/tarot';
import { Eye, Star, Bot, Volume2, VolumeX, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { AgentType, AGENTS, buildCardPrompt, sendToAgentAndWait, CardInterpretationRequest } from '../../services/agentService';

interface CardInterpretationProps {
  readingCard: ReadingCard | null;
  selectedAgent: AgentType;
  question: string;
  spreadType: string;
  userName?: string;
  birthDate?: string;
}

type WaitState = 'idle' | 'loading' | 'received' | 'error';

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
    setAiInterpretation(null);
    setWaitState('loading');
    setErrorMsg('');

    const response = await sendToAgentAndWait(selectedAgent, prompt);

    if (response && response.length > 20) {
      setAiInterpretation(response);
      setWaitState('received');
      speakText(response);
    } else {
      setWaitState('error');
      setErrorMsg('Nao foi possivel obter a interpretacao. Tente novamente.');
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

          {/* Initial state - button to request interpretation */}
          {waitState === 'idle' && !aiInterpretation && (
            <div>
              <p className="text-purple-300 text-sm mb-3">
                Clique para receber a interpretação automática desta carta. A resposta sera gerada e lida em voz alta automaticamente.
              </p>
              <button
                onClick={handleAskAgent}
                className="px-4 py-2 bg-yellow-500 text-indigo-900 rounded-md hover:bg-yellow-400 transition flex items-center text-sm font-medium"
              >
                <Bot className="w-4 h-4 mr-2" />
                Interpretar com {agentInfo.name}
              </button>
            </div>
          )}

          {/* Loading state - automatic, no user action needed */}
          {waitState === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
              <span className="text-purple-200 text-sm text-center">
                Consultando o oraculo... aguarde a interpretacao automatica.
              </span>
            </div>
          )}

          {/* Error state */}
          {waitState === 'error' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-orange-300">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                <span className="text-sm">{errorMsg}</span>
              </div>
              <button
                onClick={handleAskAgent}
                className="px-4 py-2 bg-yellow-500 text-indigo-900 rounded-md hover:bg-yellow-400 transition flex items-center text-sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </button>
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
                <RefreshCw className="w-4 h-4 mr-1" />
                Nova Interpretação
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
