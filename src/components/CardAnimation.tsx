// New file: CardAnimation.tsx
import React from 'react';

const CardAnimation: React.FC = () => {
  // Select key cards from the deck to display (important arcana cards and the back)
  const selectedCardNumbers = [1, 10, 22, 35, 50, 77]; // Important cards from the deck
  const cardImages = [
    ...selectedCardNumbers.map(num => `${num}.png`),
    'verso baralho.png' // Back of the card
  ];
  
  // Generate random positions for each card
  const cards = cardImages.map((image, index) => {
    // Create varied animations by using different animation classes
    const animationClass = `animate-float-${index % 3 + 1}`;
    
    // Randomize starting positions across the screen
    const top = Math.random() * 90 + 5; // Keep cards mostly in view (5-95%)
    const left = Math.random() * 90 + 5;
    // Randomize rotation (subtle for important cards, more rotation for backs)
    const rotate = image === 'verso baralho.png' 
      ? Math.random() * 360 
      : Math.random() * 40 - 20; // -20 to +20 degrees for main cards
    
    // Randomize scale (slightly smaller or larger)
    const scale = 0.5 + Math.random() * 0.5; // 0.5 to 1.0 scale
    
    // Randomize z-index within background range (but still behind content)
    const zIndex = -10 + Math.floor(Math.random() * 10);
    
    return { image, top, left, rotate, scale, zIndex, animationClass };
  });

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {cards.map((card, index) => (
        <img
          key={index}
                  src={`/cards/${card.image}?url`}
          alt="floating card"
          className={`floating-card ${card.animationClass}`}
          style={{
            position: "absolute",
            top: `${card.top}%`,
            left: `${card.left}%`,
            transform: `translate(-50%, -50%) rotate(${card.rotate}deg) scale(${card.scale})`,
            zIndex: card.zIndex,
            opacity: 0.6, // Make cards semi-transparent
            filter: "drop-shadow(0 0 8px rgba(138, 43, 226, 0.6))", // Add subtle glow
          }}
        />
      ))}
    </div>
  );
};

export default CardAnimation;
