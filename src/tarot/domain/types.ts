export type CardCategory = 'major' | 'court' | 'minor';
export type Orientation = 'upright' | 'reversed';
export type SpreadId = 'single-card' | 'three-card' | 'five-card' | 'celtic-cross' | 'tree-of-life';

export type PositionId =
  | 'past' | 'present' | 'future'
  | 'situation' | 'challenge' | 'influence' | 'advice' | 'tendency'
  | 'significator' | 'crossing' | 'crown' | 'foundation'
  | 'self' | 'environment' | 'hopes-fears' | 'outcome'
  | 'kether' | 'chokmah' | 'binah' | 'chesed' | 'geburah'
  | 'tiphareth' | 'netzach' | 'hod' | 'yesod' | 'malkuth'
  | 'single';

export interface Consultant {
  id?: string;
  name: string;
  birthDate?: string;
  language: 'pt-BR';
  question: string;
  consentToSave?: boolean;
}

export interface CardCorrespondences {
  astrology?: string;
  qabalah?: string;
  element?: string;
  decanate?: string;
  path?: string;
  hebrewLetter?: string;
  source: string;
}

export interface CatalogCard {
  id: string;
  name: string;
  englishName: string;
  category: CardCategory;
  number?: string;
  suit?: string;
  element?: string;
  keywords: string[];
  description: string;
  documentedMeaning: string;
  correspondences: CardCorrespondences;
  source: string;
}

export interface SpreadPositionDef {
  position: PositionId;
  name: string;
  description: string;
  crowleyInterpretation: string;
  order: number;
}

export interface SpreadDef {
  id: SpreadId;
  name: string;
  description: string;
  cardCount: number;
  positions: SpreadPositionDef[];
  outputFormat: 'spoken-prose';
}

export interface RevealedCard {
  cardId: string;
  position: PositionId;
  orientation: Orientation;
  displayOrder: number;
}

export interface InterpretationContext {
  schemaVersion: '1.0';
  systemPromptVersion: string;
  catalogVersion: string;
  consultant: Consultant;
  spread: {
    id: SpreadId;
    name: string;
    positions: Array<{
      position: PositionId;
      name: string;
      description: string;
      crowleyInterpretation: string;
      card: {
        id: string;
        name: string;
        englishName: string;
        category: CardCategory;
        orientation: Orientation;
        keywords: string[];
        documentedMeaning: string;
        correspondences: CardCorrespondences;
      };
    }>;
  };
  question: string;
  outputLanguage: 'pt-BR';
  outputFormat: 'spoken-prose';
  options: {
    includeCorrespondences: boolean;
    includeSynthesis: boolean;
    spokenProse: boolean;
  };
}

export interface CardInterpretationEntry {
  cardId: string;
  position: PositionId;
  orientation: Orientation;
  title: string;
  meaning: string;
}

export interface InterpretationResult {
  readingId: string;
  status: 'completed' | 'failed';
  provider: 'mock' | 'openai' | 'configured';
  spreadId: SpreadId;
  interpretation: {
    introduction: string;
    cards: CardInterpretationEntry[];
    synthesis: string;
    guidance: string;
  };
  metadata: {
    promptVersion: string;
    catalogVersion: string;
    mock: boolean;
    generatedAt: string;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  spreadId: SpreadId;
  cardCount: number;
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details: unknown[];
  };
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  catalogLoaded: boolean;
  aiMode: 'mock' | 'openai' | 'configured';
  version: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}
