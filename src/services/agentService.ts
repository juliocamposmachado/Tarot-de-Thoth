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

/**
 * The local bridge URLs. The site tries HTTPS first (port 5318, for production
 * on HTTPS sites) then HTTP (port 5317, for local dev).
 */
export const BRIDGE_HTTP = 'http://127.0.0.1:5317';
export const BRIDGE_HTTPS = 'https://127.0.0.1:5318';
export const BRIDGE_URL = BRIDGE_HTTP; // kept for compatibility

let _activeBridgeUrl: string | null = null;

async function findBridgeUrl(): Promise<string | null> {
  if (_activeBridgeUrl) return _activeBridgeUrl;
  for (const url of [BRIDGE_HTTPS, BRIDGE_HTTP]) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const r = await fetch(`${url}/api/v1/health`, { signal: controller.signal, mode: 'cors' });
      clearTimeout(timeout);
      if (r.ok) {
        _activeBridgeUrl = url;
        return url;
      }
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * The specific ChatGPT conversation used as the "brain."
 */
export const CHATGPT_CONVERSATION_URL = 'https://chatgpt.com/c/6acad485-8b30-83e9-81e3-8ee2b80196dd';

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

export type BridgeStatus =
  | { state: 'connecting' }
  | { state: 'queued' }
  | { state: 'opening_browser' }
  | { state: 'sending' }
  | { state: 'generating' }
  | { state: 'completed'; text: string }
  | { state: 'failed'; message: string }
  | { state: 'bridge_offline' };

export interface BridgeHealth {
  bridge: boolean;
  authenticated: boolean;
  browser_ready: boolean;
  message: string;
}

/**
 * Checks if the local bridge service is running and the ChatGPT session is active.
 * Tries HTTPS first (for when site is on HTTPS), falls back to HTTP (for dev).
 */
export const checkBridgeHealth = async (): Promise<BridgeHealth | null> => {
  const urls = [
    `https://127.0.0.1:5318/api/v1/health`,
    `http://127.0.0.1:5317/api/v1/health`,
  ];
  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(url, {
        signal: controller.signal,
        mode: 'cors',
      });
      clearTimeout(timeout);
      if (!response.ok) continue;
      const data = await response.json();
      return {
        bridge: data.bridge ?? false,
        authenticated: data.authenticated ?? false,
        browser_ready: data.browser_ready ?? false,
        message: data.message ?? '',
      };
    } catch {
      continue;
    }
  }
  return null;
};

/**
 * Continuously polls for the bridge until it comes online or max attempts reached.
 */
export const waitForBridge = async (
  maxAttempts: number = 30,
  intervalMs: number = 3000,
  onRetry?: (attempt: number) => void
): Promise<BridgeHealth | null> => {
  for (let i = 0; i < maxAttempts; i++) {
    if (i > 0) onRetry?.(i);
    const health = await checkBridgeHealth();
    if (health && health.authenticated) return health;
    if (health && !health.authenticated) return health;
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return null;
};

const STATUS_TO_BRIDGE: Record<string, string> = {
  queued: 'queued',
  opening_browser: 'opening_browser',
  waiting_for_chatgpt: 'sending',
  generating: 'generating',
  completed: 'completed',
  failed: 'failed',
  cancelled: 'failed',
};

/**
 * Sends a prompt to the local bridge, then polls for the result.
 * The bridge automates the ChatGPT browser interface to send and capture the response.
 */
export const sendToAgentAndWait = async (
  _agentType: AgentType,
  prompt: string,
  onStatus?: (status: BridgeStatus) => void,
  context?: { question: string; spreadType: string; cards: Array<{ name: string; position: string; isReversed: boolean }>; userName?: string; birthDate?: string }
): Promise<string> => {
  onStatus?.({ state: 'connecting' });

  // Find the active bridge URL
  const bridgeUrl = await findBridgeUrl();
  if (!bridgeUrl) {
    onStatus?.({ state: 'bridge_offline' });
    return '';
  }

  // Check if bridge is available and authenticated
  let health: BridgeHealth | null = null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const resp = await fetch(`${bridgeUrl}/api/v1/health`, { signal: controller.signal, mode: 'cors' });
    clearTimeout(timeout);
    if (resp.ok) health = await resp.json();
  } catch {
    onStatus?.({ state: 'bridge_offline' });
    return '';
  }

  if (!health) {
    onStatus?.({ state: 'bridge_offline' });
    return '';
  }

  if (!health.authenticated) {
    onStatus?.({ state: 'failed', message: 'Sessao do ChatGPT nao autenticada. Abra a ponte local e faca login.' });
    return '';
  }

  // Submit the reading request
  let readingId: string;
  try {
    const response = await fetch(`${bridgeUrl}/api/v1/readings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: context?.question || '',
        reading_type: context?.spreadType || '',
        cards: context?.cards || [],
        prompt,
        user_name: context?.userName || '',
        birth_date: context?.birthDate || '',
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      onStatus?.({ state: 'failed', message: err.error || `Erro ${response.status}` });
      return '';
    }

    const data = await response.json();
    readingId = data.id;
  } catch {
    onStatus?.({ state: 'bridge_offline' });
    return '';
  }

  // Poll for result
  const maxAttempts = 90; // ~3 minutes at 2s intervals
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const response = await fetch(`${bridgeUrl}/api/v1/readings/${readingId}`, { mode: 'cors' });
      if (!response.ok) continue;

      const data = await response.json();
      const status = data.status as string;
      const bridgeState = STATUS_TO_BRIDGE[status] || status;

      if (bridgeState === 'completed' && data.response) {
        onStatus?.({ state: 'completed', text: data.response });
        return data.response;
      }

      if (bridgeState === 'failed') {
        onStatus?.({ state: 'failed', message: data.error || 'Falha na comunicacao com o ChatGPT.' });
        return '';
      }

      // Update UI with intermediate status
      if (bridgeState === 'opening_browser') {
        onStatus?.({ state: 'opening_browser' });
      } else if (bridgeState === 'sending') {
        onStatus?.({ state: 'sending' });
      } else if (bridgeState === 'generating') {
        onStatus?.({ state: 'generating' });
      } else {
        onStatus?.({ state: 'queued' });
      }
    } catch {
      // Network blip — keep polling
    }
  }

  onStatus?.({ state: 'failed', message: 'Tempo esgotado aguardando resposta.' });
  return '';
};

/**
 * Opens the ChatGPT conversation in a new tab (for manual fallback mode).
 */
export const openChatGPTConversation = () => {
  window.open(CHATGPT_CONVERSATION_URL, '_blank', 'noopener,noreferrer');
};

/**
 * Launches the local bridge via the tarot-bridge:// custom protocol.
 * The browser will ask the user for permission to open the application.
 * After launching, polls for the bridge to come online.
 */
export const launchBridgeProtocol = (
  onStatus?: (status: string) => void
): Promise<BridgeHealth | null> => {
  return new Promise((resolve) => {
    onStatus?.('launching');

    // Trigger the custom protocol
    const link = document.createElement('a');
    link.href = 'tarot-bridge://start';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onStatus?.('waiting');

    // Poll for the bridge to come online (up to 30 attempts = ~90 seconds)
    let attempts = 0;
    const maxAttempts = 30;
    const interval = setInterval(async () => {
      attempts++;
      onStatus?.(`polling_${attempts}`);

      const health = await checkBridgeHealth();
      if (health) {
        clearInterval(interval);
        onStatus?.('online');
        resolve(health);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        onStatus?.('timeout');
        resolve(null);
      }
    }, 3000);
  });
};

/**
 * Returns the appropriate installer script URL based on the user's OS.
 */
export const getInstallerInfo = (): { url: string; label: string } => {
  const ua = navigator.userAgent;
  if (ua.includes('Win')) {
    return { url: '/local_bridge/setup-windows.bat', label: 'Baixar instalador (Windows)' };
  }
  if (ua.includes('Mac')) {
    return { url: '/local_bridge/setup-mac.sh', label: 'Baixar instalador (macOS)' };
  }
  return { url: '/local_bridge/setup.sh', label: 'Baixar instalador (Linux)' };
};

/**
 * Copies text to clipboard (for manual fallback mode).
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
