export type AgentType = 'chatgpt' | 'copilot' | 'gemini';

export interface AgentInfo {
  id: AgentType;
  name: string;
  url: string;
  description: string;
}

export const AGENTS: Record<AgentType, AgentInfo> = {
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chatgpt.com',
    description: 'Agente ChatGPT (chatgpt.com)',
  },
  copilot: {
    id: 'copilot',
    name: 'Copilot',
    url: 'https://copilot.microsoft.com',
    description: 'Agente Copilot (copilot.microsoft.com)',
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    url: 'https://gemini.google.com/app',
    description: 'Agente Gemini (gemini.google.com/app)',
  },
};

export const AGENT_LIST: AgentInfo[] = [AGENTS.chatgpt, AGENTS.copilot, AGENTS.gemini];

export interface InterpretationRequest {
  cards: Array<{
    name: string;
    position: string;
    isReversed: boolean;
  }>;
  spreadType: string;
  question: string;
  userName?: string;
  birthDate?: string;
}

export const buildPrompt = (request: InterpretationRequest): string => {
  const cardsText = request.cards
    .map(
      (c) =>
        `${c.name} na posição ${c.position}${c.isReversed ? ' (invertida)' : ''}`
    )
    .join(', ');

  return `Como Aleister Crowley, o mestre ocultista e criador do Tarot de Thoth, você está conduzindo uma leitura de tarot.
Use linguagem clara e natural em português brasileiro, adequada para leitura em voz alta.

CONTEXTO DA LEITURA:
Nome do Consulente: ${request.userName || 'Consulente'}
Data de Nascimento: ${request.birthDate || 'Não informada'}
Tipo de Tiragem: ${request.spreadType}
Pergunta: "${request.question}"
Cartas reveladas: ${cardsText}

Forneça uma interpretação que:
1. Use frases claras e bem pontuadas
2. Evite caracteres especiais ou símbolos complexos
3. Mantenha o misticismo mas com linguagem natural
4. Use pontuação simples (pontos e vírgulas)
5. Divida o texto em parágrafos curtos para melhor compreensão

IMPORTANTE:
- Mantenha o tom místico mas use linguagem natural
- Evite abreviações e símbolos
- Use pontuação simples para facilitar a leitura
- Refira-se ao consulente pelo nome (${request.userName || 'Consulente'})
- Use a data de nascimento do consulente (${request.birthDate || 'Não informada'}) para personalizar a leitura quando relevante
- Mantenha as respostas em português brasileiro claro`;
};

export interface CardInterpretationRequest {
  cardName: string;
  cardEnglishName: string;
  position: string;
  isReversed: boolean;
  keywords: string[];
  element?: string;
  suit?: string;
  number?: string;
  category: string;
  question: string;
  spreadType: string;
  userName?: string;
  birthDate?: string;
}

export const buildCardPrompt = (request: CardInterpretationRequest): string => {
  const categoryLabel =
    request.category === 'major'
      ? 'Arcano Maior'
      : request.category === 'court'
        ? 'Carta da Corte'
        : 'Arcano Menor';

  return `Como Aleister Crowley, o mestre ocultista e criador do Tarot de Thoth, você está interpretando uma única carta revelada em uma leitura.
Use linguagem clara e natural em português brasileiro, adequada para leitura em voz alta.

CONTEXTO DA LEITURA:
Nome do Consulente: ${request.userName || 'Consulente'}
Data de Nascimento: ${request.birthDate || 'Não informada'}
Tipo de Tiragem: ${request.spreadType}
Pergunta do Consulente: "${request.question}"

CARTA A INTERPRETAR:
Nome: ${request.cardName} (${request.cardEnglishName})
Categoria: ${categoryLabel}
Posição na tiragem: ${request.position}${request.isReversed ? ' (INVERTIDA)' : ''}
Palavras-chave: ${request.keywords.join(', ')}${request.element ? `\nElemento: ${request.element}` : ''}${request.suit ? `\nNaipe: ${request.suit}` : ''}${request.number ? `\nNúmero: ${request.number}` : ''}

Forneça uma interpretação profunda desta carta específica nesta posição, considerando:
1. O significado esotérico da carta no sistema Thoth
2. A influência da posição na tiragem
3. ${request.isReversed ? 'O efeito da inversão da carta nas energias' : 'A expressão plena das energias da carta em sua posição normal'}
4. As correspondências astrológicas, qabalísticas e elementais
5. Como esta carta responde à pergunta do consulente

IMPORTANTE:
- Mantenha o tom místico mas use linguagem natural
- Evite abreviações e símbolos
- Use pontuação simples para facilitar a leitura em voz alta
- Refira-se ao consulente pelo nome (${request.userName || 'Consulente'})
- Mantenha a resposta em português brasileiro claro
- Divida em parágrafos curtos`;
};

export type AgentWaitStatus =
  | { state: 'waiting' }
  | { state: 'received'; text: string }
  | { state: 'error'; message: string };

/**
 * Sends a prompt to the AI API (OpenAI via Vercel serverless function)
 * and returns the interpretation automatically — no copy/paste needed.
 */
export const sendToAgentAndWait = async (
  _agentType: AgentType,
  prompt: string,
  onStatus?: (status: AgentWaitStatus) => void
): Promise<string> => {
  onStatus?.({ state: 'waiting' });

  try {
    const response = await fetch('/api/ai-interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error || `Erro ${response.status}`;
      onStatus?.({ state: 'error', message });
      return '';
    }

    const data = await response.json();

    if (!data.interpretation || typeof data.interpretation !== 'string') {
      onStatus?.({ state: 'error', message: 'Resposta invalida do servidor.' });
      return '';
    }

    onStatus?.({ state: 'received', text: data.interpretation });
    return data.interpretation;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro de conexao com o servidor.';
    onStatus?.({ state: 'error', message });
    return '';
  }
};
