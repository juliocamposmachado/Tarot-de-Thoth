import React, { useState, useEffect, useRef } from 'react';
import { ReadingCard } from '../../types/tarot';
import { AgentType, AGENTS } from '../../services/agentService';
import { fetchInterpretation, InterpretRequestPayload } from '../../tarot/api/tarot-client';
import { SpreadId, RevealedCard } from '../../tarot/domain/types';
import { Sparkles, Volume2, VolumeX, Send, Bot, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

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

type WaitState = 'idle' | 'loading' | 'received' | 'error';

export const CrowleyInterpreter: React.FC<Props> = ({ reading, readingState, selectedAgent }) => {
  const [messages, setMessages] = useState<Array<{type: 'user' | 'crowley', text: string}>>([]);
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [waitState, setWaitState] = useState<WaitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [autoStarted, setAutoStarted] = useState(false);
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
    if (reading && readingState === 'complete' && messages.length === 0 && waitState === 'idle' && !autoStarted) {
      handleInitialInterpretation();
    }
    return () => {
      synthesis.cancel();
    };
  }, [reading, readingState]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildPayload = (qOverride?: string): InterpretRequestPayload => {
    const spreadIdMap: Record<string, SpreadId> = {
      'three-card': 'three-card',
      'celtic-cross': 'celtic-cross',
      'tree-of-life': 'tree-of-life',
    };
    const spreadId: SpreadId = spreadIdMap[reading!.spreadType] || 'three-card';

    const cards: RevealedCard[] = reading!.cards.map((c, i) => ({
      cardId: c.card.id,
      position: c.position.id as RevealedCard['position'],
      orientation: c.isReversed ? 'reversed' : 'upright',
      displayOrder: i,
    }));

    return {
      consultant: {
        name: reading!.userName || 'Consulente',
        birthDate: reading!.birthDate,
        language: 'pt-BR',
        question: qOverride || reading!.question || 'Qual e a revelacao do universo?',
      },
      spreadId,
      cards,
      options: {
        includeCorrespondences: true,
        includeSynthesis: true,
        spokenProse: true,
      },
    };
  };

  const formatInterpretation = (result: { interpretation: { introduction: string; synthesis: string; guidance: string; cards: Array<{ title: string; meaning: string }> } }): string => {
    const parts: string[] = [];
    if (result.interpretation.introduction) parts.push(result.interpretation.introduction);
    for (const card of result.interpretation.cards) {
      if (card.meaning) parts.push(`${card.title}: ${card.meaning}`);
    }
    if (result.interpretation.synthesis) parts.push(result.interpretation.synthesis);
    if (result.interpretation.guidance) parts.push(result.interpretation.guidance);
    return parts.join('\n\n');
  };

  const handleInitialInterpretation = async () => {
    setAutoStarted(true);
    setWaitState('loading');
    setErrorMsg('');

    try {
      const result = await fetchInterpretation(buildPayload());
      const text = formatInterpretation(result);
      if (text && text.length > 20) {
        setMessages([{ type: 'crowley', text }]);
        setWaitState('received');
        speakText(text);
      } else {
        setWaitState('error');
        setErrorMsg('A interpretacao retornou conteudo insuficiente. Tente novamente.');
      }
    } catch (err) {
      setWaitState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Nao foi possivel obter a interpretacao. Tente novamente.');
    }
  };

  const handleSendFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !reading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    stopSpeaking();

    setWaitState('loading');
    setErrorMsg('');

    fetchInterpretation(buildPayload(userMessage)).then((result) => {
      const text = formatInterpretation(result);
      if (text && text.length > 20) {
        setMessages(prev => [...prev, { type: 'crowley', text }]);
        setWaitState('received');
        speakText(text);
      } else {
        setWaitState('error');
        setErrorMsg('Nao foi possivel obter a resposta. Tente novamente.');
      }
    }).catch(() => {
      setWaitState('error');
      setErrorMsg('Nao foi possivel obter a resposta. Tente novamente.');
    });
  };

  if (!reading || readingState !== 'complete') {
    return null;
  }

  const agentInfo = AGENTS[selectedAgent];
  const isLoading = waitState === 'loading';

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

      {/* Loading state - automatic */}
      {isLoading && (
        <div className="mb-4 flex items-center gap-3 text-purple-200 p-4 bg-indigo-900/40 rounded-lg">
          <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
          <span className="text-sm">Consultando o oraculo... aguarde a interpretacao automatica.</span>
        </div>
      )}

      {/* Error state */}
      {waitState === 'error' && (
        <div className="mb-4 p-4 bg-indigo-900/40 rounded-lg border border-orange-700/30 space-y-3">
          <div className="flex items-center gap-3 text-orange-300">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            <span className="text-sm">{errorMsg}</span>
          </div>
          <button
            onClick={() => {
              if (messages.length === 0) {
                handleInitialInterpretation();
              } else {
                setWaitState('idle');
              }
            }}
            className="px-4 py-2 bg-yellow-500 text-indigo-900 rounded-md hover:bg-yellow-400 transition flex items-center text-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </button>
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
          disabled={isLoading}
          className="flex-1 bg-indigo-900/30 border border-purple-700/30 rounded-lg px-4 py-2 text-purple-100 placeholder-purple-400 focus:outline-none focus:border-purple-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-yellow-500 text-indigo-900 px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};
