import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

// Types for our contributions
interface Location {
  country: string;
  flag: string;
  city: string;
}

interface Contribution {
  id: number;
  name: string;
  amount: number;
  timestamp: string;
  location: Location;
  action: string;
}

// Action messages for contributions
const contributionActions = [
  "fez a leitura e contribuiu com",
  "recebeu a orientação e contribuiu com",
  "agradeceu a consulta com",
  "consultou o oráculo e contribuiu com",
  "apreciou a sabedoria e doou",
  "recebeu as respostas e enviou"
];

// Action message for deck purchases
const deckPurchaseAction = "comprou o baralho por";

// International locations with countries, flags, and cities
const locations: Location[] = [
  // Brazil
  { country: 'Brasil', flag: '🇧🇷', city: 'São Paulo' },
  { country: 'Brasil', flag: '🇧🇷', city: 'Rio de Janeiro' },
  { country: 'Brasil', flag: '🇧🇷', city: 'Belo Horizonte' },
  { country: 'Brasil', flag: '🇧🇷', city: 'Brasília' },
  { country: 'Brasil', flag: '🇧🇷', city: 'Salvador' },
  { country: 'Brasil', flag: '🇧🇷', city: 'Curitiba' },
  { country: 'Brasil', flag: '🇧🇷', city: 'Fortaleza' },
  { country: 'Brasil', flag: '🇧🇷', city: 'Recife' },
  // Portugal
  { country: 'Portugal', flag: '🇵🇹', city: 'Lisboa' },
  { country: 'Portugal', flag: '🇵🇹', city: 'Porto' },
  { country: 'Portugal', flag: '🇵🇹', city: 'Braga' },
  { country: 'Portugal', flag: '🇵🇹', city: 'Coimbra' },
  // USA
  { country: 'Estados Unidos', flag: '🇺🇸', city: 'Nova York' },
  { country: 'Estados Unidos', flag: '🇺🇸', city: 'Los Angeles' },
  { country: 'Estados Unidos', flag: '🇺🇸', city: 'Chicago' },
  { country: 'Estados Unidos', flag: '🇺🇸', city: 'Miami' },
  // UK
  { country: 'Reino Unido', flag: '🇬🇧', city: 'Londres' },
  { country: 'Reino Unido', flag: '🇬🇧', city: 'Manchester' },
  { country: 'Reino Unido', flag: '🇬🇧', city: 'Liverpool' },
  { country: 'Reino Unido', flag: '🇬🇧', city: 'Edimburgo' },
  // Spain
  { country: 'Espanha', flag: '🇪🇸', city: 'Madrid' },
  { country: 'Espanha', flag: '🇪🇸', city: 'Barcelona' },
  { country: 'Espanha', flag: '🇪🇸', city: 'Valência' },
  { country: 'Espanha', flag: '🇪🇸', city: 'Sevilha' },
  // France
  { country: 'França', flag: '🇫🇷', city: 'Paris' },
  { country: 'França', flag: '🇫🇷', city: 'Marselha' },
  { country: 'França', flag: '🇫🇷', city: 'Lyon' },
  { country: 'França', flag: '🇫🇷', city: 'Nice' },
  // Germany
  { country: 'Alemanha', flag: '🇩🇪', city: 'Berlim' },
  { country: 'Alemanha', flag: '🇩🇪', city: 'Munique' },
  { country: 'Alemanha', flag: '🇩🇪', city: 'Frankfurt' },
  { country: 'Alemanha', flag: '🇩🇪', city: 'Hamburgo' },
  // Italy
  { country: 'Itália', flag: '🇮🇹', city: 'Roma' },
  { country: 'Itália', flag: '🇮🇹', city: 'Milão' },
  { country: 'Itália', flag: '🇮🇹', city: 'Florença' },
  { country: 'Itália', flag: '🇮🇹', city: 'Veneza' },
  // Japan
  { country: 'Japão', flag: '🇯🇵', city: 'Tóquio' },
  { country: 'Japão', flag: '🇯🇵', city: 'Osaka' },
  { country: 'Japão', flag: '🇯🇵', city: 'Kyoto' },
  { country: 'Japão', flag: '🇯🇵', city: 'Yokohama' },
  // Australia
  { country: 'Austrália', flag: '🇦🇺', city: 'Sydney' },
  { country: 'Austrália', flag: '🇦🇺', city: 'Melbourne' },
  { country: 'Austrália', flag: '🇦🇺', city: 'Brisbane' },
  { country: 'Austrália', flag: '🇦🇺', city: 'Perth' }
];

// Names from different countries
const names = [
  // Brazilian names
  'João Silva',
  'Maria Oliveira',
  'Pedro Santos',
  'Ana Costa',
  'Carlos Pereira',
  'Juliana Ferreira',
  'Lucas Rodrigues',
  'Fernanda Almeida',
  'Marcos Souza',
  'Camila Lima',
  'Rafael Gomes',
  'Bruna Carvalho',
  'Gustavo Martins',
  'Amanda Ribeiro',
  'Felipe Araújo',
  // Portuguese names
  'António Ferreira',
  'Manuel Carvalho',
  'Ricardo Machado',
  'Sofia Pinto',
  'Margarida Costa',
  // American names
  'John Smith',
  'Michael Johnson',
  'Robert Williams',
  'Emily Davis',
  'Sarah Brown',
  // British names
  'James Wilson',
  'William Taylor',
  'Thomas Harris',
  'Elizabeth Clark',
  'Charlotte Lewis',
  // Spanish names
  'Miguel González',
  'Alejandro Rodríguez',
  'David López',
  'Lucía Martínez',
  'Sofía García',
  // French names
  'Jean Dupont',
  'Pierre Martin',
  'Michel Bernard',
  'Marie Dubois',
  'Sophie Petit',
  // German names
  'Hans Müller',
  'Klaus Schmidt',
  'Wolfgang Schneider',
  'Anna Fischer',
  'Helga Wagner',
  // Italian names
  'Giuseppe Rossi',
  'Marco Bianchi',
  'Antonio Romano',
  'Maria Ferrari',
  'Sofia Marino',
  // Japanese names
  'Hiroshi Tanaka',
  'Akira Suzuki',
  'Yuki Sato',
  'Haruka Takahashi',
  'Yuko Watanabe',
  // Australian names
  'Jack Wilson',
  'Matthew Johnson',
  'Daniel Smith',
  'Emily Brown',
  'Olivia Taylor'
];

// Generate a random amount - either a regular contribution (9.93-93.93) or a deck purchase (393.93)
const getRandomAmount = (): number => {
  // 80% chance for regular contribution, 20% chance for deck purchase
  if (Math.random() < 0.8) {
    // Generate a regular contribution between 9.93 and 93.93
    const amount = Math.random() * (93.93 - 9.93) + 9.93;
    // Round to 2 decimal places
    return Math.round(amount * 100) / 100;
  } else {
    // Deck purchase - fixed at 393.93
    return 393.93;
  }
};

// Generate a random timestamp within the last 30 minutes
const getRandomTimestamp = (): string => {
  const now = new Date();
  // Generate a random time between 0 and 30 minutes ago
  const minutesAgo = Math.floor(Math.random() * 30);
  const timeAgo = new Date(now.getTime() - (minutesAgo * 60 * 1000));
  
  return timeAgo.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
};

// Get a random location
const getRandomLocation = (): Location => {
  return locations[Math.floor(Math.random() * locations.length)];
};

// Get a random name
const getRandomName = (): string => {
  return names[Math.floor(Math.random() * names.length)];
};

// Get a random contribution action
const getRandomAction = (isDeckPurchase: boolean): string => {
  if (isDeckPurchase) {
    return deckPurchaseAction;
  } else {
    return contributionActions[Math.floor(Math.random() * contributionActions.length)];
  }
};

// Generate initial set of fake contributions
const generateContributions = (count: number): Contribution[] => {
  return Array.from({ length: count }, (_, i) => {
    const amount = getRandomAmount();
    const isDeckPurchase = amount === 393.93;
    return {
      id: i,
      name: getRandomName(),
      amount: amount,
      timestamp: getRandomTimestamp(),
      location: getRandomLocation(),
      action: getRandomAction(isDeckPurchase)
    };
  });
};

export const ContributionTicker: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>(generateContributions(10));
  
  // Add a new contribution every 5-10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const amount = getRandomAmount();
      const isDeckPurchase = amount === 393.93;
      const newContribution = {
        id: Date.now(),
        name: getRandomName(),
        amount: amount,
        timestamp: getRandomTimestamp(),
        location: getRandomLocation(),
        action: getRandomAction(isDeckPurchase)
      };
      
      setContributions(prev => {
        // Keep the list at a reasonable size by removing the oldest entry
        const updated = [...prev, newContribution];
        if (updated.length > 15) {
          return updated.slice(1);
        }
        return updated;
      });
    }, Math.random() * 5000 + 5000); // Random interval between 5-10 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-indigo-900/90 border-y border-purple-700/50 py-2 shadow-lg">
      <div className="animate-scroll flex whitespace-nowrap">
        {contributions.map((contribution, index) => (
          <div 
            key={contribution.id} 
            className="inline-flex items-center mx-8 text-purple-200"
          >
            <span className="inline-flex items-center bg-indigo-800/70 rounded-full px-3 py-1 text-yellow-400 text-sm font-medium mr-2">
              <Clock className="w-3 h-3 mr-1" />
              {contribution.timestamp}
            </span>
            <span className="mr-1">{contribution.location.flag}</span>
            <span className="font-medium mr-1">{contribution.name},</span>
            <span className="text-purple-300 mr-1">de {contribution.location.city},</span>
            <span className="text-purple-300 mr-1">
              {contribution.action}
            </span>
            <span className="font-bold text-yellow-400">R$ {contribution.amount.toFixed(2).replace('.', ',')}</span>
            {index < contributions.length - 1 && (
              <span className="mx-8 text-purple-600">•</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContributionTicker;
