export interface TarotCard {
  id: string;
  name: string;
  englishName: string;
  number?: string;
  suit?: string;
  element?: string;
  description: string;
  keywords: string[];
  category: 'major' | 'court' | 'minor';
}

export interface Suit {
  name: string;
  element: string;
  description: string;
}

export interface Position {
  id: string;
  name: string;
  description: string;
  crowleyInterpretation: string;
}

export interface SpreadPosition extends Position {
  x: number;
  y: number;
  rotation?: number;
  isReversed?: boolean;
}

export interface ReadingCard {
  card: TarotCard;
  position: Position;
  isReversed: boolean;
  interpretation: string;
}

export interface Reading {
  id: string;
  date: Date;
  question?: string;
  spreadType: 'three-card' | 'celtic-cross' | 'tree-of-life';
  cards: ReadingCard[];
  userName?: string;
  birthDate?: string;
}

export interface SpreadType {
  id: 'three-card' | 'celtic-cross' | 'tree-of-life';
  name: string;
  description: string;
  positions: Position[];
  layout: SpreadPosition[];
}
