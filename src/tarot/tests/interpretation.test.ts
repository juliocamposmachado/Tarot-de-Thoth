import { describe, it, expect } from 'vitest';
import { generateInterpretation, InterpretationValidationError } from '../services/interpretation.service';
import { MockAIProvider } from '../providers/ai-provider';
import { buildInterpretationContext } from '../services/context-builder.service';
import { Consultant, RevealedCard } from '../domain/types';
import { SYSTEM_PROMPT_VERSION } from '../prompts/system-prompt';

const validConsultant: Consultant = {
  name: 'Julio Cesar',
  birthDate: '1975-08-07',
  language: 'pt-BR',
  question: 'AMOR',
};

const validCards: RevealedCard[] = [
  { cardId: 'fool', position: 'past', orientation: 'upright', displayOrder: 0 },
  { cardId: 'magus', position: 'present', orientation: 'upright', displayOrder: 1 },
  { cardId: 'universe', position: 'future', orientation: 'reversed', displayOrder: 2 },
];

describe('Context Builder', () => {
  it('should build a valid interpretation context', () => {
    const context = buildInterpretationContext(validConsultant, 'three-card', validCards);
    expect(context.schemaVersion).toBe('1.0');
    expect(context.systemPromptVersion).toBe(SYSTEM_PROMPT_VERSION);
    expect(context.consultant.name).toBe('Julio Cesar');
    expect(context.question).toBe('AMOR');
    expect(context.spread.positions).toHaveLength(3);
    expect(context.spread.positions[0].card.id).toBe('fool');
    expect(context.spread.positions[0].card.orientation).toBe('upright');
    expect(context.spread.positions[2].card.orientation).toBe('reversed');
  });

  it('should preserve card order by displayOrder', () => {
    const shuffledCards = [...validCards].reverse();
    const context = buildInterpretationContext(validConsultant, 'three-card', shuffledCards);
    expect(context.spread.positions[0].position).toBe('past');
    expect(context.spread.positions[1].position).toBe('present');
    expect(context.spread.positions[2].position).toBe('future');
  });

  it('should include correspondences from catalog', () => {
    const context = buildInterpretationContext(validConsultant, 'three-card', validCards);
    const foolCard = context.spread.positions[0].card;
    expect(foolCard.correspondences.astrology).toBeTruthy();
    expect(foolCard.correspondences.qabalah).toBeTruthy();
  });

  it('should throw for non-existent spread', () => {
    expect(() => buildInterpretationContext(validConsultant, 'non-existent' as never, validCards)).toThrow();
  });
});

describe('Mock AI Provider', () => {
  it('should generate a deterministic interpretation', async () => {
    const provider = new MockAIProvider();
    const context = buildInterpretationContext(validConsultant, 'three-card', validCards);
    const result = await provider.generateInterpretation(context);

    expect(result.status).toBe('completed');
    expect(result.provider).toBe('mock');
    expect(result.metadata.mock).toBe(true);
    expect(result.interpretation.introduction).toContain('Julio Cesar');
    expect(result.interpretation.cards).toHaveLength(3);
    expect(result.interpretation.synthesis).toBeTruthy();
    expect(result.interpretation.guidance).toBeTruthy();
  });

  it('should mark reversed cards correctly', async () => {
    const provider = new MockAIProvider();
    const reversedCards: RevealedCard[] = [
      { cardId: 'fool', position: 'past', orientation: 'reversed', displayOrder: 0 },
      { cardId: 'magus', position: 'present', orientation: 'upright', displayOrder: 1 },
      { cardId: 'universe', position: 'future', orientation: 'reversed', displayOrder: 2 },
    ];
    const context = buildInterpretationContext(validConsultant, 'three-card', reversedCards);
    const result = await provider.generateInterpretation(context);

    expect(result.interpretation.cards[0].orientation).toBe('reversed');
    expect(result.interpretation.cards[1].orientation).toBe('upright');
    expect(result.interpretation.cards[2].orientation).toBe('reversed');
  });
});

describe('Interpretation Service', () => {
  it('should generate interpretation with mock provider', async () => {
    const result = await generateInterpretation({
      consultant: validConsultant,
      spreadId: 'three-card',
      cards: validCards,
    }, new MockAIProvider());

    expect(result.status).toBe('completed');
    expect(result.spreadId).toBe('three-card');
  });

  it('should reject invalid consultant (empty name)', async () => {
    await expect(generateInterpretation({
      consultant: { ...validConsultant, name: '' },
      spreadId: 'three-card',
      cards: validCards,
    }, new MockAIProvider())).rejects.toThrow(InterpretationValidationError);
  });

  it('should reject empty question', async () => {
    await expect(generateInterpretation({
      consultant: { ...validConsultant, question: '' },
      spreadId: 'three-card',
      cards: validCards,
    }, new MockAIProvider())).rejects.toThrow(InterpretationValidationError);
  });

  it('should reject invalid card count', async () => {
    await expect(generateInterpretation({
      consultant: validConsultant,
      spreadId: 'three-card',
      cards: validCards.slice(0, 2),
    }, new MockAIProvider())).rejects.toThrow(InterpretationValidationError);
  });

  it('should reject invalid birth date format', async () => {
    await expect(generateInterpretation({
      consultant: { ...validConsultant, birthDate: '07/08/1975' },
      spreadId: 'three-card',
      cards: validCards,
    }, new MockAIProvider())).rejects.toThrow(InterpretationValidationError);
  });

  it('should preserve the question in the interpretation', async () => {
    const result = await generateInterpretation({
      consultant: { ...validConsultant, question: 'Trabalho e carreira' },
      spreadId: 'three-card',
      cards: validCards,
    }, new MockAIProvider());

    expect(result.interpretation.introduction).toContain('Trabalho e carreira');
  });

  it('should not swap cards during interpretation', async () => {
    const result = await generateInterpretation({
      consultant: validConsultant,
      spreadId: 'three-card',
      cards: validCards,
    }, new MockAIProvider());

    expect(result.interpretation.cards[0].cardId).toBe('fool');
    expect(result.interpretation.cards[0].position).toBe('past');
    expect(result.interpretation.cards[1].cardId).toBe('magus');
    expect(result.interpretation.cards[1].position).toBe('present');
    expect(result.interpretation.cards[2].cardId).toBe('universe');
    expect(result.interpretation.cards[2].position).toBe('future');
  });
});
