import React, { useState } from 'react';
import { TarotCard } from '../types/tarot';
import { Star, Crown, Sword, Coins, Wand, Heart, Eye, AlertCircle } from 'lucide-react';

interface TarotCardProps {
  card: TarotCard;
  onClick: (card: TarotCard) => void;
  isReversed?: boolean;
}

const getSuitIcon = (suit: string) => {
  switch (suit) {
    case 'Bastões':
      return <Wand className="w-4 h-4" />;
    case 'Copas':
      return <Heart className="w-4 h-4" />;
    case 'Espadas':
      return <Sword className="w-4 h-4" />;
    case 'Discos':
      return <Coins className="w-4 h-4" />;
    default:
      return <Star className="w-4 h-4" />;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'major':
      return <Crown className="w-3.5 h-3.5" />;
    case 'court':
      return <Eye className="w-3.5 h-3.5" />;
    default:
      return <Star className="w-3.5 h-3.5" />;
  }
};

// Maps card ID to correct image file number, accounting for covers and description pages
const getImageId = (card: TarotCard): number => {
  // Images 1 and 2 are covers, so Major Arcana starts at image 3
  // Images 25, 36, 47, 58 and 69 are description pages that should be skipped
  
  // Major Arcana: images 3-24 (skipping covers 1-2)
  if (card.category === 'major') {
    // Convert roman numerals or '0' to numbers 3-24
    if (card.number === '0') return 3; // The Fool
    if (card.number === 'I') return 4; // The Magus
    if (card.number === 'II') return 5; // The Priestess
    if (card.number === 'III') return 6; // The Empress
    if (card.number === 'IV') return 7; // The Emperor
    if (card.number === 'V') return 8; // The Hierophant
    if (card.number === 'VI') return 9; // The Lovers
    if (card.number === 'VII') return 10; // The Chariot
    if (card.number === 'VIII') return 11; // Adjustment
    if (card.number === 'IX') return 12; // The Hermit
    if (card.number === 'X') return 13; // Fortune
    if (card.number === 'XI') return 14; // Lust
    if (card.number === 'XII') return 15; // The Hanged Man
    if (card.number === 'XIII') return 16; // Death
    if (card.number === 'XIV') return 17; // Art
    if (card.number === 'XV') return 18; // The Devil
    if (card.number === 'XVI') return 19; // The Tower
    if (card.number === 'XVII') return 20; // The Star
    if (card.number === 'XVIII') return 21; // The Moon
    if (card.number === 'XIX') return 22; // The Sun
    if (card.number === 'XX') return 23; // The Aeon
    if (card.number === 'XXI') return 24; // The Universe
  }
  
  // Minor Arcana with adjustments for description pages
  if (card.category === 'minor') {
    // Base image index for minor arcana (after major arcana ends)
    const baseIndex = 24;
    
    // Description pages to skip: 25, 36, 47, 58
    const getAdjustedIndex = (baseIdx: number, rankValue: number) => {
      let adjustedIdx = baseIdx + rankValue;
      
      // Skip description pages
      if (adjustedIdx >= 25) adjustedIdx++; // Skip image 25 (Wands description)
      if (adjustedIdx >= 36) adjustedIdx++; // Skip image 36 (Cups description)
      if (adjustedIdx >= 47) adjustedIdx++; // Skip image 47 (Swords description)
      if (adjustedIdx >= 58) adjustedIdx++; // Skip image 58 (Disks description)
      
      return adjustedIdx;
    };
    
    // Add rank value (Ace = 1, numbers are as is)
    let rankValue = 0;
    if (card.number === 'Ás') {
      rankValue = 1;
    } else {
      // Convert string numbers to integers
      rankValue = parseInt(card.number || '0', 10);
    }
    
    // Handle each suit with their base indices
    if (card.suit === 'Bastões') { // Wands: 26-35 (after skipping description at 25)
      return getAdjustedIndex(baseIndex, rankValue);
    } else if (card.suit === 'Copas') { // Cups: 37-46 (after skipping description at 36)
      return getAdjustedIndex(baseIndex + 10, rankValue);
    } else if (card.suit === 'Espadas') { // Swords: 48-57 (after skipping description at 47)
      return getAdjustedIndex(baseIndex + 20, rankValue);
    } else if (card.suit === 'Discos') { // Disks: 59-68 (after skipping description at 58)
      return getAdjustedIndex(baseIndex + 30, rankValue);
    }
  }
  
  // Court Cards: images 70-85 (after skipping description at 69)
  if (card.category === 'court') {
    // Detailed logging for all court cards
    console.log('Processing court card:', {
      name: card.name,
      suit: card.suit,
      id: card.id,
      category: card.category
    });
    
    // Skip image 69 which is a description page
    const baseIndex = 69;
    
    // Direct mapping based on the correct sequence for court cards:
    // - Wands: King(70), Queen(71), Prince(72), Princess(73)
    // - Cups: Knight(74), Queen(75), Prince(76), Princess(77)
    // - Swords: King(78), Queen(79), Prince(80), Princess(81)
    // - Disks: King(82), Queen(83), Prince(84), Princess(85)
    
    // For Wands court cards - positioned at 70-73, before the Cups cards start at 74
    // For Wands court cards - positioned at 70-73
    if (card.suit === 'Bastões') {
      console.log('Processing Wands court card:', {
        name: card.name,
        id: card.id,
        suit: card.suit,
        category: card.category,
        fullId: card.id
      });
      
      // Extract rank and suitPart from ID (e.g., 'king' and 'wands' from 'king-wands')
      const idParts = card.id.split('-');
      const [rank, suitPart] = idParts;
      
      // Log all parts obtained from splitting
      console.log('Wands card ID parts:', {
        fullId: card.id,
        idParts,
        rank,
        suitPart
      });
      
      // Verify that both parts exist
      if (!rank || !suitPart) {
        console.error('Invalid ID format for Wands card. Expected format: "rank-suit", got:', card.id);
        return 3; // Return a default value if format is invalid
      }
      
      // Use a mapping object for more robust handling
      const rankToImageMap = {
        'king': 70,
        'queen': 71,
        'prince': 72,
        'princess': 73
      };
      
      // Check if the rank is in our mapping
      if (rank in rankToImageMap) {
        const imageId = rankToImageMap[rank];
        console.log(`Mapped Wands ${rank} to image ID: ${imageId}`);
        return imageId;
      }
      
      // If we get here, something is wrong with the rank
      console.error('Invalid rank for Wands court card:', {
        rank,
        validRanks: Object.keys(rankToImageMap),
        cardId: card.id,
        cardName: card.name
      });
      return 3; // Default fallback
    }
    
    // For Cups court cards
    if (card.suit === 'Copas') {
      if (card.id.split('-')[0] === 'knight') return 74;
      if (card.id.split('-')[0] === 'queen') return 75;
      if (card.id.split('-')[0] === 'prince') return 76;
      if (card.id.split('-')[0] === 'princess') return 77;
    }
    
    // For Swords court cards
    if (card.suit === 'Espadas') {
      if (card.id.split('-')[0] === 'king') return 78; // King of Swords
      if (card.id.split('-')[0] === 'queen') return 79;
      if (card.id.split('-')[0] === 'prince') return 80;
      if (card.id.split('-')[0] === 'princess') return 81;
    }
    
    // For Disks court cards
    if (card.suit === 'Discos') {
      if (card.id.split('-')[0] === 'king') return 82; // King of Disks
      if (card.id.split('-')[0] === 'queen') return 83;
      if (card.id.split('-')[0] === 'prince') return 84;
      if (card.id.split('-')[0] === 'princess') return 85;
    }
    
    // We log this for debugging but don't use the fallback calculation
    // as it might interfere with proper mapping
    console.warn('No specific court card mapping found for', card.name);
  }
  
  // Fallback: Log error and return 3 if we can't determine the image ID
  console.error('Failed to determine image ID for card:', {
    name: card.name,
    suit: card.suit,
    id: card.id,
    category: card.category
  });
  
  return 3;
};

export const TarotCardComponent: React.FC<TarotCardProps> = ({ card, onClick, isReversed = false }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const imageId = getImageId(card);
  console.log('Card details:', {
    name: card.name,
    suit: card.suit,
    id: card.id,
    category: card.category,
    imageId: imageId
  });
  
  // Add error boundary logging
  const imagePath = `/cards/${imageId}.png?url`;
  console.log('Attempting to load image:', imagePath);
  
  // Update the error handler to log more details
  const handleImageError = () => {
    console.error('Failed to load image:', {
      path: imagePath,
      cardName: card.name,
      imageId: imageId
    });
    setImageError(true);
  };

  return (
    <div 
      className="relative bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/25 border border-purple-700/50 mx-auto tarot-card-container"
      onClick={() => onClick(card)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ aspectRatio: '3/5', width: '100%', maxWidth: '200px' }}
    >
      {/* Card Image */}
      <div 
        className={`w-full h-full transition-transform duration-700 ${isReversed ? 'rotate-180' : ''}`}
      >
        {imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-purple-900/80">
            <AlertCircle className="w-12 h-12 text-yellow-400 mb-2" />
            <h3 className="text-lg font-bold text-white text-center">{card.name}</h3>
            <p className="text-purple-200 text-sm text-center">{card.englishName}</p>
          </div>
        ) : (
          <img 
            src={imagePath} 
            alt={card.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        )}
      </div>

      {/* Hover Overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b from-purple-900/80 to-indigo-900/90 p-2.5 flex flex-col transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-1.5">
            {card.category === 'major' && (
              <div className="text-yellow-400">
                <Crown className="w-3.5 h-3.5" />
              </div>
            )}
            {card.suit && (
              <div className="text-purple-300">
                {getSuitIcon(card.suit)}
              </div>
            )}
            {card.number && (
              <span className="text-yellow-400 font-bold text-sm">
                {card.number}
              </span>
            )}
          </div>
          <div className="text-purple-300">
            {getCategoryIcon(card.category)}
          </div>
        </div>
        
        <div className="text-center flex-grow flex flex-col justify-between">
          <div className="mx-auto max-w-full px-1">
            <h3 className="text-base font-bold text-white mb-0.5 text-center truncate">{card.name}</h3>
            <p className="text-purple-200 text-2xs mb-0.5 text-center truncate">{card.englishName}</p>
            {card.element && (
              <p className="text-yellow-400 text-3xs mb-0.5 font-semibold text-center">{card.element}</p>
            )}
          </div>
          
          <div className="mx-auto max-w-full px-1">
            <p className="text-purple-100 text-3xs leading-tight mb-1 line-clamp-3 text-center">
              {card.description}
            </p>
            <div className="flex flex-wrap gap-0.5 justify-center">
              {card.keywords.slice(0, 3).map((keyword, index) => (
                <span 
                  key={index} 
                  className="bg-purple-700/70 text-purple-200 px-1 py-0.5 rounded-full text-3xs"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};