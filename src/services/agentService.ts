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

export interface OpenAgentResult {
  success: boolean;
  message: string;
  prompt: string;
}

export const openAgent = async (
  agentType: AgentType,
  prompt: string
): Promise<OpenAgentResult> => {
  const agent = AGENTS[agentType];
  if (!agent) {
    return { success: false, message: 'Agente não encontrado.', prompt };
  }

  try {
    await navigator.clipboard.writeText(prompt);
  } catch {
    // Clipboard may fail in non-secure contexts; prompt text is still shown in UI
  }

  window.open(agent.url, '_blank', 'noopener,noreferrer');

  return {
    success: true,
    message: `Prompt copiado para a área de transferência e ${agent.name} aberto em nova aba. Cole o texto lá, copie a resposta e cole aqui.`,
    prompt,
  };
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

export const authorizeAgent = (agentType: AgentType): void => {
  const agent = AGENTS[agentType];
  if (!agent) return;
  window.open(agent.url, '_blank', 'noopener,noreferrer');
};

/**
 * Opens the agent's URL with the prompt encoded as a query parameter.
 * ChatGPT and Gemini support ?q= / ?text= URL params that pre-fill the chat input.
 * Copilot supports similar parameter. The user still sends the message manually.
 */
export const sendViaUrl = (agentType: AgentType, prompt: string): void => {
  const agent = AGENTS[agentType];
  if (!agent) return;

  let url: string;
  switch (agentType) {
    case 'chatgpt':
      url = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
      break;
    case 'gemini':
      url = `https://gemini.google.com/app?q=${encodeURIComponent(prompt)}`;
      break;
    case 'copilot':
      url = `https://copilot.microsoft.com/?q=${encodeURIComponent(prompt)}`;
      break;
    default:
      url = agent.url;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Copies the prompt to clipboard and opens agent with prompt in URL simultaneously.
 */
export const copyAndSendViaUrl = async (agentType: AgentType, prompt: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(prompt);
  } catch {
    // Clipboard may fail; URL still carries the prompt
  }
  sendViaUrl(agentType, prompt);
};

/**
 * Starts a clipboard-watcher loop that resolves when the clipboard content changes.
 * The user copies the agent's response, returns to the tarot tab, and we detect it automatically.
 * Falls back gracefully if clipboard read permission is denied.
 */
export const waitForAgentResponse = (
  originalPrompt: string,
  onStatus?: (status: AgentWaitStatus) => void
): Promise<string> => {
  return new Promise((resolve) => {
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let visibilityHandler: ((e: Event) => void) | null = null;
    const originalText = originalPrompt.trim();
    const startedAt = Date.now();
    let resolved = false;

    const cleanup = () => {
      if (pollInterval) clearInterval(pollInterval);
      if (timeoutId) clearTimeout(timeoutId);
      if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler);
      }
    };

    const checkClipboard = async (): Promise<void> => {
      if (resolved) return;
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.trim().length > 20 && text.trim() !== originalText && text.trim() !== startedAt.toString()) {
          resolved = true;
          cleanup();
          onStatus?.({ state: 'received', text });
          resolve(text.trim());
        }
      } catch {
        // Permission denied or clipboard API unavailable; keep waiting
      }
    };

    // Check on visibility change (user returns to the tab)
    visibilityHandler = () => {
      if (document.visibilityState === 'visible' && !resolved) {
        onStatus?.({ state: 'checking' });
        checkClipboard();
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);

    // Also poll every 2 seconds while visible
    pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkClipboard();
      }
    }, 2000);

    // Timeout after 10 minutes
    timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        onStatus?.({ state: 'timeout' });
        resolve('');
      }
    }, 600000);

    onStatus?.({ state: 'waiting' });
  });
};

export type AgentWaitStatus =
  | { state: 'waiting' }
  | { state: 'checking' }
  | { state: 'received'; text: string }
  | { state: 'timeout' };

/**
 * Unified flow: copies prompt to clipboard, opens agent with prompt encoded in URL (?q=...),
 * then watches the clipboard for the user's copied response. Returns the response text.
 *
 * Steps for the user:
 * 1. Click "Enviar ao ChatGPT" — prompt is copied + agent opens with prompt pre-filled in URL
 * 2. In the agent tab: press Enter (or click send) to submit the prompt
 * 3. Wait for the agent to generate the response
 * 4. Select and copy the response (Ctrl+C / Cmd+C)
 * 5. Return to the tarot tab — the response is captured from clipboard automatically
 */
export const sendToAgentAndWait = async (
  agentType: AgentType,
  prompt: string,
  onStatus?: (status: AgentWaitStatus) => void
): Promise<string> => {
  const agent = AGENTS[agentType];
  if (!agent) {
    onStatus?.({ state: 'timeout' });
    return '';
  }

  // Copy prompt to clipboard so the user has it as backup
  try {
    await navigator.clipboard.writeText(prompt);
  } catch {
    // Clipboard write may fail in non-secure contexts
  }

  // Open agent with prompt encoded in URL (?q=...)
  sendViaUrl(agentType, prompt);

  onStatus?.({ state: 'waiting' });

  // Wait for the user to copy the response back
  const response = await waitForAgentResponse(prompt, onStatus);
  return response;
};
