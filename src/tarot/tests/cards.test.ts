import { describe, it, expect } from 'vitest';
import { getAllCards, getCardById, getCardsByCategory, getAllCardIds, getCatalogVersion } from '../data/catalog';

describe('Catalog', () => {
  it('should have exactly 78 cards', () => {
    expect(getAllCards()).toHaveLength(78);
  });

  it('should have 22 major arcana', () => {
    expect(getCardsByCategory('major')).toHaveLength(22);
  });

  it('should have 16 court cards', () => {
    expect(getCardsByCategory('court')).toHaveLength(16);
  });

  it('should have 40 minor arcana', () => {
    expect(getCardsByCategory('minor')).toHaveLength(40);
  });

  it('should have no duplicate IDs', () => {
    const ids = getAllCards().map((c) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('should have required fields on every card', () => {
    for (const card of getAllCards()) {
      expect(card.id).toBeTruthy();
      expect(card.name).toBeTruthy();
      expect(card.englishName).toBeTruthy();
      expect(card.category).toBeTruthy();
      expect(card.keywords).toBeInstanceOf(Array);
      expect(card.keywords.length).toBeGreaterThan(0);
      expect(card.description).toBeTruthy();
      expect(card.documentedMeaning).toBeTruthy();
      expect(card.correspondences).toBeTruthy();
      expect(card.correspondences.source).toBeTruthy();
      expect(card.source).toBeTruthy();
    }
  });

  it('should retrieve a card by ID', () => {
    const card = getCardById('universe');
    expect(card).toBeDefined();
    expect(card!.name).toBe('O Universo');
  });

  it('should return undefined for non-existent card ID', () => {
    expect(getCardById('non-existent')).toBeUndefined();
  });

  it('should have a catalog version', () => {
    expect(getCatalogVersion()).toBeTruthy();
  });

  it('should have documented correspondences for all major arcana', () => {
    const majors = getCardsByCategory('major');
    for (const card of majors) {
      expect(card.correspondences.astrology).toBeTruthy();
      expect(card.correspondences.qabalah).toBeTruthy();
    }
  });

  it('should have element info for all court cards', () => {
    const courts = getCardsByCategory('court');
    for (const card of courts) {
      expect(card.correspondences.element).toBeTruthy();
    }
  });

  it('should have all card IDs in the ID set', () => {
    const ids = getAllCardIds();
    expect(ids.has('fool')).toBe(true);
    expect(ids.has('universe')).toBe(true);
    expect(ids.has('king-wands')).toBe(true);
    expect(ids.has('ace-disks')).toBe(true);
  });
});
