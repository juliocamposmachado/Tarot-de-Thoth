import { describe, it, expect } from 'vitest';
import { getAllSpreads, getSpreadById } from '../data/catalog';
import { validateReading } from '../domain/validation';
import { RevealedCard, SpreadId } from '../domain/types';

describe('Spreads', () => {
  it('should have at least 3 spreads', () => {
    expect(getAllSpreads().length).toBeGreaterThanOrEqual(3);
  });

  it('should have three-card spread with 3 positions', () => {
    const spread = getSpreadById('three-card');
    expect(spread).toBeDefined();
    expect(spread!.cardCount).toBe(3);
    expect(spread!.positions).toHaveLength(3);
  });

  it('should have celtic-cross spread with 10 positions', () => {
    const spread = getSpreadById('celtic-cross');
    expect(spread).toBeDefined();
    expect(spread!.cardCount).toBe(10);
  });

  it('should have tree-of-life spread with 10 positions', () => {
    const spread = getSpreadById('tree-of-life');
    expect(spread).toBeDefined();
    expect(spread!.cardCount).toBe(10);
  });

  it('should have five-card spread with 5 positions', () => {
    const spread = getSpreadById('five-card');
    expect(spread).toBeDefined();
    expect(spread!.cardCount).toBe(5);
  });

  it('should have single-card spread with 1 position', () => {
    const spread = getSpreadById('single-card');
    expect(spread).toBeDefined();
    expect(spread!.cardCount).toBe(1);
  });

  it('should return undefined for non-existent spread', () => {
    expect(getSpreadById('non-existent' as SpreadId)).toBeUndefined();
  });
});

describe('Reading validation', () => {
  const validThreeCard: RevealedCard[] = [
    { cardId: 'fool', position: 'past', orientation: 'upright', displayOrder: 0 },
    { cardId: 'magus', position: 'present', orientation: 'upright', displayOrder: 1 },
    { cardId: 'universe', position: 'future', orientation: 'reversed', displayOrder: 2 },
  ];

  it('should validate a correct three-card reading', () => {
    const result = validateReading('three-card', validThreeCard);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.cardCount).toBe(3);
  });

  it('should reject incomplete reading (too few cards)', () => {
    const incomplete = validThreeCard.slice(0, 2);
    const result = validateReading('three-card', incomplete);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'INVALID_CARD_COUNT')).toBe(true);
  });

  it('should reject non-existent card ID', () => {
    const invalidCards = [...validThreeCard];
    invalidCards[0] = { ...invalidCards[0], cardId: 'non-existent' };
    const result = validateReading('three-card', invalidCards);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'CARD_NOT_FOUND')).toBe(true);
  });

  it('should reject invalid position for spread', () => {
    const invalidCards = [...validThreeCard];
    invalidCards[0] = { ...invalidCards[0], position: 'kether' as RevealedCard['position'] };
    const result = validateReading('three-card', invalidCards);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'INVALID_POSITION')).toBe(true);
  });

  it('should reject duplicate positions', () => {
    const dupCards = [...validThreeCard];
    dupCards[1] = { ...dupCards[1], position: 'past' };
    const result = validateReading('three-card', dupCards);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'DUPLICATE_POSITION')).toBe(true);
  });

  it('should reject invalid orientation', () => {
    const invalidCards = [...validThreeCard];
    invalidCards[0] = { ...invalidCards[0], orientation: 'sideways' as RevealedCard['orientation'] };
    const result = validateReading('three-card', invalidCards);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'INVALID_ORIENTATION')).toBe(true);
  });

  it('should reject non-existent spread', () => {
    const result = validateReading('non-existent' as SpreadId, validThreeCard);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'INVALID_SPREAD')).toBe(true);
  });
});
