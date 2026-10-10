import React, { useState, useEffect } from 'react';
import { TarotCard } from '../../types/tarot';
import { TarotCardComponent } from '../TarotCard';
import { majorArcana } from '../../data/majorArcana';
import { courtCards } from '../../data/courtCards';
import { minorArcana } from '../../data/minorArcana';
import { ArrowLeft, ArrowRight, BookOpen, ChevronUp, ChevronDown } from 'lucide-react';
import { ThothBookPDF } from './ThothBookPDF';

// Combine all cards
const allCards: TarotCard[] = [...majorArcana, ...courtCards, ...minorArcana];

// Sort cards in traditional order
const sortedCards = [...allCards].sort((a, b) => {
  // First by category
  const categoryOrder = { major: 0, court: 1, minor: 2 };
  const categoryDiff = categoryOrder[a.category] - categoryOrder[b.category];
  if (categoryDiff !== 0) return categoryDiff;

  // For major arcana, sort by number
  if (a.category === 'major' && b.category === 'major') {
    const aNum = a.number ? parseInt(a.number.replace(/[^\d]/g, '')) : 0;
    const bNum = b.number ? parseInt(b.number.replace(/[^\d]/g, '')) : 0;
    return aNum - bNum;
  }

  // For court and minor, sort by suit first, then rank
  const suitOrder = { "Bastões": 0, "Copas": 1, "Espadas": 2, "Discos": 3 };
  const aSuit = a.suit || "";
  const bSuit = b.suit || "";
  
  const suitDiff = (suitOrder[aSuit] || 0) - (suitOrder[bSuit] || 0);
  if (suitDiff !== 0) return suitDiff;

  // Within a suit, sort by rank (for minors) or court position
  if (a.category === 'minor' && b.category === 'minor') {
    const aRank = a.id.includes('-') ? parseInt(a.id.split('-')[1]) : 0;
    const bRank = b.id.includes('-') ? parseInt(b.id.split('-')[1]) : 0;
    return aRank - bRank;
  }

  if (a.category === 'court' && b.category === 'court') {
    const courtOrder = { king: 0, queen: 1, knight: 2, prince: 2, princess: 3 };
    const aRank = a.id.split('-')[0];
    const bRank = b.id.split('-')[0];
    return (courtOrder[aRank] || 0) - (courtOrder[bRank] || 0);
  }

  return 0;
});

// Interface for detailed explanations
interface DetailedExplanation {
  thothExplanation: string;
  symbology: string;
  qabalistic: string;
  astrological: string;
}

// Mock detailed explanations - these would be replaced with actual content from the Book of Thoth
export const getDetailedExplanation = (card: TarotCard): DetailedExplanation => {
  // This is a placeholder. In a real implementation, these would come from a data file
  return {
    thothExplanation: `Segundo O Livro de Thoth de Aleister Crowley, ${card.name} (${card.englishName}) representa ${card.description} 
    
    O simbolismo desta carta reflete os princípios fundamentais do sistema thelêmico, incorporando elementos da Qabalah, astrologia e alquimia. ${card.category === 'major' ? 'Como um Arcano Maior' : card.category === 'court' ? 'Como uma carta da Corte' : 'Como um Arcano Menor'}, esta carta representa um aspecto fundamental da jornada espiritual e psicológica do indivíduo.
    
    Aleister Crowley, em sua obra "O Livro de Thoth", explica que esta carta simboliza a manifestação de energias cósmicas específicas no plano terrestre, agindo como um portal para compreensão mais profunda da Grande Obra alquímica.`,
    
    symbology: `Os elementos simbólicos principais presentes em ${card.name} incluem:
    
    • Cores: As cores predominantes na carta refletem suas qualidades energéticas e vibracionais
    • Figuras: As entidades representadas simbolizam forças arquetípicas específicas
    • Elementos geométricos: A estrutura geométrica da carta revela padrões cósmicos
    • Símbolos alquímicos: Representam os processos de transformação espiritual`,
    
    qabalistic: `Na Árvore da Vida cabalística, ${card.name} corresponde a ${card.category === 'major' ? 'um caminho entre Sephiroth' : 'aspectos específicos de uma Sephira'}.
    
    ${card.category === 'major' ? `Como o Arcano ${card.number}, esta carta representa um caminho iniciático específico, ligando aspectos da consciência cósmica.` : `${card.category === 'court' ? 'Como carta da Corte, representa aspectos personificados das forças elementais.' : 'Como Arcano Menor, representa manifestações mundanas de forças espirituais.'}`}`,
    
    astrological: `Correspondências astrológicas:
    
    ${card.category === 'major' ? '• Planeta ou signo zodiacal regente' : ''}
    ${card.suit ? `• Elemento: ${card.suit === 'Bastões' ? 'Fogo' : card.suit === 'Copas' ? 'Água' : card.suit === 'Espadas' ? 'Ar' : 'Terra'}` : ''}
    ${card.element ? `• Energia elemental: ${card.element}` : ''}
    • Período temporal correspondente
    • Influências energéticas`
  };
};

// Component for collapsible explanation sections
interface ExplanationSectionProps {
  title: string;
  content: string;
  isOpen: boolean;
  onToggle: () => void;
}

const ExplanationSection: React.FC<ExplanationSectionProps> = ({ title, content, isOpen, onToggle }) => {
  return (
    <div className="mb-4 border border-purple-800/30 rounded-lg overflow-hidden">
      <button 
        className="w-full flex justify-between items-center p-4 bg-purple-900/50 text-left"
        onClick={onToggle}
      >
        <h3 className="text-lg font-semibold text-yellow-400">{title}</h3>
        {isOpen ? <ChevronUp className="w-5 h-5 text-purple-300" /> : <ChevronDown className="w-5 h-5 text-purple-300" />}
      </button>
      {isOpen && (
        <div className="p-4 bg-purple-900/20 text-purple-200 whitespace-pre-line">
          {content}
        </div>
      )}
    </div>
  );
};

// Main ExplanationPage component
export const ExplanationPage: React.FC = () => {
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [selectedCard, setSelectedCard] = useState<TarotCard>(sortedCards[0]);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    main: false,
    symbology: false,
    qabalistic: false,
    astrological: false,
  });
  
  // Get card explanations
  const { thothExplanation, symbology, qabalistic, astrological } = getDetailedExplanation(selectedCard);
  
  // Update selected card when index changes
  useEffect(() => {
    setSelectedCard(sortedCards[selectedCardIndex]);
  }, [selectedCardIndex]);
  
  // Navigation functions
  const navigateNext = () => {
    setSelectedCardIndex((prevIndex) => (prevIndex + 1) % sortedCards.length);
  };
  
  const navigatePrevious = () => {
    setSelectedCardIndex((prevIndex) => (prevIndex - 1 + sortedCards.length) % sortedCards.length);
  };
  
  // Toggle explanation sections
  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  
  // PDF download is now handled by the PDFDownloader component
  
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="text-yellow-400">
            <BookOpen className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-white">O Livro de Thoth</h1>
          <div className="text-yellow-400">
            <BookOpen className="w-10 h-10" />
          </div>
        </div>
        <p className="text-purple-200 text-xl max-w-3xl mx-auto leading-relaxed text-center">
          Explorando em profundidade as cartas do Tarot de Thoth conforme apresentadas por Aleister Crowley
        </p>
        
        {/* PDF Downloader is now integrated at the bottom of the page */}
      </div>
      
      {/* Card Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={navigatePrevious}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-900/50 text-purple-200 rounded-lg hover:bg-purple-800/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>
        
        <div className="text-center">
          <h2 className="text-xl text-yellow-400 font-semibold">{selectedCard.name}</h2>
          <p className="text-purple-300">{selectedCard.englishName}</p>
          {selectedCard.number && <p className="text-purple-200 text-sm">{selectedCard.number}</p>}
        </div>
        
        <button 
          onClick={navigateNext}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-900/50 text-purple-200 rounded-lg hover:bg-purple-800/50 transition-colors"
        >
          <span>Próxima</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Main Content - Card and Explanation */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Card Side */}
        <div className="w-full md:w-1/3 flex justify-center">
          <div className="mb-6 md:mb-0 transform hover:scale-105 transition-transform duration-500">
            <TarotCardComponent 
              card={selectedCard} 
              onClick={() => {}} // No action needed when clicked in this view
            />
          </div>
        </div>
        
        {/* Explanation Side */}
        <div className="w-full md:w-2/3 bg-purple-950/30 p-6 rounded-xl border border-purple-800/30">
          <ExplanationSection 
            title="Interpretação de Crowley"
            content={thothExplanation}
            isOpen={openSections.main}
            onToggle={() => toggleSection('main')}
          />
          
          <ExplanationSection 
            title="Simbologia"
            content={symbology}
            isOpen={openSections.symbology}
            onToggle={() => toggleSection('symbology')}
          />
          
          <ExplanationSection 
            title="Correspondências Cabalísticas"
            content={qabalistic}
            isOpen={openSections.qabalistic}
            onToggle={() => toggleSection('qabalistic')}
          />
          
          <ExplanationSection 
            title="Correspondências Astrológicas"
            content={astrological}
            isOpen={openSections.astrological}
            onToggle={() => toggleSection('astrological')}
          />
        </div>
      </div>
      
      {/* Card Info Summary */}
      <div className="bg-purple-950/30 p-6 rounded-xl border border-purple-800/30 mb-8">
        <h3 className="text-xl font-semibold text-yellow-400 mb-4">Informações da Carta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-purple-300 text-sm">Categoria</p>
            <p className="text-white font-medium">
              {selectedCard.category === 'major' ? 'Arcano Maior' : 
               selectedCard.category === 'court' ? 'Carta da Corte' : 'Arcano Menor'}
            </p>
          </div>
          
          {selectedCard.number && (
            <div>
              <p className="text-purple-300 text-sm">Número</p>
              <p className="text-white font-medium">{selectedCard.number}</p>
            </div>
          )}
          
          {selectedCard.suit && (
            <div>
              <p className="text-purple-300 text-sm">Naipe</p>
              <p className="text-white font-medium">{selectedCard.suit}</p>
            </div>
          )}
          
          {selectedCard.element && (
            <div>
              <p className="text-purple-300 text-sm">Elemento</p>
              <p className="text-white font-medium">{selectedCard.element}</p>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <p className="text-purple-300 text-sm">Palavras-chave</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {selectedCard.keywords.map((keyword, index) => (
              <span 
                key={index} 
                className="bg-purple-800/50 text-purple-100 px-3 py-1 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Thoth Book Amazon Link Component */}
      <ThothBookPDF />
    </div>
  );
};
