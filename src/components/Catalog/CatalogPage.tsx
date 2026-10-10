import React, { useState, useEffect } from 'react';
import { TarotCard } from '../../types/tarot';
import { majorArcana } from '../../data/majorArcana';
import { courtCards } from '../../data/courtCards';
import { minorArcana } from '../../data/minorArcana';
import { TarotCardComponent } from '../TarotCard';
import { CardModal } from '../CardModal';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

type CardFilterType = 'all' | 'major' | 'minor' | 'court';

export const CatalogPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<CardFilterType>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  
  // Collapse state for each section (false = expanded)
  const [isMajorCollapsed, setIsMajorCollapsed] = useState<boolean>(false);
  const [isMinorCollapsed, setIsMinorCollapsed] = useState<boolean>(false);
  const [isCourtCollapsed, setIsCourtCollapsed] = useState<boolean>(false);
  
  // Visibility state for card sections
  const [showMajorCards, setShowMajorCards] = useState<boolean>(false);
  const [showMinorCards, setShowMinorCards] = useState<boolean>(false);
  const [showCourtCards, setShowCourtCards] = useState<boolean>(false);
  
  
  // Sort cards according to traditional Thoth Tarot order
  const sortedMajorArcana = [...majorArcana].sort((a, b) => {
    // Sort by number (assuming the number is part of the id or available)
    const aNum = parseInt(a.id.replace(/\D/g, ''));
    const bNum = parseInt(b.id.replace(/\D/g, ''));
    return aNum - bNum;
  });

  // Define suit order - using actual case as in data files
  const suitOrder = ["Bastões", "Copas", "Espadas", "Discos"];
  
  // Sort minor arcana by suit and rank
  const sortedMinorArcana = [...minorArcana].sort((a, b) => {
    // First, sort by suit - use actual case
    const aSuitIndex = suitOrder.indexOf(a.suit || "");
    const bSuitIndex = suitOrder.indexOf(b.suit || "");
    if (aSuitIndex !== bSuitIndex) return aSuitIndex - bSuitIndex;
    
    // Then, sort by rank
    const aRank = a.rank || 0;
    const bRank = b.rank || 0;
    return aRank - bRank;
  });

  // Define standard court card rank order
  const courtRankOrder = ["king", "queen", "prince", "princess"];
  
  // Define specific rank order for Cups
  const cupsRankOrder = ["knight", "queen", "prince", "princess"];
  
  // Sort court cards by suit and rank
  const sortedCourtCards = [...courtCards].sort((a, b) => {
    // First, sort by suit - use actual case
    const aSuitIndex = suitOrder.indexOf(a.suit || "");
    const bSuitIndex = suitOrder.indexOf(b.suit || "");
    if (aSuitIndex !== bSuitIndex) return aSuitIndex - bSuitIndex;
    
    // Then, sort by court rank - extract rank from id (e.g., 'king-wands' -> 'king')
    const aRank = a.id.split('-')[0] || '';
    const bRank = b.id.split('-')[0] || '';
    
    // Use different rank orders based on suit
    if (a.suit === 'Copas' && b.suit === 'Copas') {
      // Both cards are Cups, use Cups-specific rank order
      const aRankIndex = cupsRankOrder.indexOf(aRank);
      const bRankIndex = cupsRankOrder.indexOf(bRank);
      if (aRankIndex === -1) console.warn(`Unrecognized Cups rank: ${aRank} for card ${a.id}`);
      if (bRankIndex === -1) console.warn(`Unrecognized Cups rank: ${bRank} for card ${b.id}`);
      return aRankIndex - bRankIndex;
    } else {
      // Use standard rank order for other suits
      const aRankIndex = courtRankOrder.indexOf(aRank);
      const bRankIndex = courtRankOrder.indexOf(bRank);
      if (aRankIndex === -1) console.warn(`Unrecognized rank: ${aRank} for card ${a.id}`);
      if (bRankIndex === -1) console.warn(`Unrecognized rank: ${bRank} for card ${b.id}`);
      return aRankIndex - bRankIndex;
    }
  });
  
  // Combine all cards
  const allCards: TarotCard[] = [...sortedMajorArcana, ...sortedMinorArcana, ...sortedCourtCards];
  
  // Debug logging for court cards
  console.log('Court cards:', courtCards.filter(card => card.category === 'court'));
  const wandsCourtCards = courtCards.filter(card => card.category === 'court' && card.suit === 'Bastões');
  console.log('Wands court cards:', wandsCourtCards);
  
  // Log each Wands court card in detail
  wandsCourtCards.forEach(card => {
    const rank = card.id.split('-')[0];
    console.log(`Wands court card: ${card.name}, ID: ${card.id}, Rank: ${rank}, Expected order position: ${courtRankOrder.indexOf(rank)}`);
  });
  
  const filteredCards = allCards.filter(card => {
    // Filter by category
    const categoryMatch = 
      activeFilter === 'all' || 
      (activeFilter === 'major' && card.category === 'major') ||
      (activeFilter === 'minor' && card.category === 'minor') ||
      (activeFilter === 'court' && card.category === 'court');
    
    // Filter by search term (case insensitive)
    const searchMatch = 
      searchTerm === '' || 
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.englishName && card.englishName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return categoryMatch && searchMatch;
  });

  const handleCardClick = (card: TarotCard) => {
    setSelectedCard(card);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  return (
    <div>
      {/* Search and Filter Controls */}
      <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex space-x-2 md:space-x-4">
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === 'all' 
                ? 'bg-yellow-500 text-gray-900 font-medium' 
                : 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50'
            }`}
            onClick={() => setActiveFilter('all')}
          >
            Todas
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === 'major' 
                ? 'bg-yellow-500 text-gray-900 font-medium' 
                : 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50'
            }`}
            onClick={() => setActiveFilter('major')}
          >
            Maiores
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === 'minor' 
                ? 'bg-yellow-500 text-gray-900 font-medium' 
                : 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50'
            }`}
            onClick={() => setActiveFilter('minor')}
          >
            Menores
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === 'court' 
                ? 'bg-yellow-500 text-gray-900 font-medium' 
                : 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50'
            }`}
            onClick={() => setActiveFilter('court')}
          >
            Corte
          </button>
        </div>
        
        <div className="relative w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-purple-400" />
          </div>
          <input
            type="text"
            className="w-full md:w-80 pl-10 pr-4 py-2 bg-purple-900/50 border border-purple-700 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="Buscar por nome da carta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Results Summary */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-purple-300">
            Exibindo {filteredCards.length} de {allCards.length} cartas
            {activeFilter !== 'all' && ` (Filtro: ${
              activeFilter === 'major' ? 'Arcanos Maiores' : 
              activeFilter === 'minor' ? 'Arcanos Menores' : 'Cartas de Corte'
            })`}
            {searchTerm && ` (Busca: "${searchTerm}")`}
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setIsMajorCollapsed(false);
                setIsMinorCollapsed(false);
                setIsCourtCollapsed(false);
                setShowMajorCards(true);
                setShowMinorCards(true);
                setShowCourtCards(true);
              }}
              className="text-xs py-1 px-2 rounded bg-purple-900/50 text-purple-300 hover:bg-purple-800/50 transition-colors"
            >
              Expandir Explicações
            </button>
            <button
              onClick={() => {
                setIsMajorCollapsed(true);
                setIsMinorCollapsed(true);
                setIsCourtCollapsed(true);
                setShowMajorCards(false);
                setShowMinorCards(false);
                setShowCourtCards(false);
              }}
              className="text-xs py-1 px-2 rounded bg-purple-900/50 text-purple-300 hover:bg-purple-800/50 transition-colors"
            >
              Recolher Explicações
            </button>
            <button
              onClick={() => {
                setShowMajorCards(true);
                setShowMinorCards(true);
                setShowCourtCards(true);
              }}
              className="text-xs py-1 px-2 rounded bg-purple-900/50 text-purple-300 hover:bg-purple-800/50 transition-colors"
            >
              Mostrar Todas as Cartas
            </button>
            <button
              onClick={() => {
                setShowMajorCards(false);
                setShowMinorCards(false);
                setShowCourtCards(false);
              }}
              className="text-xs py-1 px-2 rounded bg-purple-900/50 text-purple-300 hover:bg-purple-800/50 transition-colors"
            >
              Ocultar Todas as Cartas
            </button>
          </div>
        </div>
      </div>
      
      {/* Cards Sections */}
      <div className="space-y-10">
        {/* Major Arcana Section */}
        {filteredCards.some(card => card.category === 'major') && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-yellow-500">Arcanos Maiores</h2>
              <button 
                onClick={() => setIsMajorCollapsed(!isMajorCollapsed)}
                className="p-1.5 rounded-full bg-purple-900/50 text-yellow-400 hover:bg-purple-800/50 transition-colors"
                aria-label={isMajorCollapsed ? "Expandir Arcanos Maiores" : "Recolher Arcanos Maiores"}
              >
                {isMajorCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Major Arcana Explanation */}
            <div className={`bg-indigo-900/30 p-4 rounded-lg mb-4 transition-all duration-500 ease-in-out ${
              isMajorCollapsed ? 'max-h-0 opacity-0 mt-0 mb-0 overflow-hidden p-0' : 'max-h-[1000px] opacity-100'
            }`}>
              <p className="text-purple-200 mb-3">
                Os <span className="text-yellow-400 font-medium">Arcanos Maiores</span> representam as forças arquetípicas fundamentais do universo e da consciência humana. No Tarot de Thoth, Aleister Crowley redefiniu estas 22 cartas para alinhá-las com sua visão da Nova Era de Hórus e os princípios da Thelema.
              </p>
              <p className="text-purple-300 text-sm">
                Cada Arcano Maior corresponde a um princípio cósmico, uma letra hebraica e um caminho na Árvore da Vida cabalística. Representam as grandes forças que moldam nosso destino e os estágios fundamentais da evolução espiritual. Estas cartas abordam os temas mais profundos da existência humana: nascimento, morte, renascimento, iluminação e transformação.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <div className="bg-indigo-900/40 p-3 rounded border border-purple-800/30">
                  <h4 className="text-yellow-400 text-sm font-medium mb-1">Natureza Arquetípica</h4>
                  <p className="text-purple-300 text-xs">
                    Representam as forças primordiais e os princípios universais que moldam a consciência e a experiência humana através de todos os planos de existência.
                  </p>
                </div>
                <div className="bg-indigo-900/40 p-3 rounded border border-purple-800/30">
                  <h4 className="text-yellow-400 text-sm font-medium mb-1">Correspondências Cabalísticas</h4>
                  <p className="text-purple-300 text-xs">
                    Cada carta está associada a um caminho específico na Árvore da Vida, conectando as diferentes Sephiroth e revelando aspectos da jornada espiritual.
                  </p>
                </div>
                <div className="bg-indigo-900/40 p-3 rounded border border-purple-800/30">
                  <h4 className="text-yellow-400 text-sm font-medium mb-1">Evolução da Consciência</h4>
                  <p className="text-purple-300 text-xs">
                    Em sequência, narram a jornada da alma desde a inocência (O Louco) até a completude cósmica (O Universo), representando os estágios de desenvolvimento espiritual.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowMajorCards(!showMajorCards)}
                  className="px-6 py-2.5 bg-indigo-800 hover:bg-indigo-700 text-yellow-400 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 font-medium"
                >
                  {showMajorCards ? (
                    <>
                      <ChevronUp className="w-5 h-5" />
                      <span>Ocultar Cartas</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      <span>Ver Cartas</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div 
              className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 place-items-center justify-items-center px-2 sm:px-0 card-grid overflow-hidden transition-all duration-500 ease-in-out ${
                !showMajorCards ? 'max-h-0 opacity-0 mt-0 mb-0' : 'max-h-[5000px] opacity-100 mt-4 mb-6'
              }`}
            >
              {filteredCards
                .filter(card => card.category === 'major')
                .map((card) => (
                  <TarotCardComponent 
                    key={card.id} 
                    card={card} 
                    onClick={handleCardClick}
                  />
                ))}
            </div>
          </div>
        )}
        
        {/* Minor Arcana Sections - Grouped by Suit */}
        {filteredCards.some(card => card.category === 'minor') && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-yellow-500">Arcanos Menores</h2>
              <button 
                onClick={() => setIsMinorCollapsed(!isMinorCollapsed)}
                className="p-1.5 rounded-full bg-purple-900/50 text-yellow-400 hover:bg-purple-800/50 transition-colors"
                aria-label={isMinorCollapsed ? "Expandir Arcanos Menores" : "Recolher Arcanos Menores"}
              >
                {isMinorCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Minor Arcana Explanation */}
            <div className={`bg-indigo-900/30 p-4 rounded-lg mb-4 transition-all duration-500 ease-in-out ${
              isMinorCollapsed ? 'max-h-0 opacity-0 mt-0 mb-0 overflow-hidden p-0' : 'max-h-[1000px] opacity-100'
            }`}>
              <p className="text-purple-200 mb-3">
                Os <span className="text-yellow-400 font-medium">Arcanos Menores</span> do Tarot de Thoth representam a manifestação das energias cósmicas no plano material e na experiência cotidiana. Divididos em quatro naipes, cada um com dez cartas numeradas de Ás a Dez, eles correspondem aos quatro elementos e suas expressões na realidade mundana.
              </p>
              <p className="text-purple-300 text-sm mb-3">
                No sistema de Crowley, cada carta menor é uma combinação específica de energia elemental e numérica, mapeada precisamente na Árvore da Vida. As cartas de Ás a Dez em cada naipe correspondem ao fluxo de energia através das dez Sephiroth.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                <div className="bg-indigo-900/40 p-3 rounded border border-purple-800/30">
                  <h4 className="text-yellow-400 text-sm font-medium mb-1">Bastões - Fogo</h4>
                  <p className="text-purple-300 text-xs">
                    Energia criativa, vontade, paixão, inspiração, ambição e crescimento espiritual. Representam o impulso inicial da criação e da expressão pessoal.
                  </p>
                </div>
                <div className="bg-indigo-900/40 p-3 rounded border border-purple-800/30">
                  <h4 className="text-yellow-400 text-sm font-medium mb-1">Copas - Água</h4>
                  <p className="text-purple-300 text-xs">
                    Emoções, intuição, relacionamentos, amor, sonhos e o subconsciente. Refletem o mundo interior, os sentimentos e as conexões emocionais.
                  </p>
                </div>
                <div className="bg-indigo-900/40 p-3 rounded border border-purple-800/30">
                  <h4 className="text-yellow-400 text-sm font-medium mb-1">Espadas - Ar</h4>
                  <p className="text-purple-300 text-xs">
                    Intelecto, comunicação, conflito, clareza mental e desafios. Representam o poder do pensamento, tanto em seu potencial construtivo quanto destrutivo.
                  </p>
                </div>
                <div className="bg-indigo-900/40 p-3 rounded border border-purple-800/30">
                  <h4 className="text-yellow-400 text-sm font-medium mb-1">Discos - Terra</h4>
                  <p className="text-purple-300 text-xs">
                    Materialidade, recursos, saúde, trabalho e estabilidade. Manifestam a energia em sua forma mais densa e concreta, relacionada à vida prática.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowMinorCards(!showMinorCards)}
                  className="px-6 py-2.5 bg-indigo-800 hover:bg-indigo-700 text-yellow-400 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 font-medium"
                >
                  {showMinorCards ? (
                    <>
                      <ChevronUp className="w-5 h-5" />
                      <span>Ocultar Cartas</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      <span>Ver Cartas</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
              !showMinorCards ? 'max-h-0 opacity-0 mt-0 mb-0' : 'max-h-[5000px] opacity-100 mt-4 mb-6'
            }`}>
            
            {/* Bastões Section */}
            {filteredCards.some(card => card.category === 'minor' && card.suit === 'Bastões') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Bastões</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 place-items-center justify-items-center px-2 sm:px-0 card-grid">
                  {filteredCards
                    .filter(card => card.category === 'minor' && card.suit === 'Bastões')
                    .map((card) => (
                      <TarotCardComponent 
                        key={card.id} 
                        card={card} 
                        onClick={handleCardClick}
                      />
                    ))}
                </div>
              </div>
            )}
            
            {/* Copas Section */}
            {filteredCards.some(card => card.category === 'minor' && card.suit === 'Copas') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Copas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 place-items-center justify-items-center px-2 sm:px-0 card-grid">
                  {filteredCards
                    .filter(card => card.category === 'minor' && card.suit === 'Copas')
                    .map((card) => (
                      <TarotCardComponent 
                        key={card.id} 
                        card={card} 
                        onClick={handleCardClick}
                      />
                    ))}
                </div>
              </div>
            )}
            
            {/* Espadas Section */}
            {filteredCards.some(card => card.category === 'minor' && card.suit === 'Espadas') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Espadas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 place-items-center justify-items-center px-2 sm:px-0 card-grid">
                  {filteredCards
                    .filter(card => card.category === 'minor' && card.suit === 'Espadas')
                    .map((card) => (
                      <TarotCardComponent 
                        key={card.id} 
                        card={card} 
                        onClick={handleCardClick}
                      />
                    ))}
                </div>
              </div>
            )}
            
            {/* Discos Section */}
            {filteredCards.some(card => card.category === 'minor' && card.suit === 'Discos') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Discos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 place-items-center justify-items-center px-2 sm:px-0 card-grid">
                  {filteredCards
                    .filter(card => card.category === 'minor' && card.suit === 'Discos')
                    .map((card) => (
                      <TarotCardComponent 
                        key={card.id} 
                        card={card} 
                        onClick={handleCardClick}
                      />
                    ))}
                </div>
              </div>
            )}
            </div>
          </div>
        )}
        
        {/* Court Cards Section */}
        {filteredCards.some(card => card.category === 'court') && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-yellow-500">Cartas de Corte</h2>
              <button 
                onClick={() => setIsCourtCollapsed(!isCourtCollapsed)}
                className="p-1.5 rounded-full bg-purple-900/50 text-yellow-400 hover:bg-purple-800/50 transition-colors"
                aria-label={isCourtCollapsed ? "Expandir Cartas de Corte" : "Recolher Cartas de Corte"}
              >
                {isCourtCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Court Cards Explanation */}
            <div className={`bg-indigo-900/30 p-4 rounded-lg mb-4 transition-all duration-500 ease-in-out ${
              isCourtCollapsed ? 'max-h-0 opacity-0 mt-0 mb-0 overflow-hidden p-0' : 'max-h-[1000px] opacity-100'
            }`}>
              <p className="text-purple-200 mb-3">
                As <span className="text-yellow-400 font-medium">Cartas de Corte</span> no Tarot de Thoth representam a personificação das forças elementais em suas diversas combinações. Aleister Crowley modificou significativamente o sistema tradicional de corte, substituindo os Cavaleiros por Príncipes e renomeando os Pajens como Princesas.
              </p>
              <p className="text-purple-300 text-sm mb-3">
                Cada figura de corte representa uma combinação específica de elementos, correspondendo a tipos psicológicos e modos de manifestação da energia. No sistema de Crowley, estas cartas estão diretamente relacionadas à fórmula de Tetragrammaton (YHVH) e aos quatro mundos da Cabala.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="bg-indigo-900/40 p-3 rounded border border-purple-800/30">
                  <h4 className="text-yellow-400 text-sm font-medium mb-1">Reis (Cavaleiro de Copas)</h4>
                  <p className="text-purple-300 text-xs">
                    Representam o elemento Fogo, o aspecto Yod no Tetragrammaton, e Atziluth (o Mundo das Emanações). São figuras de autoridade, poder e realização, expressando a energia máxima do seu naipe em sua forma mais dinâmica e expansiva.
                  </p>
                </div>
                <div className="bg-indigo-900/40 p-3 rounded border border-purple-800/30">
                  <h4 className="text-yellow-400 text-sm font-medium mb-1">Rainhas</h4>
                  <p className="text-purple-300 text-xs">
                    Representam o elemento Água, o aspecto Heh no Tetragrammaton, e Briah (o Mundo da Criação). São receptivas e formativas, expressando a internalização e estabilização das energias do seu naipe, operando através da intuição e sabedoria.
                  </p>
                </div>
                <div className="bg-indigo-900/40 p-3 rounded border border-purple-800/30">
                  <h4 className="text-yellow-400 text-sm font-medium mb-1">Príncipes</h4>
                  <p className="text-purple-300 text-xs">
                    Representam o elemento Ar, o aspecto Vau no Tetragrammaton, e Yetzirah (o Mundo da Formação). São intelectuais e transformadores, expressando o aspecto consciente e analítico do seu naipe, atuando como mediadores e agentes de mudança.
                  </p>
                </div>
                <div className="bg-indigo-900/40 p-3 rounded border border-purple-800/30">
                  <h4 className="text-yellow-400 text-sm font-medium mb-1">Princesas</h4>
                  <p className="text-purple-300 text-xs">
                    Representam o elemento Terra, o aspecto Heh final no Tetragrammaton, e Assiah (o Mundo da Ação). São manifestações físicas e práticas, expressando a cristalização completa das energias do seu naipe no mundo material e tangível.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowCourtCards(!showCourtCards)}
                  className="px-6 py-2.5 bg-indigo-800 hover:bg-indigo-700 text-yellow-400 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 font-medium"
                >
                  {showCourtCards ? (
                    <>
                      <ChevronUp className="w-5 h-5" />
                      <span>Ocultar Cartas</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      <span>Ver Cartas</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
              !showCourtCards ? 'max-h-0 opacity-0 mt-0 mb-0' : 'max-h-[5000px] opacity-100 mt-4 mb-6'
            }`}>
            
            {/* Bastões Court Cards */}
            {filteredCards.some(card => card.category === 'court' && card.suit === 'Bastões') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Bastões</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 place-items-center justify-items-center px-2 sm:px-0 card-grid">
                  {(() => {
                    // Get Wands court cards
                    const wandsCourtCards = filteredCards.filter(card => 
                      card.category === 'court' && card.suit === 'Bastões'
                    );
                    
                    console.log('Rendering Wands court cards section, found:', wandsCourtCards.length, 'cards');
                    
                    // Log details before sorting
                    wandsCourtCards.forEach(card => {
                      const rank = card.id.split('-')[0];
                      console.log(`Pre-sort: ${card.name}, ID: ${card.id}, Rank: ${rank}`);
                    });
                    
                    // Correctly use the same rank order as defined above
                    const sortedWandsCards = [...wandsCourtCards].sort((a, b) => {
                      const aRank = a.id.split('-')[0];
                      const bRank = b.id.split('-')[0];
                      const aIndex = courtRankOrder.indexOf(aRank);
                      const bIndex = courtRankOrder.indexOf(bRank);
                      
                      // Log any cards with unrecognized ranks
                      if (aIndex === -1) console.error(`Unrecognized rank for card: ${a.name}, ID: ${a.id}, extracted rank: ${aRank}`);
                      if (bIndex === -1) console.error(`Unrecognized rank for card: ${b.name}, ID: ${b.id}, extracted rank: ${bRank}`);
                      
                      return aIndex - bIndex;
                    });
                    
                    // Log details after sorting
                    console.log('Sorted Wands court cards:');
                    sortedWandsCards.forEach((card, index) => {
                      const rank = card.id.split('-')[0];
                      console.log(`Post-sort [${index}]: ${card.name}, ID: ${card.id}, Rank: ${rank}`);
                    });
                    
                    // Render the 4 court cards
                    const renderedCards = sortedWandsCards.map((card) => {
                      console.log(`Rendering Wands court card: ${card.name}, ID: ${card.id}`);
                      return (
                        <TarotCardComponent 
                          key={card.id} 
                          card={card} 
                          onClick={handleCardClick}
                        />
                      );
                    });
                    
                    return renderedCards;
                  })()}
                </div>
              </div>
            )}
            
            {/* Copas Court Cards */}
            {filteredCards.some(card => card.category === 'court' && card.suit === 'Copas') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Copas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 place-items-center justify-items-center px-2 sm:px-0 card-grid">
                  {(() => {
                    // Get Cups court cards
                    const cupsCourtCards = filteredCards.filter(card => 
                      card.category === 'court' && card.suit === 'Copas'
                    );
                    
                    console.log('Rendering Cups court cards section, found:', cupsCourtCards.length, 'cards');
                    
                    // Log details before sorting
                    cupsCourtCards.forEach(card => {
                      const rank = card.id.split('-')[0];
                      console.log(`Cups pre-sort: ${card.name}, ID: ${card.id}, Rank: ${rank}`);
                    });
                    
                    // Sort using Cups-specific rank order
                    const sortedCupsCards = [...cupsCourtCards].sort((a, b) => {
                      const aRank = a.id.split('-')[0];
                      const bRank = b.id.split('-')[0];
                      const aIndex = cupsRankOrder.indexOf(aRank);
                      const bIndex = cupsRankOrder.indexOf(bRank);
                      
                      // Log any cards with unrecognized ranks
                      if (aIndex === -1) console.error(`Unrecognized rank for Cups card: ${a.name}, ID: ${a.id}, extracted rank: ${aRank}`);
                      if (bIndex === -1) console.error(`Unrecognized rank for Cups card: ${b.name}, ID: ${b.id}, extracted rank: ${bRank}`);
                      
                      return aIndex - bIndex;
                    });
                    
                    // Log details after sorting
                    console.log('Sorted Cups court cards:');
                    sortedCupsCards.forEach((card, index) => {
                      const rank = card.id.split('-')[0];
                      console.log(`Cups post-sort [${index}]: ${card.name}, ID: ${card.id}, Rank: ${rank}`);
                    });
                    
                    // Render the 4 court cards
                    const renderedCards = sortedCupsCards.map((card) => (
                      <TarotCardComponent 
                        key={card.id} 
                        card={card} 
                        onClick={handleCardClick}
                      />
                    ));
                    
                    return renderedCards;
                  })()}
                </div>
              </div>
            )}
            
            {/* Espadas Court Cards */}
            {filteredCards.some(card => card.category === 'court' && card.suit === 'Espadas') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Espadas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 place-items-center justify-items-center px-2 sm:px-0 card-grid">
                  {(() => {
                    // Get Swords court cards
                    const swordsCourtCards = filteredCards.filter(card => 
                      card.category === 'court' && card.suit === 'Espadas'
                    );
                    
                    // Sort using standard rank order
                    const sortedSwordsCards = [...swordsCourtCards].sort((a, b) => {
                      const aRank = a.id.split('-')[0];
                      const bRank = b.id.split('-')[0];
                      const aIndex = courtRankOrder.indexOf(aRank);
                      const bIndex = courtRankOrder.indexOf(bRank);
                      return aIndex - bIndex;
                    });
                    
                    // Render the 4 court cards
                    const renderedCards = sortedSwordsCards.map((card) => (
                      <TarotCardComponent 
                        key={card.id} 
                        card={card} 
                        onClick={handleCardClick}
                      />
                    ));
                    
                    return renderedCards;
                  })()}
                </div>
              </div>
            )}
            
            {/* Discos Court Cards */}
            {filteredCards.some(card => card.category === 'court' && card.suit === 'Discos') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">Discos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 place-items-center justify-items-center px-2 sm:px-0 card-grid">
                  {(() => {
                    // Get Disks court cards
                    const disksCourtCards = filteredCards.filter(card => 
                      card.category === 'court' && card.suit === 'Discos'
                    );
                    
                    // Sort using standard rank order
                    const sortedDisksCards = [...disksCourtCards].sort((a, b) => {
                      const aRank = a.id.split('-')[0];
                      const bRank = b.id.split('-')[0];
                      const aIndex = courtRankOrder.indexOf(aRank);
                      const bIndex = courtRankOrder.indexOf(bRank);
                      return aIndex - bIndex;
                    });
                    
                    // Render the 4 court cards
                    const renderedCards = sortedDisksCards.map((card) => (
                      <TarotCardComponent 
                        key={card.id} 
                        card={card} 
                        onClick={handleCardClick}
                      />
                    ));
                    
                    return renderedCards;
                  })()}
                </div>
              </div>
            )}
            </div>
          </div>
        )}
      </div>
      
      {/* No Results Message */}
      {filteredCards.length === 0 && (
        <div className="text-center py-12 text-purple-300">
          <p className="text-xl mb-2">Nenhuma carta encontrada</p>
          <p>Tente ajustar seus critérios de busca</p>
        </div>
      )}
      
      {/* Modal */}
      <CardModal card={selectedCard} onClose={handleCloseModal} />
    </div>
  );
};
