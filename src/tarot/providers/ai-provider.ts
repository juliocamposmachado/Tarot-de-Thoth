import { InterpretationContext, InterpretationResult, CardInterpretationEntry } from '../domain/types';
import { SYSTEM_PROMPT_VERSION } from '../prompts/system-prompt';
import { getCatalogVersion } from '../data/catalog';

export interface AIProvider {
  readonly name: string;
  generateInterpretation(context: InterpretationContext): Promise<InterpretationResult>;
}

// --- Mock AI Provider ---

function mockCardInterpretation(
  cardName: string,
  cardEnglishName: string,
  positionName: string,
  orientation: string,
  keywords: string[],
  documentedMeaning: string,
  question: string,
  correspondencesText: string,
): string {
  const orientationText = orientation === 'reversed'
    ? 'A inversao desta carta sugere uma expressao desarmonica de suas qualidades. Pode indicar bloqueio, excesso ou resistencia a energia natural do arquetipo.'
    : 'A orientacao normal desta carta indica expressao plena de suas energias.';

  return `${cardName} (${cardEnglishName}) ocupa a posicao de ${positionName}. ${documentedMeaning} ${orientationText} As palavras-chave que orientam esta leitura sao: ${keywords.join(', ')}. ${correspondencesText} No contexto da pergunta sobre "${question}", esta carta convida a reflexao sobre como estas energias se manifestam na sua jornada.`;
}

export class MockAIProvider implements AIProvider {
  readonly name = 'mock';

  async generateInterpretation(context: InterpretationContext): Promise<InterpretationResult> {
    const consultantName = context.consultant.name;
    const question = context.question;
    const cardCount = context.spread.positions.length;

    const introduction = `Bem-vindo, ${consultantName}. O oraculo se volta para sua pergunta sobre "${question}". ` +
      `A tiragem de ${context.spread.name} revelou ${cardCount} carta(s) que iluminam as energias em jogo. ` +
      `Receba estas imagens como espelhos simbolicos, nao como verdades absolutas.`;

    const cards: CardInterpretationEntry[] = context.spread.positions.map((p) => {
      const c = p.card;
      const correspondencesText = context.options.includeCorrespondences
        ? `Correspondencias documentadas: ${c.correspondences.astrology || 'Nao documentado'}, ${c.correspondences.qabalah || ''}.`
        : '';

      const meaning = mockCardInterpretation(
        c.name,
        c.englishName,
        p.name,
        c.orientation,
        c.keywords,
        c.documentedMeaning,
        question,
        correspondencesText,
      );

      return {
        cardId: c.id,
        position: p.position,
        orientation: c.orientation,
        title: `${c.name} em ${p.name}`,
        meaning,
      };
    });

    const cardNames = context.spread.positions.map((p) => p.card.name).join(', ');
    const synthesis = `A progressao simbolica das cartas (${cardNames}) revela uma narrativa coerente. ` +
      `Cada posicao adiciona uma camada de significado a questao. ` +
      `A relacao entre as cartas sugere um fluxo de energias que nao e estatico, mas dinamico e passivel de transformacao pela Vontade Verdadeira do consulente. ` +
      `Lembre-se: o futuro indicado pela tiragem e uma tendencia, nao uma sentenca.`;

    const guidance = `Diante do que as cartas revelaram, ${consultantName}, a orientacao e buscar alinhamento com sua Vontade Verdadeira. ` +
      `Reflita sobre os simbolos apresentados e como eles ressoam com sua situacao atual. ` +
      `O Tarot de Thoth nao prescribe acoes, mas oferece espelhos para a introspeccao e o autoconhecimento.`;

    return {
      readingId: `mock-reading-${Date.now()}`,
      status: 'completed',
      provider: 'mock',
      spreadId: context.spread.id,
      interpretation: {
        introduction,
        cards,
        synthesis,
        guidance,
      },
      metadata: {
        promptVersion: SYSTEM_PROMPT_VERSION,
        catalogVersion: getCatalogVersion(),
        mock: true,
        generatedAt: new Date().toISOString(),
      },
    };
  }
}

// --- Configured AI Provider (OpenAI) ---

export class ConfiguredAIProvider implements AIProvider {
  readonly name = 'configured';
  private endpoint: string;
  private timeoutMs: number;
  private maxRetries: number;

  constructor(opts: {
    endpoint?: string;
    timeoutMs?: number;
    maxRetries?: number;
  } = {}) {
    this.endpoint = opts.endpoint || '/api/ai-interpret';
    this.timeoutMs = opts.timeoutMs || 30000;
    this.maxRetries = opts.maxRetries ?? 2;
  }

  async generateInterpretation(context: InterpretationContext): Promise<InterpretationResult> {
    const { buildInterpretationPrompt } = await import('../prompts/interpretation-prompt');
    const promptParts = buildInterpretationPrompt(context);
    const fullPrompt = `${promptParts.user}`;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: fullPrompt }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Erro ${response.status}`);
        }

        const data = await response.json();

        if (!data.interpretation || typeof data.interpretation !== 'string') {
          throw new Error('Resposta invalida do servidor.');
        }

        const { parseInterpretationResult } = await import('../prompts/interpretation-prompt');
        return parseInterpretationResult(
          data.interpretation,
          `reading-${Date.now()}`,
          'configured',
          SYSTEM_PROMPT_VERSION,
          getCatalogVersion(),
          context,
        );
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < this.maxRetries) {
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error('Falha ao gerar interpretacao apos multiple tentativas.');
  }
}

// --- Provider Factory ---

let _mode: 'mock' | 'openai' | 'configured' = 'configured';
let _mockProvider: MockAIProvider | null = null;
let _configuredProvider: ConfiguredAIProvider | null = null;

export function setAIMode(mode: 'mock' | 'openai' | 'configured'): void {
  _mode = mode;
}

export function getAIMode(): 'mock' | 'openai' | 'configured' {
  return _mode;
}

export function getAIProvider(): AIProvider {
  if (_mode === 'mock') {
    if (!_mockProvider) _mockProvider = new MockAIProvider();
    return _mockProvider;
  }
  if (!_configuredProvider) _configuredProvider = new ConfiguredAIProvider();
  return _configuredProvider;
}
