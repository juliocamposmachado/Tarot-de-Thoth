import {
  ValidationResult,
  ValidationError,
  SpreadId,
  RevealedCard,
  Consultant,
  Orientation,
  PositionId,
} from './types';
import { getSpreadById, getAllCardIds } from '../data/catalog';

export function validateBirthDate(birthDate?: string): ValidationError | null {
  if (!birthDate) return null;
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDateRegex.test(birthDate)) {
    return {
      code: 'INVALID_BIRTH_DATE',
      message: 'A data de nascimento deve estar no formato ISO (AAAA-MM-DD).',
      field: 'birthDate',
    };
  }
  const parsed = new Date(birthDate);
  if (isNaN(parsed.getTime())) {
    return {
      code: 'INVALID_BIRTH_DATE',
      message: 'A data de nascimento fornecida nao e uma data valida.',
      field: 'birthDate',
    };
  }
  const year = parseInt(birthDate.substring(0, 4), 10);
  if (year < 1900 || year > new Date().getFullYear()) {
    return {
      code: 'INVALID_BIRTH_DATE',
      message: 'O ano de nascimento deve estar entre 1900 e o ano atual.',
      field: 'birthDate',
    };
  }
  return null;
}

export function validateConsultant(consultant: Consultant): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!consultant.name || consultant.name.trim().length < 2) {
    errors.push({
      code: 'INVALID_NAME',
      message: 'O nome do consulente e obrigatorio e deve ter pelo menos 2 caracteres.',
      field: 'name',
    });
  }

  if (!consultant.question || consultant.question.trim().length < 3) {
    errors.push({
      code: 'EMPTY_QUESTION',
      message: 'A pergunta do consulente e obrigatoria e deve ter pelo menos 3 caracteres.',
      field: 'question',
    });
  }

  if (consultant.question && consultant.question.length > 2000) {
    errors.push({
      code: 'QUESTION_TOO_LONG',
      message: 'A pergunta nao deve exceder 2000 caracteres.',
      field: 'question',
    });
  }

  const birthDateError = validateBirthDate(consultant.birthDate);
  if (birthDateError) errors.push(birthDateError);

  if (consultant.language !== 'pt-BR') {
    errors.push({
      code: 'INVALID_LANGUAGE',
      message: 'O idioma deve ser pt-BR.',
      field: 'language',
    });
  }

  return errors;
}

export function validateOrientation(orientation: string): boolean {
  return orientation === 'upright' || orientation === 'reversed';
}

export function validateReading(
  spreadId: SpreadId,
  cards: RevealedCard[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const spread = getSpreadById(spreadId);

  if (!spread) {
    return {
      valid: false,
      errors: [{
        code: 'INVALID_SPREAD',
        message: `Metodo de tiragem "${spreadId}" nao existe.`,
        field: 'spreadId',
      }],
      spreadId,
      cardCount: cards.length,
    };
  }

  if (cards.length !== spread.cardCount) {
    errors.push({
      code: 'INVALID_CARD_COUNT',
      message: `A tiragem "${spread.name}" exige ${spread.cardCount} carta(s), mas ${cards.length} foram fornecidas.`,
      field: 'cards',
    });
  }

  const validCardIds = getAllCardIds();
  const seenPositions = new Set<string>();

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];

    if (!validCardIds.has(card.cardId)) {
      errors.push({
        code: 'CARD_NOT_FOUND',
        message: `Carta com identificador "${card.cardId}" nao existe no catalogo.`,
        field: `cards[${i}].cardId`,
      });
    }

    if (!validateOrientation(card.orientation)) {
      errors.push({
        code: 'INVALID_ORIENTATION',
        message: `A orientacao da carta ${i + 1} deve ser "upright" ou "reversed".`,
        field: `cards[${i}].orientation`,
      });
    }

    const validPositions = spread.positions.map((p) => p.position);
    if (!validPositions.includes(card.position)) {
      errors.push({
        code: 'INVALID_POSITION',
        message: `A posicao "${card.position}" nao e valida para a tiragem "${spread.name}". Posicoes validas: ${validPositions.join(', ')}.`,
        field: `cards[${i}].position`,
      });
    }

    if (seenPositions.has(card.position)) {
      errors.push({
        code: 'DUPLICATE_POSITION',
        message: `A posicao "${card.position}" aparece mais de uma vez na tiragem.`,
        field: `cards[${i}].position`,
      });
    }
    seenPositions.add(card.position);
  }

  return {
    valid: errors.length === 0,
    errors,
    spreadId,
    cardCount: cards.length,
  };
}
