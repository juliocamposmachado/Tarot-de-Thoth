import React from 'react';
import { BookOpen, Eye, MessageCircle, Library } from 'lucide-react';

interface MainNavigationProps {
  activePage: 'catalog' | 'explanation' | 'reading' | 'complaints';
  onPageChange: (page: 'catalog' | 'explanation' | 'reading' | 'complaints') => void;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({
  activePage,
  onPageChange
}) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex flex-wrap p-1 rounded-lg bg-indigo-900/50 gap-1 sm:gap-0 sm:inline-flex">
        <button
          className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition flex items-center text-xs sm:text-base ${
            activePage === 'catalog' 
              ? 'bg-purple-700 text-white shadow-md' 
              : 'text-purple-300 hover:bg-indigo-800'
          }`}
          onClick={() => onPageChange('catalog')}
        >
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" />
          <span className="whitespace-nowrap">Catálogo</span>
        </button>
        <button
          className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition flex items-center text-xs sm:text-base ${
            activePage === 'explanation' 
              ? 'bg-purple-700 text-white shadow-md' 
              : 'text-purple-300 hover:bg-indigo-800'
          }`}
          onClick={() => onPageChange('explanation')}
        >
          <Library className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" />
          <span className="whitespace-nowrap">Livro</span>
        </button>
        <button
          className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition flex items-center text-xs sm:text-base ${
            activePage === 'reading' 
              ? 'bg-purple-700 text-white shadow-md' 
              : 'text-purple-300 hover:bg-indigo-800'
          }`}
          onClick={() => onPageChange('reading')}
        >
          <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" />
          <span className="whitespace-nowrap">Leitura</span>
        </button>
        <button
          className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition flex items-center text-xs sm:text-base ${
            activePage === 'complaints' 
              ? 'bg-purple-700 text-white shadow-md' 
              : 'text-purple-300 hover:bg-indigo-800'
          }`}
          onClick={() => onPageChange('complaints')}
        >
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" />
          <span className="whitespace-nowrap">Atendimento</span>
        </button>
      </div>
    </div>
  );
};
