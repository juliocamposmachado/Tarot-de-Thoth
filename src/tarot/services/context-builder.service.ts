import {
  Consultant,
  InterpretationContext,
  RevealedCard,
  SpreadId,
} from '../domain/types';
import { getCardById, getSpreadById, getCatalogVersion } from '../data/catalog';
import { SYSTEM_PROMPT_VERSION } from '../prompts/system-prompt';

export interface BuildContextOptions {
  includeCorrespondences?: boolean;
  includeSynthesis?: boolean;
  spokenProse?: boolean;
}

export function buildInterpretationContext(
  consultant: Consultant,
  spreadId: SpreadId,
  cards: RevealedCard[],
  options: BuildContextOptions = {},
): InterpretationContext {
  const spread = getSpreadById(spreadId);
  if (!spread) {
    throw new Error(`Spread "${spreadId}" not found`);
  }

  const sortedCards = [...cards].sort((a, b) => a.displayOrder - b.displayOrder);

  const positionsWithContext = spread.positions.map((pos) => {
    const revealed = sortedCards.find((c) => c.position === pos.position);
    if (!revealed) {
      throw new Error(`No card provided for position "${pos.position}" in spread "${spreadId}"`);
    }

    const cardData = getCardById(revealed.cardId);
    if (!cardData) {
      throw new Error(`Card "${revealed.cardId}" not found in catalog`);
    }

    return {
      position: pos.position,
      name: pos.name,
      description: pos.description,
      crowleyInterpretation: pos.crowleyInterpretation,
      card: {
        id: cardData.id,
        name: cardData.name,
        englishName: cardData.englishName,
        category: cardData.category,
        orientation: revealed.orientation,
        keywords: cardData.keywords,
        documentedMeaning: cardData.documentedMeaning,
        correspondences: cardData.correspondences,
      },
    };
  });

  return {
    schemaVersion: '1.0',
    systemPromptVersion: SYSTEM_PROMPT_VERSION,
    catalogVersion: getCatalogVersion(),
    consultant,
    spread: {
      id: spread.id,
      name: spread.name,
      positions: positionsWithContext,
    },
    question: consultant.question,
    outputLanguage: 'pt-BR',
    outputFormat: 'spoken-prose',
    options: {
      includeCorrespondences: options.includeCorrespondences ?? true,
      includeSynthesis: options.includeSynthesis ?? true,
      spokenProse: options.spokenProse ?? true,
    },
  };
}
