import { InterpretationContext, InterpretationResult, CardInterpretationEntry } from '../domain/types';

export function buildInterpretationPrompt(context: InterpretationContext): {
  system: string;
  user: string;
} {
  const cardDescriptions = context.spread.positions.map((p, i) => {
    const c = p.card;
    const orientation = c.orientation === 'reversed' ? 'INVERTIDA' : 'normal';
    const correspondences = Object.entries(c.correspondences)
      .filter(([key]) => key !== 'source')
      .filter(([, val]) => val)
      .map(([key, val]) => `${key}: ${val}`)
      .join(', ');

    return `Carta ${i + 1} - Posicao: ${p.name} (${p.position})
  Carta: ${c.name} (${c.englishName}) - Categoria: ${c.category}
  Orientacao: ${orientation}
  Palavras-chave: ${c.keywords.join(', ')}
  Significado documentado: ${c.documentedMeaning}
  Correspondencias: ${correspondences || 'Nao documentado'}
  Interpretacao da posicao segundo Crowley: ${p.crowleyInterpretation}`;
  }).join('\n\n');

  const options = context.options;
  const includeCorrespondences = options.includeCorrespondences
    ? 'Inclua as correspondencias esotericas documentadas na interpretacao.'
    : 'Nao e necessario listar correspondencias esotericas.';
  const includeSynthesis = options.includeSynthesis
    ? 'Faca uma sintese conectando todas as cartas, explicando a progressao simbolica.'
    : '';

  return {
    system: '',
    user: `CONTEXTO DA LEITURA:
Nome do Consulente: ${context.consultant.name}
Data de Nascimento: ${context.consultant.birthDate || 'Nao informada'}
Tipo de Tiragem: ${context.spread.name} (${context.spread.id})
Pergunta: "${context.question}"

CARTAS REVELADAS:
${cardDescriptions}

INSTRUCOES DE SAIDA:
${includeCorrespondences}
${includeSynthesis}
Mantenha a resposta em portugues brasileiro claro, com paragrafos curtos adequados para leitura em voz alta.`,
  };
}

export function parseInterpretationResult(
  text: string,
  readingId: string,
  provider: 'mock' | 'openai' | 'configured',
  promptVersion: string,
  catalogVersion: string,
  context: InterpretationContext,
): InterpretationResult {
  const cards: CardInterpretationEntry[] = context.spread.positions.map((p) => ({
    cardId: p.card.id,
    position: p.position,
    orientation: p.card.orientation,
    title: `${p.card.name} em ${p.name}`,
    meaning: '',
  }));

  return {
    readingId,
    status: 'completed',
    provider,
    spreadId: context.spread.id,
    interpretation: {
      introduction: '',
      cards,
      synthesis: text,
      guidance: '',
    },
    metadata: {
      promptVersion,
      catalogVersion,
      mock: provider === 'mock',
      generatedAt: new Date().toISOString(),
    },
  };
}
