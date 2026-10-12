import { CatalogCard, SpreadDef, SpreadId, SpreadPositionDef } from '../domain/types';
import { majorArcana } from '../../data/majorArcana';
import { courtCards } from '../../data/courtCards';
import { minorArcana } from '../../data/minorArcana';
import { spreads as existingSpreads, getSpreadById as existingGetSpreadById } from '../../data/spreads';
import { TarotCard } from '../../types/tarot';

const CATALOG_VERSION = '1.0.0';
const SOURCE_THOTH = 'O Livro de Thoth - Aleister Crowley';
const SOURCE_UNDOCUMENTED = 'Nao documentado';

function toCatalogCard(card: TarotCard, correspondences: Partial<CatalogCard['correspondences']>): CatalogCard {
  const hasCorrespondences = correspondences.astrology || correspondences.qabalah || correspondences.element || correspondences.path;
  return {
    id: card.id,
    name: card.name,
    englishName: card.englishName,
    category: card.category,
    number: card.number,
    suit: card.suit,
    element: card.element,
    keywords: card.keywords,
    description: card.description,
    documentedMeaning: card.description,
    correspondences: {
      ...correspondences,
      source: hasCorrespondences ? SOURCE_THOTH : SOURCE_UNDOCUMENTED,
    },
    source: SOURCE_THOTH,
  };
}

const majorCorrespondences: Record<string, Partial<CatalogCard['correspondences']>> = {
  fool: { astrology: 'Ar (elemento puro)', qabalah: 'Kether a Chokmah', path: 'Aleph', hebrewLetter: 'Aleph' },
  magus: { astrology: 'Mercurio', qabalah: 'Kether a Binah', path: 'Beth', hebrewLetter: 'Beth' },
  priestess: { astrology: 'Lua', qabalah: 'Kether a Tiphareth', path: 'Gimel', hebrewLetter: 'Gimel' },
  empress: { astrology: 'Venus', qabalah: 'Chokmah a Binah', path: 'Daleth', hebrewLetter: 'Daleth' },
  emperor: { astrology: 'Aries', qabalah: 'Chokmah a Tiphareth', path: 'Heh', hebrewLetter: 'Heh' },
  hierophant: { astrology: 'Touro', qabalah: 'Chokmah a Chesed', path: 'Vau', hebrewLetter: 'Vau' },
  lovers: { astrology: 'Gemeos', qabalah: 'Binah a Tiphareth', path: 'Zain', hebrewLetter: 'Zain' },
  chariot: { astrology: 'Cancer', qabalah: 'Binah a Geburah', path: 'Cheth', hebrewLetter: 'Cheth' },
  adjustment: { astrology: 'Libra', qabalah: 'Geburah a Tiphareth', path: 'Lamed', hebrewLetter: 'Lamed' },
  hermit: { astrology: 'Virgem', qabalah: 'Chesed a Tiphareth', path: 'Yod', hebrewLetter: 'Yod' },
  fortune: { astrology: 'Jupiter', qabalah: 'Chesed a Netzach', path: 'Kaph', hebrewLetter: 'Kaph' },
  lust: { astrology: 'Leao', qabalah: 'Chesed a Geburah', path: 'Teth', hebrewLetter: 'Teth' },
  'hanged-man': { astrology: 'Neptuno (agua)', qabalah: 'Hod a Geburah', path: 'Mem', hebrewLetter: 'Mem' },
  death: { astrology: 'Escorpiao', qabalah: 'Tiphareth a Netzach', path: 'Nun', hebrewLetter: 'Nun' },
  art: { astrology: 'Sagitario', qabalah: 'Yesod a Tiphareth', path: 'Samekh', hebrewLetter: 'Samekh' },
  devil: { astrology: 'Capricornio', qabalah: 'Hod a Tiphareth', path: 'Ayin', hebrewLetter: 'Ayin' },
  tower: { astrology: 'Marte', qabalah: 'Hod a Netzach', path: 'Peh', hebrewLetter: 'Peh' },
  star: { astrology: 'Aquario', qabalah: 'Yesod a Netzach', path: 'Tzaddi', hebrewLetter: 'Tzaddi' },
  moon: { astrology: 'Pisces (peixes)', qabalah: 'Netzach a Malkuth', path: 'Qoph', hebrewLetter: 'Qoph' },
  sun: { astrology: 'Sol', qabalah: 'Yesod a Hod', path: 'Resh', hebrewLetter: 'Resh' },
  aeon: { astrology: 'Plutao / Elemento Fogo', qabalah: 'Hod a Malkuth', path: 'Shin', hebrewLetter: 'Shin' },
  universe: { astrology: 'Saturno / Terra', qabalah: 'Yesod a Malkuth', path: 'Tav', hebrewLetter: 'Tav' },
};

const courtCorrespondences: Record<string, Partial<CatalogCard['correspondences']>> = {
  'king-wands': { astrology: 'Aries-Leao-Sagitario (Fogo)', qabalah: 'Atu do Zodiaco', element: 'Fogo do Fogo' },
  'queen-wands': { astrology: 'Aries-Leao-Sagitario (Agua do Fogo)', element: 'Agua do Fogo' },
  'prince-wands': { astrology: 'Aries-Leao-Sagitario (Ar do Fogo)', element: 'Ar do Fogo' },
  'princess-wands': { astrology: 'Touro-Escorpiao-Aquario-Leao (Terra do Fogo)', element: 'Terra do Fogo' },
  'knight-cups': { astrology: 'Cancer-Escorpiao-Pisces (Fogo da Agua)', element: 'Fogo da Agua' },
  'queen-cups': { astrology: 'Cancer-Escorpiao-Pisces (Agua da Agua)', element: 'Agua da Agua' },
  'prince-cups': { astrology: 'Cancer-Escorpiao-Pisces (Ar da Agua)', element: 'Ar da Agua' },
  'princess-cups': { astrology: 'Aries-Leao-Sagitario-Touro (Terra da Agua)', element: 'Terra da Agua' },
  'king-swords': { astrology: 'Gemeos-Libra-Aquario (Fogo do Ar)', element: 'Fogo do Ar' },
  'queen-swords': { astrology: 'Gemeos-Libra-Aquario (Agua do Ar)', element: 'Agua do Ar' },
  'prince-swords': { astrology: 'Gemeos-Libra-Aquario (Ar do Ar)', element: 'Ar do Ar' },
  'princess-swords': { astrology: 'Touro-Virgem-Capricornio (Terra do Ar)', element: 'Terra do Ar' },
  'king-disks': { astrology: 'Touro-Virgem-Capricornio (Fogo da Terra)', element: 'Fogo da Terra' },
  'queen-disks': { astrology: 'Touro-Virgem-Capricornio (Agua da Terra)', element: 'Agua da Terra' },
  'prince-disks': { astrology: 'Touro-Virgem-Capricornio (Ar da Terra)', element: 'Ar da Terra' },
  'princess-disks': { astrology: 'Aries-Leao-Sagitario-Gemeos (Terra da Terra)', element: 'Terra da Terra' },
};

const minorDecanates: Record<string, string> = {
  'two-wands': 'Aries (Marte)', 'three-wands': 'Aries (Sol)', 'four-wands': 'Aries (Venus)',
  'five-wands': 'Leao (Saturno)', 'six-wands': 'Leao (Jupiter)', 'seven-wands': 'Leao (Marte)',
  'eight-wands': 'Sagitario (Mercurio)', 'nine-wands': 'Sagitario (Lua)', 'ten-wands': 'Sagitario (Saturno)',
  'two-cups': 'Cancer (Venus)', 'three-cups': 'Cancer (Mercurio)', 'four-cups': 'Cancer (Lua)',
  'five-cups': 'Escorpiao (Marte)', 'six-cups': 'Escorpiao (Sol)', 'seven-cups': 'Escorpiao (Venus)',
  'eight-cups': 'Pisces (Saturno)', 'nine-cups': 'Pisces (Jupiter)', 'ten-cups': 'Pisces (Marte)',
  'two-swords': 'Libra (Lua)', 'three-swords': 'Libra (Saturno)', 'four-swords': 'Libra (Jupiter)',
  'five-swords': 'Aquario (Venus)', 'six-swords': 'Aquario (Mercurio)', 'seven-swords': 'Aquario (Lua)',
  'eight-swords': 'Gemeos (Jupiter)', 'nine-swords': 'Gemeos (Marte)', 'ten-swords': 'Gemeos (Sol)',
  'two-disks': 'Capricornio (Jupiter)', 'three-disks': 'Capricornio (Marte)', 'four-disks': 'Capricornio (Sol)',
  'five-disks': 'Touro (Mercurio)', 'six-disks': 'Touro (Lua)', 'seven-disks': 'Touro (Saturno)',
  'eight-disks': 'Virgem (Sol)', 'nine-disks': 'Virgem (Venus)', 'ten-disks': 'Virgo (Mercurio)',
};

function buildMinorCorrespondences(card: TarotCard): Partial<CatalogCard['correspondences']> {
  if (card.id.startsWith('ace-')) {
    const element = card.suit === 'Bastoes' ? 'Fogo' : card.suit === 'Copas' ? 'Agua' : card.suit === 'Espadas' ? 'Ar' : 'Terra';
    return { astrology: `Elemento ${element} puro`, element: card.element, qabalah: 'Kether (Raiz dos poderes)' };
  }
  const decanate = minorDecanates[card.id];
  return {
    astrology: decanate || 'Nao documentado',
    decanate: decanate || undefined,
    element: card.element,
  };
}

function buildAllCards(): CatalogCard[] {
  const allCards: CatalogCard[] = [];

  for (const card of majorArcana) {
    allCards.push(toCatalogCard(card, majorCorrespondences[card.id] || {}));
  }

  for (const card of courtCards) {
    allCards.push(toCatalogCard(card, courtCorrespondences[card.id] || {}));
  }

  for (const card of minorArcana) {
    allCards.push(toCatalogCard(card, buildMinorCorrespondences(card)));
  }

  return allCards;
}

const _allCards = buildAllCards();
const _cardMap = new Map(_allCards.map((c) => [c.id, c]));

export function getAllCards(): CatalogCard[] {
  return _allCards;
}

export function getCardById(id: string): CatalogCard | undefined {
  return _cardMap.get(id);
}

export function getAllCardIds(): Set<string> {
  return new Set(_cardMap.keys());
}

export function getCardsByCategory(category: 'major' | 'court' | 'minor'): CatalogCard[] {
  return _allCards.filter((c) => c.category === category);
}

export function getCatalogVersion(): string {
  return CATALOG_VERSION;
}

// --- Spreads ---

function convertSpread(id: SpreadId, existingId: 'three-card' | 'celtic-cross' | 'tree-of-life'): SpreadDef {
  const existing = existingGetSpreadById(existingId);
  const positions: SpreadPositionDef[] = existing.positions.map((p, i) => ({
    position: p.id as SpreadDef['positions'][0]['position'],
    name: p.name,
    description: p.description,
    crowleyInterpretation: p.crowleyInterpretation,
    order: i,
  }));
  return {
    id,
    name: existing.name,
    description: existing.description,
    cardCount: existing.positions.length,
    positions,
    outputFormat: 'spoken-prose',
  };
}

const singleCardPositions: SpreadPositionDef[] = [
  {
    position: 'single',
    name: 'Carta Unica',
    description: 'Uma carta para reflexao sobre a pergunta.',
    crowleyInterpretation: 'A carta unica e o espelho direto da Vontade Verdadeira do consulente neste momento. Toda a energia da questao se condensa em um unico simbolo.',
    order: 0,
  },
];

const fiveCardPositions: SpreadPositionDef[] = [
  { position: 'situation', name: 'Situacao', description: 'O estado atual da questao.', crowleyInterpretation: 'O ponto de partida, a base material e circunstancial da questao.', order: 0 },
  { position: 'challenge', name: 'Desafio', description: 'O obstaculo principal.', crowleyInterpretation: 'A forca que se opoe ou desafia o consulente, exigindo transcendencia.', order: 1 },
  { position: 'influence', name: 'Influencia', description: 'A influencia subjacente.', crowleyInterpretation: 'As forcas ocultas que moldam a situacao alem da percepcao consciente.', order: 2 },
  { position: 'advice', name: 'Orientacao', description: 'O conselho simbolico.', crowleyInterpretation: 'A orientacao que a Vontade Verdadeira oferece diante da questao.', order: 3 },
  { position: 'tendency', name: 'Tendencia', description: 'A direcao provavel.', crowleyInterpretation: 'A direcao para a qual as energias convergem, se o caminho atual for seguido.', order: 4 },
];

const _spreads: Record<SpreadId, SpreadDef> = {
  'single-card': {
    id: 'single-card',
    name: 'Carta Unica',
    description: 'Uma carta para reflexao sobre uma pergunta especifica.',
    cardCount: 1,
    positions: singleCardPositions,
    outputFormat: 'spoken-prose',
  },
  'three-card': convertSpread('three-card', 'three-card'),
  'five-card': {
    id: 'five-card',
    name: 'Cinco Cartas',
    description: 'Situacao, desafio, influencia, orientacao e tendencia.',
    cardCount: 5,
    positions: fiveCardPositions,
    outputFormat: 'spoken-prose',
  },
  'celtic-cross': convertSpread('celtic-cross', 'celtic-cross'),
  'tree-of-life': convertSpread('tree-of-life', 'tree-of-life'),
};

export function getAllSpreads(): SpreadDef[] {
  return Object.values(_spreads);
}

export function getSpreadById(id: SpreadId): SpreadDef | undefined {
  return _spreads[id];
}

export { CATALOG_VERSION, SOURCE_THOTH, SOURCE_UNDOCUMENTED };
