import {
  Consultant,
  InterpretationResult,
  RevealedCard,
  SpreadId,
  ValidationResult,
  InterpretationContext,
} from '../domain/types';
import { validateReading, validateConsultant } from '../domain/validation';
import { buildInterpretationContext, BuildContextOptions } from './context-builder.service';
import { getAIProvider, setAIMode, getAIMode, AIProvider } from '../providers/ai-provider';

export interface InterpretRequest {
  consultant: Consultant;
  spreadId: SpreadId;
  cards: RevealedCard[];
  options?: BuildContextOptions;
}

export function validateRequest(req: InterpretRequest): ValidationResult & { consultantErrors: ReturnType<typeof validateConsultant> } {
  const readingValidation = validateReading(req.spreadId, req.cards);
  const consultantErrors = validateConsultant(req.consultant);
  return {
    ...readingValidation,
    valid: readingValidation.valid && consultantErrors.length === 0,
    consultantErrors,
  };
}

export async function generateInterpretation(
  req: InterpretRequest,
  providerOverride?: AIProvider,
): Promise<InterpretationResult> {
  const validation = validateRequest(req);
  if (!validation.valid) {
    const allErrors = [...validation.errors, ...validation.consultantErrors];
    throw new InterpretationValidationError(allErrors);
  }

  const context: InterpretationContext = buildInterpretationContext(
    req.consultant,
    req.spreadId,
    req.cards,
    req.options || {},
  );

  const provider = providerOverride || getAIProvider();
  return provider.generateInterpretation(context);
}

export class InterpretationValidationError extends Error {
  errors: Array<{ code: string; message: string; field?: string }>;
  constructor(errors: Array<{ code: string; message: string; field?: string }>) {
    super(errors.map((e) => e.message).join('; '));
    this.name = 'InterpretationValidationError';
    this.errors = errors;
  }
}

export { setAIMode, getAIMode };
