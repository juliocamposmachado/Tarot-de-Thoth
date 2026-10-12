import { describe, it, expect } from 'vitest';
import { validateConsultant, validateBirthDate, validateOrientation } from '../domain/validation';

describe('Consultant validation', () => {
  it('should accept valid consultant', () => {
    const errors = validateConsultant({
      name: 'Julio',
      language: 'pt-BR',
      question: 'AMOR',
    });
    expect(errors).toHaveLength(0);
  });

  it('should reject name too short', () => {
    const errors = validateConsultant({ name: 'J', language: 'pt-BR', question: 'AMOR' });
    expect(errors.some((e) => e.code === 'INVALID_NAME')).toBe(true);
  });

  it('should reject empty question', () => {
    const errors = validateConsultant({ name: 'Julio', language: 'pt-BR', question: '' });
    expect(errors.some((e) => e.code === 'EMPTY_QUESTION')).toBe(true);
  });

  it('should reject question too long', () => {
    const errors = validateConsultant({ name: 'Julio', language: 'pt-BR', question: 'a'.repeat(2001) });
    expect(errors.some((e) => e.code === 'QUESTION_TOO_LONG')).toBe(true);
  });

  it('should reject invalid language', () => {
    const errors = validateConsultant({ name: 'Julio', language: 'en-US' as 'pt-BR', question: 'AMOR' });
    expect(errors.some((e) => e.code === 'INVALID_LANGUAGE')).toBe(true);
  });
});

describe('Birth date validation', () => {
  it('should accept valid ISO date', () => {
    expect(validateBirthDate('1975-08-07')).toBeNull();
  });

  it('should accept undefined date', () => {
    expect(validateBirthDate(undefined)).toBeNull();
  });

  it('should reject non-ISO format', () => {
    expect(validateBirthDate('07/08/1975')).not.toBeNull();
  });

  it('should reject year too early', () => {
    expect(validateBirthDate('1899-01-01')).not.toBeNull();
  });

  it('should reject future year', () => {
    expect(validateBirthDate('2050-01-01')).not.toBeNull();
  });
});

describe('Orientation validation', () => {
  it('should accept upright', () => {
    expect(validateOrientation('upright')).toBe(true);
  });

  it('should accept reversed', () => {
    expect(validateOrientation('reversed')).toBe(true);
  });

  it('should reject invalid orientation', () => {
    expect(validateOrientation('sideways')).toBe(false);
  });
});
