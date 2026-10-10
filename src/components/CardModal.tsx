import React from 'react';
import { TarotCard } from '../types/tarot';
import { X, Star, Crown, Sword, Coins, Wand, Heart, Eye } from 'lucide-react';

interface CardModalProps {
  card: TarotCard | null;
  onClose: () => void;
}

const getSuitIcon = (suit: string) => {
  switch (suit) {
    case 'Bastões':
      return <Wand className="w-8 h-8" />;
    case 'Copas':
      return <Heart className="w-8 h-8" />;
    case 'Espadas':
      return <Sword className="w-8 h-8" />;
    case 'Discos':
      return <Coins className="w-8 h-8" />;
    default:
      return <Star className="w-8 h-8" />;
  }
};

export const CardModal: React.FC<CardModalProps> = ({ card, onClose }) => {
  if (!card) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-700/50 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-300 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {card.category === 'major' && (
              <div className="text-yellow-400">
                <Crown className="w-8 h-8" />
              </div>
            )}
            {card.suit && (
              <div className="text-purple-300">
                {getSuitIcon(card.suit)}
              </div>
            )}
            {card.number && (
              <span className="text-yellow-400 font-bold text-3xl">
                {card.number}
              </span>
            )}
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-2">{card.name}</h2>
          <p className="text-purple-200 text-xl mb-4">{card.englishName}</p>
          {card.element && (
            <p className="text-yellow-400 text-lg font-semibold mb-4">{card.element}</p>
          )}
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">Descrição</h3>
            <p className="text-purple-100 text-lg leading-relaxed">
              {card.description}
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">Palavras-chave</h3>
            <div className="flex flex-wrap gap-3">
              {card.keywords.map((keyword, index) => (
                <span 
                  key={index} 
                  className="bg-purple-700/50 text-purple-200 px-4 py-2 rounded-full text-sm font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          
          <div className="text-center pt-4">
            <div className="inline-flex items-center space-x-2 bg-purple-800/50 px-4 py-2 rounded-full">
              <Eye className="w-4 h-4 text-purple-300" />
              <span className="text-purple-200 text-sm">
                {card.category === 'major' ? 'Arcano Maior' : 
                 card.category === 'court' ? 'Carta da Corte' : 'Arcano Menor'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};