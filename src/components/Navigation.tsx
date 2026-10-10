import React from 'react';
import { Crown, Users, Grid3x3 } from 'lucide-react';

interface NavigationProps {
  activeTab: 'major' | 'court' | 'minor';
  onTabChange: (tab: 'major' | 'court' | 'minor') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'major', label: 'Arcanos Maiores', icon: Crown, count: 22 },
    { id: 'court', label: 'Cartas da Corte', icon: Users, count: 16 },
    { id: 'minor', label: 'Arcanos Menores', icon: Grid3x3, count: 40 }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as 'major' | 'court' | 'minor')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                : 'bg-purple-800/50 text-purple-300 hover:bg-purple-700/50 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{tab.label}</span>
            <span className="bg-purple-900/50 text-purple-200 px-2 py-1 rounded-full text-sm">
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};