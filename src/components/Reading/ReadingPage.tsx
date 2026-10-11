import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SpreadLayout } from './SpreadLayout';
import { CardInterpretation } from './CardInterpretation';
import { spreads as allSpreads, getSpreadById } from '../../data/spreads';
import { Reading, SpreadType, ReadingCard, TarotCard } from '../../types/tarot';
import { majorArcana } from '../../data/majorArcana';
import { minorArcana } from '../../data/minorArcana';
import { courtCards } from '../../data/courtCards';
import { generateInterpretation } from '../../data/spreads';
import { shuffle } from 'lodash';
import { BookOpen, Save, Eye, HelpCircle, Shuffle, ImageIcon, ShoppingCart, ChevronDown, ChevronUp, Layout, Bot } from 'lucide-react';
import { TarotCardComponent } from '../TarotCard';
import { useSound } from '../../hooks/useSound';
import { CrowleyInterpreter } from './CrowleyInterpreter';
import { BuyDeckModal } from '../BuyDeckModal';
import { getUserData, saveUserData, updateUserData, UserData } from '../../services/userStorage';
import { AgentType, AGENT_LIST, AGENTS } from '../../services/agentService';
const spreadGuidance = {
  'three-card': "O método de três cartas é uma forma simples mas poderosa de obter clareza. Na visão de Crowley, representa o fluxo da energia através do tempo: passado (causa), presente (manifestação) e futuro (tendência). Concentre-se na questão enquanto as cartas são embaralhadas.",
  'celtic-cross': "A Cruz Celta, na interpretação thelêmica, representa a interação das forças em múltiplos planos. O centro é o cruzamento dos pilares da Árvore da Vida, enquanto as seis cartas ao redor mostram as influências planetárias. Visualize a questão no centro de sua consciência.",
  'tree-of-life': "A Árvore da Vida é o mapa completo do universo segundo a Qabalah. Crowley ensinou que cada Sephirah representa um aspecto da questão, desde sua origem divina (Kether) até sua manifestação material (Malkuth). Esta leitura requer profunda contemplação das correspondências."
};

// Reading states
type ReadingState = 'initial' | 'shuffling' | 'drawing' | 'revealing' | 'complete';

export const ReadingPage: React.FC = () => {
  const [spreadType, setSpreadType] = useState<SpreadType>(getSpreadById('three-card'));
  const [reading, setReading] = useState<Reading | null>(null);
  const [selectedCard, setSelectedCard] = useState<ReadingCard | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean[]>([]);
  const [readingState, setReadingState] = useState<ReadingState>('initial');
  const [question, setQuestion] = useState<string>('');
  const [savedReadings, setSavedReadings] = useState<Reading[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState<boolean>(false);
  const [showBuyDeckModal, setShowBuyDeckModal] = useState<boolean>(false);
  const [expandedSpread, setExpandedSpread] = useState<string | null>(null);
  const [methodsExpanded, setMethodsExpanded] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('chatgpt');

  
  // Refs for animations
  const deckRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSound();
  
  const allCards: TarotCard[] = [...majorArcana, ...courtCards, ...minorArcana];

  // Function to collect user info before starting reading
  const initiateReading = () => {
    if (!question.trim()) {
      alert("Por favor, insira uma questão antes de começar a leitura.");
      return;
    }

    // Show user info modal
    setShowUserInfoModal(true);
  };

  // Function to start the reading process after collecting user info
  const startReading = () => {
    // Close modal
    setShowUserInfoModal(false);
    
    // Begin shuffling animation
    setReadingState('shuffling');
    playSound('shuffle');
    
    // Simulate shuffling with a timeout
    setTimeout(() => {
      const shuffledDeck = shuffle(allCards);
      const newReadingCards = spreadType.positions.map((position, index) => {
        const card = shuffledDeck[index];
        const isReversed = Math.random() < 0.25;
        return {
          card,
          position,
          isReversed,
          interpretation: generateInterpretation(card.id, position.id)
        };
      }) as ReadingCard[];

      const newReading = {
        id: `reading-${Date.now()}`,
        date: new Date(),
        spreadType: spreadType.id,
        question: question,
        cards: newReadingCards,
        userName: userName,
        birthDate: birthDate
      };

      setReading(newReading);
      setIsRevealed(new Array(newReadingCards.length).fill(false));
      setCurrentCardIndex(0);
      setReadingState('drawing');
      
      // Start revealing cards after a delay
      setTimeout(() => {
        setReadingState('revealing');
      }, 2500); // Changed from 1500 to 2500 for a more dramatic pause before revealing
    }, 2000);
  };

  // Reveal cards progressively
  useEffect(() => {
    if (readingState === 'revealing' && reading && currentCardIndex < reading.cards.length) {
      const timer = setTimeout(() => {
        revealCard(currentCardIndex);
        setCurrentCardIndex(prev => prev + 1);
        
        // If all cards are revealed, set state to complete
        if (currentCardIndex === reading.cards.length - 1) {
          setReadingState('complete');
        }
      }, 2000); // Changed from 800 to 2000 for slower, more dramatic reveal
      
      return () => clearTimeout(timer);
    }
  }, [readingState, currentCardIndex, reading]);

  // Reveal a specific card
  const revealCard = (index: number) => {
    if (!reading) return;
    
    playSound('reveal');
    const newIsRevealed = [...isRevealed];
    newIsRevealed[index] = true;
    setIsRevealed(newIsRevealed);
  };
  
  // Save the current reading
  const saveReading = () => {
    if (!reading) return;
    
    const updatedSavedReadings = [...savedReadings, reading];
    setSavedReadings(updatedSavedReadings);
    
    // Save to localStorage
    try {
      localStorage.setItem('savedTarotReadings', JSON.stringify(updatedSavedReadings));
      alert('Leitura salva com sucesso!');
    } catch (error) {
      console.error('Error saving reading:', error);
      alert('Erro ao salvar a leitura.');
    }
  };
  
  // Load saved readings on component mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('savedTarotReadings');
      if (savedData) {
        setSavedReadings(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading saved readings:', error);
    }

    // Load user data from localStorage
    const storedUserData = getUserData();
    if (storedUserData) {
      setUserData(storedUserData);
      setUserName(storedUserData.name);
      setBirthDate(storedUserData.birthDate);
    }
  }, []);
  
  // Reset reading
  const resetReading = () => {
    setReading(null);
    setSelectedCard(null);
    setIsRevealed([]);
    setReadingState('initial');
    setCurrentCardIndex(0);
    // Keep user info for next reading
  };

  // Render user info modal
  const renderUserInfoModal = () => {
    if (!showUserInfoModal) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-indigo-950/90 p-4">
        <div className="bg-indigo-900 p-6 rounded-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center">
            Informações para Leitura
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-purple-300 mb-2">Seu Nome:</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Digite seu nome completo"
                className="w-full p-3 rounded-md bg-indigo-900 border border-purple-800 text-purple-300"
              />
            </div>
            
            <div>
              <label className="block text-purple-300 mb-2">Data de Nascimento:</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full p-3 rounded-md bg-indigo-900 border border-purple-800 text-purple-300"
              />
            </div>
            
            <p className="text-purple-400 text-xs mt-2">
              "Estas informações serão usadas para personalizar sua leitura de Tarot."
            </p>
            
            <div className="mt-4 pt-4 border-t border-purple-800/40">
              <label className="block text-purple-300 mb-2 flex items-center text-sm">
                <Bot className="w-4 h-4 mr-2 text-yellow-400/80" />
                Agente de Interpretação (Cérebro do site):
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => {
                  setSelectedAgent(e.target.value as AgentType);
                }}
                className="w-full p-3 rounded-md bg-indigo-900 border border-purple-800 text-purple-300"
              >
                {AGENT_LIST.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name} — {agent.description}</option>
                ))}
              </select>
              <p className="text-purple-400 text-xs mt-2 mb-3">
                A interpretacao sera enviada automaticamente ao ChatGPT pela ponte local no seu computador. Sem copiar, sem colar, sem API paga.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <button 
              className="flex-1 px-4 py-2 bg-indigo-800 text-white rounded-md hover:bg-indigo-700 transition"
              onClick={() => setShowUserInfoModal(false)}
            >
              Cancelar
            </button>
            <button 
              className="flex-1 px-4 py-2 bg-purple-800 text-white rounded-md hover:bg-purple-700 transition"
              onClick={() => {
                // Save or update user data
                const newUserData: UserData = { name: userName, birthDate: birthDate };
                if (userData) {
                  updateUserData(newUserData);
                } else {
                  saveUserData(newUserData);
                }
                startReading();
              }}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render shuffle animation
  const renderShuffleAnimation = () => {
    if (readingState !== 'shuffling') return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-indigo-950/80">
        <div className="text-center">
          <div className="relative w-32 h-48 mx-auto mb-4">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-24 h-36 bg-indigo-800 border-2 border-yellow-500 rounded-lg shadow-lg animate-shuffle"
                style={{ 
                  animationDelay: `${i * 0.1}s`,
                  transform: `rotate(${Math.random() * 10 - 5}deg) translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`
                }}
              />
            ))}
            <Shuffle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-400 w-12 h-12 animate-pulse" />
          </div>
          <p className="text-yellow-400 text-xl font-medium">Embaralhando...</p>
          <p className="text-purple-300 mt-2">Concentre-se em sua questão</p>
        </div>
      </div>
    );
  };

  // Render instructions modal
  const renderInstructions = () => {
    if (!showInstructions) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-indigo-950/90 p-4">
        <div className="bg-indigo-900 p-6 rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center">
            <BookOpen className="w-6 h-6 mr-2" />
            Instruções de Leitura Segundo Crowley
          </h2>
          
          <div className="space-y-4 text-purple-200">
            <p>
              Aleister Crowley desenvolveu o Tarot de Thoth como um sistema completo de iniciação mágica. 
              Ao realizar uma leitura, siga estas orientações para obter resultados mais profundos:
            </p>
            
            <ol className="list-decimal pl-5 space-y-2">
              <li>Concentre-se em sua Vontade Verdadeira (Thelema) ao formular a pergunta.</li>
              <li>Visualize a questão como uma força que se manifesta através do Aeon de Horus.</li>
              <li>Pense nas cartas como reflexos da sua consciência, não como forças externas.</li>
              <li>Estude as correspondências astrológicas, cabalísticas e elementais de cada carta.</li>
              <li>Observe os padrões e relacionamentos entre as cartas, não apenas seus significados isolados.</li>
            </ol>
            
            <div className="pt-4 border-t border-purple-800">
              <h3 className="text-xl text-yellow-400 mb-2">Preparação Ritual</h3>
              <p>
                "O ato de embaralhar as cartas deve ser executado com plena consciência mágica. 
                Os resultados não são 'sorte', mas a manifestação das forças sutis que atravessam o véu da matéria."
                <span className="block mt-1 text-right">— Aleister Crowley, O Livro de Thoth</span>
              </p>
            </div>
          </div>
          
          <button 
            className="mt-6 px-4 py-2 bg-purple-800 text-white rounded-md hover:bg-purple-700 transition w-full"
            onClick={() => setShowInstructions(false)}
          >
            Fechar
          </button>
        </div>
      </div>
    );
  };

  // Function to render the contribution section that will be visible before and after readings
  const renderContributionButtons = () => {
    return (
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-indigo-900/40 rounded-lg border border-purple-800/30">
        <div className="text-center mb-2">
          <h3 className="text-base sm:text-lg text-yellow-400 font-medium">Contribua com o Projeto</h3>
          <p className="text-purple-300 text-xs sm:text-sm mb-2">
            Suas contribuições ajudam a manter e melhorar este oráculo de Tarot.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {/* PIX Contribution Button */}
          {/* PIX Contribution Button */}
          <div className="flex-1 min-w-[150px] max-w-[250px]">
            <button 
              onClick={() => {
                navigator.clipboard.writeText('juliocamposmachado@gmail.com');
                const el = document.createElement('div');
                el.className = 'fixed top-4 right-4 bg-yellow-400 text-indigo-900 px-4 py-2 rounded shadow-lg z-50';
                el.textContent = 'Chave PIX copiada!';
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 2000);
              }}
              className="w-full inline-flex items-center justify-center px-3 sm:px-3.5 py-1.5 bg-indigo-800 hover:bg-indigo-700 text-yellow-300 rounded-md transition-all shadow-md text-2xs sm:text-sm border border-purple-600/40 hover:border-purple-500/60 hover:shadow-purple-600/20 hover:translate-y-[-1px] group"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 group-hover:text-yellow-200 transition-colors flex-shrink-0" viewBox="0 0 512 512" fill="currentColor">
                <path d="M112.57 391.19c20.03-30.73 50.48-56.05 86.78-56.05 20.62 0 32.7 7.45 48.51 20.69 16.55 13.81 33.18 31.4 61.28 31.4 35.17 0 65.36-22.16 86.78-54.35-87.02 19.03-95.89-42.92-95.89-42.92 37.98 7.01 57.14 20.31 67.59 34.75 29.88-25.78 71.8-15.72 71.8-15.72-27.47-45.97-75.73-70.77-122.17-70.77-27.75 0-42.51 10.34-57.43 21.31-14.1 10.36-28.59 21.46-52.36 21.46-36.3 0-66.75-25.32-86.78-56.05 0 0 42.13-46.84 113.29-46.84 30.04 0 49.34 6.01 66.04 14.39 44.42-24.48 90.8-17.36 90.8-17.36-20.86-35.54-63.13-55.73-103.18-55.73-65.64 0-108.7 39.94-127.28 75.39-18.58-35.44-61.64-75.39-127.28-75.39-40.67 0-82.96 20.55-103.24 56.54 0 0 46.73-7.83 91.27 17.05 16.76-8.85 36.12-15.45 66.82-15.45 68.33 0 112.91 45.32 112.91 45.32-20.03 30.73-50.48 56.05-86.78 56.05-23.11 0-37.92-10.47-52.37-20.8-14.9-10.65-29.63-21.97-57.42-21.97-46.44 0-94.7 24.8-122.17 70.77 0 0 41.92-10.06 71.8 15.72 10.45-14.44 29.61-27.74 67.59-34.75 0 0-8.87 61.95-95.89 42.92 21.42 32.19 51.61 54.35 86.78 54.35 28.1 0 44.73-17.59 61.28-31.4 15.82-13.24 27.89-20.69 48.51-20.69 36.3 0 66.75 25.32 86.78 56.05z"/>
              </svg>
              <span className="group-hover:text-yellow-200 transition-colors">Contribuir via PIX</span>
            </button>
            <p className="text-purple-300 text-[0.6rem] sm:text-2xs text-center mt-1 contribution-email">juliocamposmachado@gmail.com</p>
          </div>
          
          {/* PayPal Contribution Button */}
          <div className="flex-1 min-w-[150px] max-w-[250px]">
            <a 
              href="https://paypal.me/radiotatuapefm" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center px-3 sm:px-3.5 py-1.5 bg-indigo-800 hover:bg-indigo-700 text-yellow-300 rounded-md transition-all shadow-md text-2xs sm:text-sm border border-purple-600/40 hover:border-purple-500/60 hover:shadow-purple-600/20 hover:translate-y-[-1px] group"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 group-hover:text-yellow-200 transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.384a.77.77 0 0 1 .757-.651h6.737c2.299 0 3.9.62 4.759 1.834.79 1.13.802 2.614.035 4.177-.056.115-.099.23-.148.345.702.232 1.257.567 1.657 1.007.811.902 1.094 2.17.845 3.776-.304 1.97-1.286 3.554-2.685 4.394-1.332.801-2.958 1.071-4.77 1.071h-.505l-.362 2.009a.77.77 0 0 1-.757.651H7.076v-.026Z" />
                <path d="M12.651 9.028c.107-.632.504-2.745-1.163-2.745H7.683a.642.642 0 0 0-.633.747l1.663 10.423h2.874l.571-3.172h1.236c.594 0 1.042-.234 1.314-.691.272-.456.318-1.057.143-1.811-.176-.747-.422-1.583-.729-2.331-.308-.747-.641-1.162-.984-1.283-.343-.12-.744-.177-1.2-.177-.457 0-.817.04-1.075.12-.257.08-.358.32-.358.32s.053-.32.339-.587c.285-.268.716-.401 1.29-.401.574 0 1.074.16 1.498.48.425.32.762.882.98 1.688.22.806.255 1.474.22 2.003-.034.53-.162.955-.38 1.275-.22.32-.574.48-1.062.48h-1.245l.482-3.1-.196-1.142Z" />
              </svg>
              <span className="group-hover:text-yellow-200 transition-colors">Contribuir via PayPal</span>
            </a>
            <p className="text-purple-300 text-[0.6rem] sm:text-2xs text-center mt-1 contribution-email">radiotatuapefm@gmail.com</p>
          </div>
        </div>
      </div>
    );
  };

  // Function to render spread explanations
  const renderSpreadExplanations = () => {
    return (
      <div className="mb-4 sm:mb-6 bg-indigo-950/50 rounded-lg border border-purple-800/30 overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-purple-800/30">
          <div className="flex justify-between items-center">
            <h3 className="text-base sm:text-lg text-yellow-400 font-medium flex items-center">
              <Layout className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-400/80" />
              Sobre os métodos de leitura
            </h3>
            <button 
              onClick={() => setMethodsExpanded(!methodsExpanded)} 
              className="text-purple-300 hover:text-yellow-400 transition-colors"
            >
              {methodsExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-purple-300 text-xs sm:text-sm mt-1">
            Cada método utiliza um arranjo específico de cartas para revelar diferentes aspectos da sua questão.
          </p>
        </div>
        
        {methodsExpanded && (
          <div>
            {/* Three Card Spread */}
            <div className="border-b border-purple-800/30">
              <button 
                className="w-full p-3 sm:p-4 text-left flex justify-between items-center hover:bg-indigo-900/30 transition-colors"
                onClick={() => setExpandedSpread(expandedSpread === 'three-card' ? null : 'three-card')}
          >
            <div className="flex items-center">
              <span className="inline-block w-6 h-6 bg-indigo-800 rounded-full text-center text-yellow-400 text-xs font-medium mr-2">3</span>
              <span className="text-purple-200 font-medium">Tiragem de Três Cartas</span>
            </div>
            {expandedSpread === 'three-card' ? (
              <ChevronUp className="w-5 h-5 text-purple-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-purple-400" />
            )}
          </button>
          
          {expandedSpread === 'three-card' && (
            <div className="p-3 sm:p-4 bg-indigo-900/20">
              <div className="space-y-2 sm:space-y-3 text-purple-300 text-sm">
                <p>
                  A tiragem de três cartas é um dos métodos mais fundamentais e versáteis do Tarot. Segundo Aleister Crowley, 
                  representa o fluxo do tempo através das três dimensões temporais.
                </p>
                
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-3">
                  <div className="bg-indigo-900/40 p-2 sm:p-3 rounded border border-purple-800/30 text-center">
                    <div className="text-yellow-400 text-xs sm:text-sm font-medium mb-1">Passado</div>
                    <div className="text-purple-300 text-2xs sm:text-xs">Causas e influências formativas</div>
                  </div>
                  <div className="bg-indigo-900/40 p-2 sm:p-3 rounded border border-purple-800/30 text-center">
                    <div className="text-yellow-400 text-xs sm:text-sm font-medium mb-1">Presente</div>
                    <div className="text-purple-300 text-2xs sm:text-xs">Estado atual e manifestação</div>
                  </div>
                  <div className="bg-indigo-900/40 p-2 sm:p-3 rounded border border-purple-800/30 text-center">
                    <div className="text-yellow-400 text-xs sm:text-sm font-medium mb-1">Futuro</div>
                    <div className="text-purple-300 text-2xs sm:text-xs">Tendências e potenciais</div>
                  </div>
                </div>
                
                <p className="mt-2 text-xs text-purple-400/80">
                  <strong>Ideal para:</strong> Questões diretas, orientação geral, visão rápida de uma situação.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Celtic Cross */}
        <div className="border-b border-purple-800/30">
          <button 
            className="w-full p-3 sm:p-4 text-left flex justify-between items-center hover:bg-indigo-900/30 transition-colors"
            onClick={() => setExpandedSpread(expandedSpread === 'celtic-cross' ? null : 'celtic-cross')}
          >
            <div className="flex items-center">
              <span className="inline-block w-6 h-6 bg-indigo-800 rounded-full text-center text-yellow-400 text-xs font-medium mr-2">10</span>
              <span className="text-purple-200 font-medium">Cruz Celta</span>
            </div>
            {expandedSpread === 'celtic-cross' ? (
              <ChevronUp className="w-5 h-5 text-purple-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-purple-400" />
            )}
          </button>
          
          {expandedSpread === 'celtic-cross' && (
            <div className="p-3 sm:p-4 bg-indigo-900/20">
              <div className="space-y-2 sm:space-y-3 text-purple-300 text-sm">
                <p>
                  A Cruz Celta é uma das tiragens mais detalhadas e populares. Na visão de Crowley, 
                  representa a interação das forças em múltiplos planos de existência, com influências 
                  planetárias e qabalísticas.
                </p>
                
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3">
                  <div className="col-span-2 bg-indigo-900/40 p-2 sm:p-3 rounded border border-purple-800/30">
                    <div className="text-yellow-400 text-xs sm:text-sm font-medium mb-1">Cruz Central (6 cartas)</div>
                    <div className="text-purple-300 text-2xs sm:text-xs space-y-1">
                      <p><strong>1.</strong> Situação presente - O que está acontecendo agora</p>
                      <p><strong>2.</strong> Influência cruzada - Obstáculos ou apoios</p>
                      <p><strong>3.</strong> Coroamento - O que está acima (objetivo ou ideal)</p>
                      <p><strong>4.</strong> Fundação - O que está abaixo (passado ou subconsciente)</p>
                      <p><strong>5.</strong> Influência passando - O que está atrás (passado recente)</p>
                      <p><strong>6.</strong> Influência vindoura - O que está à frente (futuro próximo)</p>
                    </div>
                  </div>
                  <div className="col-span-2 bg-indigo-900/40 p-2 sm:p-3 rounded border border-purple-800/30">
                    <div className="text-yellow-400 text-xs sm:text-sm font-medium mb-1">Pilar (4 cartas)</div>
                    <div className="text-purple-300 text-2xs sm:text-xs space-y-1">
                      <p><strong>7.</strong> O consulente - Como você se vê ou aparece</p>
                      <p><strong>8.</strong> Casa/Ambiente - Influências externas</p>
                      <p><strong>9.</strong> Esperanças e temores - O que você deseja ou receia</p>
                      <p><strong>10.</strong> Resultado final - Síntese e resolução</p>
                    </div>
                  </div>
                </div>
                
                <p className="mt-2 text-xs text-purple-400/80">
                  <strong>Ideal para:</strong> Análises completas, situações complexas, múltiplas influências interagindo.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tree of Life */}
        <div>
          <button 
            className="w-full p-3 sm:p-4 text-left flex justify-between items-center hover:bg-indigo-900/30 transition-colors"
            onClick={() => setExpandedSpread(expandedSpread === 'tree-of-life' ? null : 'tree-of-life')}
          >
            <div className="flex items-center">
              <span className="inline-block w-6 h-6 bg-indigo-800 rounded-full text-center text-yellow-400 text-xs font-medium mr-2">10</span>
              <span className="text-purple-200 font-medium">Árvore da Vida</span>
            </div>
            {expandedSpread === 'tree-of-life' ? (
              <ChevronUp className="w-5 h-5 text-purple-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-purple-400" />
            )}
          </button>
          
          {expandedSpread === 'tree-of-life' && (
            <div className="p-3 sm:p-4 bg-indigo-900/20">
              <div className="space-y-2 sm:space-y-3 text-purple-300 text-sm">
                <p>
                  A Árvore da Vida é o mapa completo da realidade segundo a Qabalah. Para Crowley, 
                  cada Sephirah (esfera) representa um nível diferente de manifestação, do mais divino ao mais material.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-3">
                  <div className="bg-indigo-900/40 p-2 sm:p-3 rounded border border-purple-800/30">
                    <div className="text-yellow-400 text-xs sm:text-sm font-medium mb-1">Tríade Superna</div>
                    <div className="text-purple-300 text-2xs sm:text-xs space-y-1">
                      <p><strong>1. Kether</strong> - A Coroa, origem divina, potencial puro.</p>
                      <p><strong>2. Chokmah</strong> - Sabedoria, força dinâmica, princípio masculino.</p>
                      <p><strong>3. Binah</strong> - Entendimento, forma receptiva, princípio feminino.</p>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-900/40 p-2 sm:p-3 rounded border border-purple-800/30">
                    <div className="text-yellow-400 text-xs sm:text-sm font-medium mb-1">Tríade Ética</div>
                    <div className="text-purple-300 text-2xs sm:text-xs space-y-1">
                      <p><strong>4. Chesed</strong> - Misericórdia, organização, construção</p>
                      <p><strong>5. Geburah</strong> - Força, severidade, dissolução</p>
                      <p><strong>6. Tiphareth</strong> - Beleza, harmonia, equilíbrio solar</p>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-900/40 p-2 sm:p-3 rounded border border-purple-800/30">
                    <div className="text-yellow-400 text-xs sm:text-sm font-medium mb-1">Tríade Astral</div>
                    <div className="text-purple-300 text-2xs sm:text-xs space-y-1">
                      <p><strong>7. Netzach</strong> - Vitória, emoções, desejo</p>
                      <p><strong>8. Hod</strong> - Esplendor, intelecto, comunicação</p>
                      <p><strong>9. Yesod</strong> - Fundação, imaginação, subconsciente</p>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-900/40 p-2 sm:p-3 rounded border border-purple-800/30">
                    <div className="text-yellow-400 text-xs sm:text-sm font-medium mb-1">Reino Material</div>
                    <div className="text-purple-300 text-2xs sm:text-xs">
                      <p><strong>10. Malkuth</strong> - O Reino, materialização, mundo físico</p>
                    </div>
                  </div>
                </div>
                
                <p className="mt-2 text-xs text-purple-400/80">
                  <strong>Ideal para:</strong> Questões espirituais profundas, evolução pessoal, análise completa de um tema em todos os planos.
                </p>
              </div>
            </div>
          )} 
        </div>
      </div>
    )}
    </div>
  );
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {renderShuffleAnimation()}
      {renderInstructions()}
      {renderUserInfoModal()}
      <BuyDeckModal isOpen={showBuyDeckModal} onClose={() => setShowBuyDeckModal(false)} />
      
      <div className="text-center mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Realizar Leitura de Tarot</h1>
        <p className="text-purple-300 text-xs sm:text-sm mt-2 px-1 sm:px-0">
          Selecione um método de leitura e faça sua pergunta. Clique em "Começar Leitura"
          para visualizar as cartas e suas interpretações.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-3 sm:mt-4">
          <button 
            className="px-2 sm:px-3 py-1.5 sm:py-2 bg-indigo-900/70 text-yellow-400 text-xs sm:text-sm flex items-center rounded-md border border-purple-700/50 hover:bg-indigo-800 transition-colors shadow-md"
            onClick={() => setShowInstructions(true)}
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="line-clamp-1">Instruções</span>
          </button>
          <button 
            onClick={() => setShowBuyDeckModal(true)}
            className="px-2 sm:px-3 py-1.5 sm:py-2 bg-indigo-900/70 text-yellow-400 text-xs sm:text-sm flex items-center rounded-md border border-purple-700/50 hover:bg-indigo-800 transition-colors shadow-md"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="line-clamp-1">Comprar Baralho</span>
          </button>
        </div>
      </div>
      
      
      {readingState === 'initial' && (
        <div className="max-w-2xl mx-auto bg-indigo-950/50 p-3 sm:p-6 rounded-lg mb-4 sm:mb-8">
          {/* Spread Explanations Section */}
          {renderSpreadExplanations()}
          
          <div className="mb-4 sm:mb-6">
            <label className="block text-purple-300 text-sm sm:text-base mb-1 sm:mb-2">Método de Leitura:</label>
            <select 
              value={spreadType.id} 
              onChange={(e) => setSpreadType(getSpreadById(e.target.value as 'three-card' | 'celtic-cross' | 'tree-of-life'))}
              className="w-full p-2 sm:p-3 rounded-md bg-indigo-900 border border-purple-800 text-purple-400 text-sm sm:text-base"
            >
              {allSpreads.map(spread => (
                <option key={spread.id} value={spread.id}>{spread.name}</option>
              ))}
            </select>
            
            {/* Guidance text for selected spread */}
            <div className="mt-2 sm:mt-3 p-2 sm:p-4 bg-indigo-900/50 rounded-lg">
              <p className="text-purple-300 text-xs sm:text-sm italic">
                {spreadGuidance[spreadType.id]}
              </p>
            </div>
          </div>
          
          <div className="mb-4 sm:mb-6">
            <label className="block text-purple-300 text-sm sm:text-base mb-1 sm:mb-2">Sua Questão:</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Formule sua questão com clareza e intenção..."
              className="w-full p-2 sm:p-3 rounded-md bg-indigo-900 border border-purple-800 text-purple-300 min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
            />
            <p className="text-purple-400 text-2xs sm:text-xs mt-1 sm:mt-2">
              "A pergunta clara é a metade da resposta." — Adaptado de Crowley
            </p>
          </div>
          
          <button 
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-white rounded-md transition flex items-center justify-center bg-purple-800 hover:bg-purple-700 text-sm sm:text-base"
            onClick={initiateReading}
          >
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            Começar Leitura
          </button>
        </div>
      )}
      
      {reading && readingState !== 'initial' && (
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <div>
            <h2 className="text-lg sm:text-xl text-white font-medium">{spreadType.name}</h2>
            {userName && <p className="text-yellow-400 text-xs sm:text-sm">Consulente: {userName}</p>}
            <p className="text-purple-300 text-xs sm:text-sm italic line-clamp-2 sm:line-clamp-none">"{question}"</p>
          </div>
          
          <div className="flex space-x-2 w-full sm:w-auto justify-end">
            {readingState === 'complete' && (
              <button
                className="px-2 sm:px-3 py-1 bg-indigo-800 text-yellow-400 rounded-md hover:bg-indigo-700 transition flex items-center text-xs sm:text-sm"
                onClick={saveReading}
              >
                <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                Salvar
              </button>
            )}
            
            <button
              className="px-2 sm:px-3 py-1 bg-purple-800 text-white rounded-md hover:bg-purple-700 transition text-xs sm:text-sm"
              onClick={resetReading}
            >
              Nova Leitura
            </button>
          </div>
        </div>
      )}

      {reading && readingState !== 'initial' && (
        <div className="flex flex-col gap-3 sm:gap-6">
          {/* Card Interpretation - Now at the top */}
          <div className="w-full bg-indigo-950/30 p-3 sm:p-4 rounded-lg border border-purple-800/30">
            <CardInterpretation 
              readingCard={selectedCard} 
              selectedAgent={selectedAgent}
              question={reading.question || ''}
              spreadType={reading.spreadType}
              userName={reading.userName}
              birthDate={reading.birthDate}
            />
            
            {readingState === 'complete' && !selectedCard && (
              <div className="mt-4 p-4 bg-indigo-900/50 rounded-lg text-center">
                <p className="text-purple-300">
                  Clique em uma carta para ver sua interpretação detalhada.
                </p>
              </div>
            )}
          </div>

          {/* Spread Layout */}
          <div className="w-full relative">
            <div className="bg-indigo-950/30 p-3 sm:p-4 rounded-lg border border-purple-800/30">
              <h3 className="text-lg sm:text-xl font-medium text-indigo-200 mb-2 sm:mb-4 text-center">
                {spreadType.id === 'celtic-cross' ? 'Celtic Cross Spread' : 
                 spreadType.id === 'tree-of-life' ? 'Tree of Life Spread' : 'Three-Card Spread'}
              </h3>
              
              {/* Table-based layout for spreads */}
              <div className={`grid ${
                spreadType.id === 'tree-of-life' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' 
                  : spreadType.id === 'three-card'
                  ? 'grid-cols-1 sm:grid-cols-3'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              } gap-3 sm:gap-6 mb-3 sm:mb-6`}>
                {reading.cards.map((card, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center p-2 sm:p-4 bg-indigo-900/30 rounded-lg hover:bg-indigo-900/50 transition-all cursor-pointer overflow-hidden"
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className="w-24 sm:w-32 md:w-36 lg:w-40 xl:w-44 mx-auto aspect-[2/3]">
                      <TarotCardComponent 
                        card={card.card} 
                        onClick={() => {}} 
                        isReversed={card.isReversed}
                      />
                    </div>
                    <div className="mt-1 sm:mt-2 text-center w-full">
                      <div className="text-yellow-300 text-xs sm:text-sm font-medium truncate px-1">{card.position.name}</div>
                      <div className="text-purple-300 text-2xs sm:text-xs mt-0.5 sm:mt-1 truncate px-1 text-center w-full">{card.card.name}{card.isReversed ? " (Invertida)" : ""}</div>
                    </div>
                    {/* Position number indicator */}
                    <div className="absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-indigo-700 text-yellow-300 flex items-center justify-center text-2xs sm:text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Info about the spread */}
              <div className="text-center text-indigo-300 text-2xs sm:text-xs mt-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-indigo-900/20 rounded-lg">
                <p>
                  {spreadType.id === 'tree-of-life' 
                    ? 'Visualização em tabela da Árvore da Vida, com as Sephiroth em ordem numérica.'
                    : spreadType.id === 'celtic-cross'
                    ? 'Visualização em tabela da Cruz Celta, com as posições em ordem numérica.'
                    : 'Visualização em tabela das cartas de passado, presente e futuro.'}
                </p>
              </div>
            </div>
            
            {readingState === 'revealing' && currentCardIndex < reading.cards.length && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-indigo-900/80 px-6 py-3 rounded-full text-yellow-400 text-sm shadow-lg shadow-purple-500/20 animate-pulse border border-purple-500/30 backdrop-blur-sm">
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Revelando carta {currentCardIndex + 1} de {reading.cards.length}...
                </div>
              </div>
            )}
          </div>
          
          {/* Crowley's Esoteric Interpretation */}
          <CrowleyInterpreter reading={reading} readingState={readingState} selectedAgent={selectedAgent} />

        </div>
      )}
      
      
      {/* Simple Mercado Pago Button - shown after reading is complete */}
      {readingState === 'complete' && (
        <div className="mt-4 sm:mt-8 p-3 sm:p-6 bg-indigo-900/40 rounded-lg border border-purple-800/30 text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-yellow-400/20 rounded-full p-2 mr-2">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 4h-15A2.5 2.5 0 002 6.5v11A2.5 2.5 0 004.5 20h15a2.5 2.5 0 002.5-2.5v-11A2.5 2.5 0 0019.5 4zM17 17h-2v-2h2v2zm0-4h-2v-2h2v2zm-8 4H7v-6h2v6zm4 0h-2V7h2v10z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl text-yellow-400 font-medium">Gostou da Leitura?</h3>
          </div>
          
          <p className="text-purple-300 text-xs sm:text-sm mb-4 max-w-md mx-auto">
            Contribua com apenas R$0,93 como agradecimento pela sua leitura de Tarot.
          </p>

          
          <a 
            href="https://mpago.la/1CiWiTp" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-3 bg-indigo-700 hover:bg-indigo-600 text-yellow-300 text-sm rounded-md transition-all shadow-md border border-purple-600/40 hover:border-purple-500/60 hover:shadow-purple-600/20 hover:translate-y-[-1px] group max-w-xs mx-auto"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:text-yellow-200 transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 4h-15A2.5 2.5 0 002 6.5v11A2.5 2.5 0 004.5 20h15a2.5 2.5 0 002.5-2.5v-11A2.5 2.5 0 0019.5 4zM17 17h-2v-2h2v2zm0-4h-2v-2h2v2zm-8 4H7v-6h2v6zm4 0h-2V7h2v10z" />
            </svg>
            <span className="group-hover:text-yellow-200 transition-colors font-medium">Pagar R$0,93 com Mercado Pago</span>
          </a>
        </div>
      )}
      
      {/* Saved Readings Section */}
      {savedReadings.length > 0 && readingState === 'initial' && (
        <div className="mt-8 border-t border-purple-800/50 pt-6">
          <h2 className="text-xl text-white font-medium mb-4">Leituras Salvas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedReadings.map((savedReading) => (
              <div 
                key={savedReading.id}
                className="p-4 bg-indigo-900/40 rounded-lg hover:bg-indigo-900/60 transition cursor-pointer"
                onClick={() => {
                  setReading(savedReading);
                  setSpreadType(getSpreadById(savedReading.spreadType));
                  setQuestion(savedReading.question || '');
                  setUserName(savedReading.userName || '');
                  setBirthDate(savedReading.birthDate || '');
                  setIsRevealed(new Array(savedReading.cards.length).fill(true));
                  setReadingState('complete');
                  setSelectedCard(null);
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-yellow-400 font-medium">
                      {allSpreads.find(s => s.id === savedReading.spreadType)?.name}
                    </h3>
                    <p className="text-purple-300 text-xs">
                      {new Date(savedReading.date).toLocaleDateString()}
                    </p>
                  </div>
                  <BookOpen className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-purple-300 text-sm line-clamp-2 italic">
                  "{savedReading.question}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Simple contribution card always appears at the bottom when not in active reading state */}
      {readingState !== 'shuffling' && readingState !== 'drawing' && readingState !== 'revealing' && readingState !== 'complete' && (
        <div className="mt-4 sm:mt-6">
          {renderContributionButtons()}
        </div>
      )}
    </div>
  );
};
