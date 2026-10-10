import React from 'react';
import { ReadingCard, SpreadType } from '../../types/tarot';
import { TarotCardComponent } from '../TarotCard';
import { HelpCircle, Sparkles } from 'lucide-react';
import { RevealState } from '../../hooks/useCardReveal';

interface SpreadLayoutProps {
  spread: SpreadType;
  readingCards: ReadingCard[];
  isRevealed: boolean[];
  getCardStyle?: (index: number, spreadType: SpreadType) => React.CSSProperties;
  isCurrentlyRevealing?: (index: number) => boolean;
  revealState: RevealState;
  onCardClick: (card: ReadingCard) => void;
}

export const SpreadLayout: React.FC<SpreadLayoutProps> = ({ 
  spread, 
  readingCards, 
  isRevealed,
  getCardStyle,
  isCurrentlyRevealing,
  revealState,
  onCardClick 
}) => {
  const getCardForPosition = (positionId: string): ReadingCard | null => {
    return readingCards.find(rc => rc.position.id === positionId) || null;
  };

  // Tree of Life connecting lines for the Kabbalah spread
  const renderTreeOfLifeConnections = () => {
    if (spread.id !== 'tree-of-life') return null;
    
    return (
      <svg className="absolute inset-0 w-full h-full z-0" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Background paths with glow effect */}
        <g stroke="rgba(147, 112, 219, 0.3)" strokeWidth="4" filter="url(#glow)" opacity="0.4">
          {/* Pillars */}
          <path d="M 50% 5% L 20% 15% L 20% 35% L 20% 65%" />
          <path d="M 50% 5% L 80% 15% L 80% 35% L 80% 65%" />
          <path d="M 50% 5% L 50% 45% L 50% 75% L 50% 95%" />
        </g>
        
        {/* Main connection lines */}
        <g stroke="rgba(147, 112, 219, 0.7)" strokeWidth="2" strokeDasharray="5,3" opacity="0.7">
          {/* Pillar of Mercy: Kether-Chokmah-Chesed-Netzach */}
          <path d="M 50% 5% L 20% 15% L 20% 35% L 20% 65%" />
          
          {/* Pillar of Severity: Kether-Binah-Geburah-Hod */}
          <path d="M 50% 5% L 80% 15% L 80% 35% L 80% 65%" />
          
          {/* Middle Pillar: Kether-Tiphareth-Yesod-Malkuth */}
          <path d="M 50% 5% L 50% 45% L 50% 75% L 50% 95%" />
          
          {/* Horizontal Connections */}
          <path d="M 20% 15% L 80% 15%" /> {/* Chokmah-Binah */}
          <path d="M 20% 35% L 80% 35%" /> {/* Chesed-Geburah */}
          <path d="M 20% 65% L 80% 65%" /> {/* Netzach-Hod */}
          
          {/* Diagonal Connections */}
          <path d="M 20% 15% L 50% 45%" /> {/* Chokmah-Tiphareth */}
          <path d="M 80% 15% L 50% 45%" /> {/* Binah-Tiphareth */}
          <path d="M 20% 35% L 50% 45%" /> {/* Chesed-Tiphareth */}
          <path d="M 80% 35% L 50% 45%" /> {/* Geburah-Tiphareth */}
          <path d="M 20% 65% L 50% 75%" /> {/* Netzach-Yesod */}
          <path d="M 80% 65% L 50% 75%" /> {/* Hod-Yesod */}
          <path d="M 50% 45% L 20% 65%" /> {/* Tiphareth-Netzach */}
          <path d="M 50% 45% L 80% 65%" /> {/* Tiphareth-Hod */}
        </g>
        
        {/* Position markers */}
        <g fill="rgba(147, 112, 219, 0.2)" stroke="rgba(147, 112, 219, 0.4)" strokeWidth="1">
          <circle cx="50%" cy="5%" r="10" /> {/* Kether */}
          <circle cx="20%" cy="15%" r="10" /> {/* Chokmah */}
          <circle cx="80%" cy="15%" r="10" /> {/* Binah */}
          <circle cx="20%" cy="35%" r="10" /> {/* Chesed */}
          <circle cx="80%" cy="35%" r="10" /> {/* Geburah */}
          <circle cx="50%" cy="45%" r="10" /> {/* Tiphareth */}
          <circle cx="20%" cy="65%" r="10" /> {/* Netzach */}
          <circle cx="80%" cy="65%" r="10" /> {/* Hod */}
          <circle cx="50%" cy="75%" r="10" /> {/* Yesod */}
          <circle cx="50%" cy="95%" r="10" /> {/* Malkuth */}
        </g>
      </svg>
    );
  };

  // Celtic Cross connecting lines
  const renderCelticCrossConnections = () => {
    if (spread.id !== 'celtic-cross') return null;
    
    return (
      <svg className="absolute inset-0 w-full h-full z-0" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="celticGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Background effect */}
        <g stroke="rgba(147, 112, 219, 0.3)" strokeWidth="4" filter="url(#celticGlow)" opacity="0.4">
          <path d="M 45% 10% L 45% 70%" /> {/* Vertical spine */}
          <path d="M 25% 40% L 65% 40%" /> {/* Horizontal cross */}
          <path d="M 65% 40% L 80% 20% L 80% 80%" /> {/* Staff */}
        </g>
        
        {/* Main connection lines */}
        <g stroke="rgba(147, 112, 219, 0.7)" strokeWidth="2" strokeDasharray="5,3" opacity="0.7">
          {/* Vertical spine */}
          <path d="M 45% 10% L 45% 70%" />
          
          {/* Horizontal cross */}
          <path d="M 25% 40% L 65% 40%" />
          
          {/* Staff connecting line */}
          <path d="M 65% 40% L 80% 20% L 80% 80%" />
        </g>
        
        {/* Position markers */}
        <g fill="rgba(147, 112, 219, 0.2)" stroke="rgba(147, 112, 219, 0.4)" strokeWidth="1">
          <circle cx="45%" cy="40%" r="12" /> {/* Center/Present */}
          <circle cx="55%" cy="40%" r="10" /> {/* Crossing */}
          <circle cx="45%" cy="10%" r="10" /> {/* Above/Conscious */}
          <circle cx="45%" cy="70%" r="10" /> {/* Below/Unconscious */}
          <circle cx="25%" cy="40%" r="10" /> {/* Past */}
          <circle cx="65%" cy="40%" r="10" /> {/* Future */}
          <circle cx="80%" cy="20%" r="8" /> {/* Position 7 */}
          <circle cx="80%" cy="40%" r="8" /> {/* Position 8 */}
          <circle cx="80%" cy="60%" r="8" /> {/* Position 9 */}
          <circle cx="80%" cy="80%" r="8" /> {/* Position 10 */}
        </g>
      </svg>
    );
  };
  
  // Helper function to determine the appropriate card size based on screen width and spread type
  const getCardSize = () => {
    // Return sizing classes based on the spread type and number of cards
    // Standardize card size for all spreads
    return 'w-24 sm:w-28 md:w-32 lg:w-36 xl:w-40';
  };
  
  // Adjust card coordinates based on screen size and spread type
  const getCardCoordinates = (position: { x: number, y: number, id: string, name: string, rotation?: number }) => {
    // Adjust card coordinates based on spread type for better spacing
    let x = position.x;
    let y = position.y;
    
    if (spread.id === 'tree-of-life') {
      // Adjusted positions for Tree of Life to match the connection lines
      if (position.id === 'kether') y = 5;
      if (position.id === 'chokmah') { x = 25; y = 10; } // Adjust position for improved spacing
      if (position.id === 'binah') { x = 75; y = 10; } // Adjust position for improved spacing
      if (position.id === 'chesed') { x = 25; y = 30; } // Adjust position for improved spacing
      if (position.id === 'geburah') { x = 75; y = 30; } // Adjust position for improved spacing
      if (position.id === 'tiphareth') { x = 50; y = 40; } // Adjust position for improved spacing
      if (position.id === 'netzach') { x = 25; y = 60; } // Adjust position for improved spacing
      if (position.id === 'hod') { x = 75; y = 60; } // Adjust position for improved spacing
      if (position.id === 'yesod') { x = 50; y = 75; }
      if (position.id === 'malkuth') { x = 50; y = 95; }
    } else if (spread.id === 'celtic-cross') {
      // Significantly adjusted positions for Celtic Cross to prevent overlapping
      if (position.id === 'present') { x = 45; y = 40; }
      if (position.id === 'crossing') { x = 45; y = 40; }
      if (position.id === 'above') { x = 45; y = 15; }
      if (position.id === 'below') { x = 45; y = 65; }
      if (position.id === 'past') { x = 20; y = 40; }
      if (position.id === 'future') { x = 70; y = 40; }
      if (position.id === 'attitudes') { x = 90; y = 15; }
      if (position.id === 'environment') { x = 90; y = 35; }
      if (position.id === 'hopes') { x = 90; y = 55; }
      if (position.id === 'outcome') { x = 90; y = 75; }
    } else if (spread.id === 'three-card') {
      // Improve spacing for three-card spread
      if (position.id === 'past') x = 20;
      if (position.id === 'present') x = 50; // Center card
      if (position.id === 'future') x = 75; // Space out future card
      y = 50; // Maintain vertical centering
    }
    
    return { x, y };
  };
  
  // Define animation classes based on reveal state
  const getAnimationClass = (index: number) => {
    const revealed = isRevealed[index];
    const isRevealing = isCurrentlyRevealing && isCurrentlyRevealing(index);
    
    if (isRevealing) {
      return 'animate-cardReveal';
    } else if (revealed) {
      if (revealState === 'complete') {
        // Apply different float animation to each card for a more natural look
        const floatVariants = ['animate-cardFloat', 'animate-cardFloatSlow', 'animate-cardFloatDelayed'];
        return floatVariants[index % floatVariants.length];
      }
      return 'animate-cardFloat';
    }
    return '';
  };
  
  // Helper to generate a slight random rotation for cards 
  const getRandomRotation = (position: { rotation?: number }, index: number) => {
    // If a specific rotation is defined, use that
    if (position.rotation !== undefined) return position.rotation;
    
    // For Celtic Cross, the crossing card should be perpendicular
    if (spread.id === 'celtic-cross' && position.id === 'crossing') return 90;
    
    // Generate a slight random rotation based on the index 
    // Use a deterministic pattern for consistency
    const baseRotations = [-2, 2, -1, 1, 0, -1.5, 1.5];
    return baseRotations[index % baseRotations.length];
  };

  return (
    <div className="relative min-h-[500px] md:min-h-[600px] lg:min-h-[700px] w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
      {/* Background gradient with enhanced visual effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-purple-900/20 rounded-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,112,219,0.1),transparent_70%)]"></div>
      </div>
      
      {/* Connection lines based on spread type */}
      {spread.id === 'tree-of-life' && renderTreeOfLifeConnections()}
      {spread.id === 'celtic-cross' && renderCelticCrossConnections()}
      
      {/* Display spread name and description */}
      <div className="text-center mb-6 z-10 relative">
        <h3 className="text-xl font-medium text-indigo-200 mb-2">{spread.name} Spread</h3>
        <p className="text-xs sm:text-sm text-indigo-300/80 max-w-xl mx-auto leading-relaxed">
          {spread.id === 'three-card' && "Past, Present, Future: A simple spread revealing timeline insights for your question"}
          {spread.id === 'celtic-cross' && "A comprehensive spread examining various aspects of your situation, challenges, and potential outcomes"}
          {spread.id === 'tree-of-life' && "Based on Kabbalah, this spread reveals spiritual and material connections across different aspects of life"}
        </p>
        {revealState === 'drawing' && (
          <div className="mt-2 text-yellow-300/80 text-xs animate-pulse">
            Drawing cards... <span className="inline-block animate-spin ml-1">⋮</span>
          </div>
        )}
      </div>
      
      {/* Position the cards according to the layout */}
      {spread.layout.map((position, index) => {
        const readingCard = getCardForPosition(position.id);
        const revealed = isRevealed[index];
        const cardSizeClass = getCardSize();
        const animationClass = getAnimationClass(index);
        const isRevealing = isCurrentlyRevealing && isCurrentlyRevealing(index);
        const { x, y } = getCardCoordinates(position);
        const rotation = getRandomRotation(position, index);
        
        // Use the getCardStyle from the hook if available, otherwise use inline styles
        const cardStyle = getCardStyle 
          ? getCardStyle(index, spread)
          : {
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              zIndex: revealed ? (20 + index) : (10 + index),
              opacity: revealed ? 1 : 0.8,
              scale: revealed ? '1' : '0.92',
              transition: 'all 0.5s cubic-bezier(0.17, 0.67, 0.83, 0.67)'
            };
        
        return (
          <div 
            key={position.id}
            className={`absolute transition-all duration-700 ${animationClass}`}
            style={cardStyle}
          >
            {readingCard && revealed ? (
              <div 
                onClick={() => onCardClick(readingCard)}
                className={`cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30 hover:z-50 ${isRevealing ? 'animate-pulse' : ''}`}
                data-position={position.id}
              >
                <div className={`relative ${cardSizeClass} aspect-[2/3]`}>
                  <TarotCardComponent 
                    card={readingCard.card} 
                    onClick={() => {}} 
                    isReversed={readingCard.isReversed}
                  />
                  
                  {/* Card highlight effect for the currently revealing card */}
                  {isRevealing && (
                    <div className="absolute inset-0 border-2 border-yellow-400 rounded-lg animate-pulse pointer-events-none z-20">
                      <div className="absolute inset-0 bg-yellow-400/10 rounded-lg"></div>
                    </div>
                  )}
                  
                  {/* Position name label with improved visibility */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-indigo-900/90 text-yellow-300 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap border border-purple-500/50 shadow-lg backdrop-blur-sm">
                    {position.name}
                  </div>
                  
                  {/* Position number indicator */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-700 text-yellow-300 flex items-center justify-center text-xs font-bold shadow-md border border-purple-500/30">
                    {index + 1}
                  </div>
                  
                  {/* Visual indicator that this card can be clicked for details */}
                  {revealState === 'complete' && (
                    <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-purple-700/80 text-yellow-300 flex items-center justify-center shadow-md opacity-80 hover:opacity-100 transition-opacity border border-purple-400/50 animate-pulse">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={`${cardSizeClass} aspect-[2/3] bg-gradient-to-br from-indigo-900/60 to-purple-800/60 rounded-lg border border-purple-500/30 flex flex-col items-center justify-center shadow-md overflow-hidden group transition-all duration-300 hover:shadow-purple-500/30 hover:border-purple-400/50 ${isRevealing ? 'animate-pulse' : ''}`}>
                {isRevealing ? (
                  <div className="animate-spin text-yellow-400/90">
                    <svg className="w-10 h-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <>
                    <HelpCircle className="w-10 h-10 text-purple-400/40 group-hover:text-purple-400/60 transition-colors" />
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/5 to-purple-700/5 group-hover:from-indigo-800/10 group-hover:to-purple-700/10 transition-all duration-500"></div>
                  </>
                )}
                <div className="text-purple-300/80 text-xs mt-2 text-center px-2 font-medium">
                  {position.name}
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-700/80 text-yellow-300/80 flex items-center justify-center text-xs font-bold shadow-md border border-purple-500/30">
                  {index + 1}
                </div>
                
                {/* Pulsing border effect for card being revealed */}
                {isRevealing && (
                  <div className="absolute inset-0 border-2 border-yellow-400/60 rounded-lg animate-pulse pointer-events-none">
                    <div className="absolute inset-0 bg-yellow-400/5 rounded-lg"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      
      {/* Legend for the spread (only shown for complex spreads) */}
      {(spread.id === 'celtic-cross' || spread.id === 'tree-of-life') && (
        <div className="absolute bottom-3 right-3 bg-indigo-950/80 backdrop-blur-sm rounded-lg p-3 z-30 text-xs text-indigo-200/90 border border-purple-600/50 shadow-lg">
          <div className="flex flex-col gap-2">
            <h4 className="font-medium text-yellow-300/90">Spread Legend</h4>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500/80"></div>
              <span>Card position connections</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
              <span>Active card being revealed</span>
            </div>
            <div className="flex items-center gap-2 text-xs opacity-80">
              <Sparkles className="w-3 h-3 text-yellow-300/90" />
              <span>Click cards for interpretation</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Spread completion indicator */}
      {revealState === 'complete' && (
        <div className="absolute bottom-3 left-3 bg-indigo-950/80 backdrop-blur-sm rounded-lg px-3 py-2 z-30 text-xs text-indigo-200/90 border border-purple-600/50 shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-300/90" />
            <span>All cards revealed - click any card for interpretation</span>
          </div>
        </div>
      )}
    </div>
  );
};
