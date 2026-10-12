import {
  Consultant,
  InterpretationResult,
  RevealedCard,
  SpreadId,
  ValidationResult,
  HealthResponse,
  InterpretationContext,
} from '../domain/types';
import { generateInterpretation, setAIMode, getAIMode } from '../services/interpretation.service';
import { MockAIProvider, ConfiguredAIProvider, AIProvider } from '../providers/ai-provider';
import { validateReading } from '../domain/validation';

export interface InterpretRequestPayload {
  consultant: Consultant;
  spreadId: SpreadId;
  cards: RevealedCard[];
  options?: {
    includeCorrespondences?: boolean;
    includeSynthesis?: boolean;
    spokenProse?: boolean;
  };
}

let _useMock = false;

export function setMockMode(enabled: boolean) {
  _useMock = enabled;
  setAIMode(enabled ? 'mock' : 'configured');
}

export function isMockMode(): boolean {
  return _useMock;
}

export async function fetchInterpretation(
  payload: InterpretRequestPayload,
): Promise<InterpretationResult> {
  if (_useMock) {
    const mock = new MockAIProvider();
    return generateInterpretation(payload, mock);
  }
  // Try the Supabase edge function first
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (supabaseUrl && anonKey) {
      const funcUrl = `${supabaseUrl}/functions/v1/tarot-api`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(funcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ ...payload, action: 'interpret' }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        return await response.json() as InterpretationResult;
      }
    }
  } catch {
    // Fall through to client-side generation
  }

  // Fallback: use the configured provider (Vercel /api/ai-interpret) client-side
  try {
    const provider = new ConfiguredAIProvider();
    return await generateInterpretation(payload, provider);
  } catch {
    // Final fallback: mock provider so the user always gets a result
    const mock = new MockAIProvider();
    return generateInterpretation(payload, mock);
  }
}

export async function fetchValidation(
  spreadId: SpreadId,
  cards: RevealedCard[],
): Promise<ValidationResult> {
  return validateReading(spreadId, cards);
}

export async function fetchHealth(): Promise<HealthResponse> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (supabaseUrl && anonKey) {
      const funcUrl = `${supabaseUrl}/functions/v1/tarot-api`;

      const response = await fetch(`${funcUrl}?action=health`, {
        headers: {
          'Authorization': `Bearer ${anonKey}`,
        },
      });
      if (response.ok) {
        return await response.json() as HealthResponse;
      }
    }
  } catch {
    // fall through
  }
  return {
    status: 'ok',
    catalogLoaded: true,
    aiMode: _useMock ? 'mock' : 'configured',
    version: '1.0.0',
  };
}

export { generateInterpretation, setAIMode, getAIMode };
export type { AIProvider, InterpretationContext };
