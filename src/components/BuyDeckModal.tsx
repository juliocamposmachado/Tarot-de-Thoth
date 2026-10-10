import React, { useEffect, useState } from 'react';
import { X, ShoppingCart, ExternalLink } from 'lucide-react';

interface BuyDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoCloseTime?: number; // Time in milliseconds
}

export const BuyDeckModal: React.FC<BuyDeckModalProps> = ({ 
  isOpen, 
  onClose,
  autoCloseTime = 10000 // Default to 10 seconds
}) => {
  const [timeLeft, setTimeLeft] = useState(autoCloseTime / 1000);
  
  useEffect(() => {
    if (!isOpen) return;
    
    // Reset the timer when the modal opens
    setTimeLeft(autoCloseTime / 1000);
    
    // Start the countdown
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Clean up the timer when the component unmounts or the modal closes
    return () => clearInterval(timer);
  }, [isOpen, autoCloseTime, onClose]);
  
  if (!isOpen) return null;
  
  // Calculate progress percentage for the timer bar
  const progressPercentage = (timeLeft / (autoCloseTime / 1000)) * 100;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl p-6 max-w-md w-full border border-purple-700/50 relative animate-scaleIn shadow-2xl">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-purple-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5">
          <div 
            className="bg-yellow-400 h-full rounded-t-xl transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Countdown indicator */}
        <div className="absolute -top-10 right-0 bg-yellow-400 text-indigo-900 font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
          {timeLeft}
        </div>
        
        {/* Content */}
        <div className="text-center mt-4">
          <div className="w-20 h-20 mx-auto bg-purple-800/80 rounded-full flex items-center justify-center mb-4">
            <ShoppingCart className="w-10 h-10 text-yellow-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Adquira o Baralho de Thoth</h2>
          <p className="text-purple-200 text-sm mb-6">
            Tenha em mãos o poderoso Tarot de Thoth criado por Aleister Crowley e Lady Frieda Harris.
            Aproveite esta oferta especial!
          </p>
          
          <div className="bg-indigo-950/70 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-purple-300 text-sm">Preço:</span>
              <span className="text-yellow-400 font-bold text-xl">R$ 393,93</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-300 text-sm">Frete:</span>
              <span className="text-green-400 font-medium">Grátis</span>
            </div>
          </div>
          
          <a 
            href="https://mpago.la/1ajTuwR"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-yellow-500 hover:bg-yellow-600 text-indigo-900 font-bold py-3 px-4 rounded-lg transition-colors shadow-lg flex items-center justify-center"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Comprar Agora
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
          
          <p className="text-purple-400 text-xs mt-4">
            Esta oferta fechará em {timeLeft} segundos
          </p>
        </div>
      </div>
    </div>
  );
};
