import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';

/**
 * ThothBookPDF component - Provides information about the Thoth Book
 * and a direct link to purchase it on Amazon instead of PDF generation
 */
export const ThothBookPDF: React.FC = () => {
  // Handle redirect to Amazon product page
  const handleRedirectToAmazon = () => {
    window.open('https://www.amazon.com.br/dp/B0FGWCYYHG', '_blank');
  };

  return (
    <div className="mt-8 mb-12">
      <div className="bg-indigo-900/50 rounded-lg p-6 border border-purple-700/30 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BookOpen className="w-6 h-6 text-yellow-400 mr-2" />
            <h3 className="text-xl font-bold text-white">O Livro de Thoth - eBook</h3>
          </div>
        </div>
        
        <p className="text-purple-300 mb-4">
          O Tarot de Thoth, criado por Aleister Crowley e ilustrado por Lady Frieda Harris entre 1938 e 1943, 
          representa uma das mais complexas e esotéricas interpretações do Tarot. Este baralho incorpora a 
          vasta compreensão de Crowley sobre magia cerimonial, astrologia, Qabalah e diversas tradições místicas.
        </p>
        
        <p className="text-purple-300 mb-6">
          Adquira a versão eBook do "Livro de Thoth" com interpretações detalhadas de todas as 78 cartas do Tarot,
          incluindo simbolismo, correspondências cabalísticas e astrológicas.
        </p>
        
        <div className="bg-indigo-950/70 p-4 rounded-md border border-purple-600/40 mb-6">
          <h4 className="text-yellow-400 font-semibold mb-2 text-center">O LIVRO INCLUI:</h4>
          <ul className="text-purple-300 space-y-2 text-sm">
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">•</span> 
              <span>Interpretações detalhadas para todos os 78 arcanos</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">•</span> 
              <span>Simbolismo e correspondências cabalísticas</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">•</span> 
              <span>Referências astrológicas para cada carta</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">•</span> 
              <span>Técnicas de leitura baseadas na tradição thelêmica</span>
            </li>
          </ul>
        </div>
        
        <button
          onClick={handleRedirectToAmazon}
          className="w-full py-3 px-6 bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
        >
          <ExternalLink className="w-5 h-5 mr-2" />
          <span>Ver o livro na Amazon</span>
        </button>
        
        <div className="mt-4 text-xs text-purple-400 text-center">
          O livro completo tem aproximadamente 80 páginas com interpretações detalhadas das 78 cartas.
          Disponível para leitura imediata após a compra.
        </div>
        
        <div className="mt-6 text-xs text-purple-400 text-center">
          <p>Para consultas ou contribuições: radiotatuapefm@gmail.com</p>
          <p className="mt-2">"Amor é a lei, amor sob vontade."</p>
        </div>
      </div>
    </div>
  );
};

export default ThothBookPDF;
