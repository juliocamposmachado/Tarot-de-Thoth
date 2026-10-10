import React, { useEffect, useState } from 'react';

// Hermetic symbols as SVG paths
const hermeticSymbols = [
  "M12,2 L12,22 M2,12 L22,12", // Cross
  "M12,2 A10,10 0 1 0 12,22 A10,10 0 1 0 12,2 Z", // Circle
  "M12,2 L22,12 L12,22 L2,12 Z", // Square
  "M12,2 L17,12 L12,22 L7,12 Z", // Rhombus
  "M12,2 L2,12 L12,22 L22,12 Z", // Diamond
  "M12,2 L20,7 L20,17 L12,22 L4,17 L4,7 Z", // Hexagon
  "M12,2 L2,7 L2,17 L12,22 L22,17 L22,7 Z", // Hexagram
  "M12,2 L14.5,9.5 L22,12 L14.5,14.5 L12,22 L9.5,14.5 L2,12 L9.5,9.5 Z", // Star
];

interface SplashScreenProps {
  onFinished: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [currentSymbolIndex, setCurrentSymbolIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Change symbols every 500ms
    const symbolInterval = setInterval(() => {
      setCurrentSymbolIndex((prev) => (prev + 1) % hermeticSymbols.length);
    }, 500);

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 150);

    // Start fade out after 3 seconds
    const timer = setTimeout(() => {
      setFadeOut(true);
      
      // Call onFinished after fade animation completes
      setTimeout(onFinished, 1000);
    }, 3000);

    return () => {
      clearInterval(symbolInterval);
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [onFinished]);

  return (
    <div 
      className={`fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 z-50 transition-opacity duration-1000 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative w-40 h-40 mb-8">
        {/* Rotating outer circle */}
        <div className="absolute inset-0 animate-spin-slow">
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <circle 
              cx="12" 
              cy="12" 
              r="11" 
              fill="none" 
              stroke="#ffd700" 
              strokeWidth="0.5"
              strokeDasharray="69, 6"
            />
          </svg>
        </div>
        
        {/* Main hermetic symbol */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-3/4 h-3/4 text-yellow-400">
            <path 
              d={hermeticSymbols[currentSymbolIndex]} 
              stroke="currentColor" 
              strokeWidth="1.5" 
              fill="none"
              className="animate-pulse"
            />
          </svg>
        </div>
      </div>
      
      {/* Company name */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Tarot de Thoth</h1>
        <p className="text-purple-300">por Julio Campos Machado</p>
        <p className="text-yellow-400 text-sm mt-1">Like Look Solutions</p>
      </div>
      
      {/* Loading bar */}
      <div className="w-64 h-2 bg-purple-900 rounded-full overflow-hidden mb-2">
        <div 
          className="h-full bg-yellow-400 transition-all duration-150"
          style={{ width: `${loadingProgress}%` }}
        />
      </div>
      <p className="text-purple-300 text-sm">{loadingProgress}% Carregando...</p>
    </div>
  );
};
