// Types for chat messages
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

// Store for chat messages
const CHAT_STORAGE_KEY = 'tarot_chat_history';

// Save chat history to localStorage
export const saveChatHistory = (messages: ChatMessage[]): void => {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
};

// Load chat history from localStorage
export const loadChatHistory = (): ChatMessage[] => {
  const stored = localStorage.getItem(CHAT_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Clear chat history
export const clearChatHistory = (): void => {
  localStorage.removeItem(CHAT_STORAGE_KEY);
};

// Keywords that suggest a complaint
const complaintKeywords = [
  'problema', 'erro', 'falha', 'bug', 'reclamação', 'insatisfeito',
  'não funciona', 'ruim', 'péssimo', 'terrível', 'decepcionado',
  'dinheiro', 'pagamento', 'cobrar', 'cobrança', 'reembolso',
  'devolver', 'demora', 'lento', 'atendimento', 'suporte'
];

// Keywords that suggest a payment issue
const paymentKeywords = [
  'pagamento', 'pagar', 'dinheiro', 'cartão', 'transferência',
  'pix', 'boleto', 'cobrar', 'cobrança', 'débito', 'crédito',
  'reembolso', 'estorno', 'devolver', 'devolução', 'mercado pago'
];

// Keywords that suggest a technical issue
const technicalKeywords = [
  'erro', 'bug', 'falha', 'travando', 'carregando', 'lento',
  'página', 'site', 'aplicativo', 'app', 'não funciona', 'problema',
  'botão', 'clique', 'login', 'senha', 'conta', 'acesso'
];

// Keywords that suggest a reading issue
const readingKeywords = [
  'carta', 'tarô', 'tarot', 'leitura', 'interpretação', 'resultado',
  'previsão', 'futuro', 'arcano', 'significado', 'consulta'
];

// Check if message contains keywords from a specific category
const containsKeywords = (message: string, keywords: string[]): boolean => {
  const lowerMessage = message.toLowerCase();
  return keywords.some(keyword => lowerMessage.includes(keyword));
};

// Generate unique ID for messages
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Initial bot message when chat starts
export const getInitialBotMessage = (): ChatMessage => {
  return {
    id: generateId(),
    text: 'Olá! Sou o assistente virtual do Tarot de Thoth. Como posso ajudar você hoje? Caso tenha alguma reclamação ou problema, estou aqui para resolver.',
    sender: 'bot',
    timestamp: Date.now()
  };
};

// Process user message and generate bot response
export const processMessage = (message: string): ChatMessage => {
  // Check if message contains complaint keywords
  const isComplaint = containsKeywords(message, complaintKeywords);
  
  // Categorize the complaint if it exists
  const isPaymentIssue = containsKeywords(message, paymentKeywords);
  const isTechnicalIssue = containsKeywords(message, technicalKeywords);
  const isReadingIssue = containsKeywords(message, readingKeywords);
  
  let responseText = '';
  
  if (isComplaint) {
    if (isPaymentIssue) {
      responseText = 'Entendo sua preocupação com relação ao pagamento. Posso ajudar a resolver isso. Por favor, me informe qual pacote você comprou e quando foi realizada a transação? Caso prefira, você também pode entrar em contato diretamente com nosso suporte via WhatsApp: https://wa.me/5511970603441';
    } else if (isTechnicalIssue) {
      responseText = 'Lamento pelo problema técnico. Vamos tentar resolver isso juntos. Você poderia descrever exatamente o que está acontecendo? Em qual página ou função você está tendo dificuldade? Se preferir suporte imediato, entre em contato via WhatsApp: https://wa.me/5511970603441';
    } else if (isReadingIssue) {
      responseText = 'Entendo sua dúvida sobre a leitura do tarô. As cartas podem ser complexas e suas interpretações variam conforme o contexto. Poderia me explicar qual foi a sua questão específica sobre a leitura? Estou aqui para ajudar a esclarecer.';
    } else {
      responseText = 'Lamento por sua experiência. Gostaria de entender melhor a situação para poder ajudar. Poderia fornecer mais detalhes sobre o problema que está enfrentando? Caso prefira falar diretamente com um atendente, você pode usar nosso WhatsApp: https://wa.me/5511970603441';
    }
  } else if (message.toLowerCase().includes('obrigado') || message.toLowerCase().includes('obrigada')) {
    responseText = 'De nada! Fico feliz em poder ajudar. Se precisar de mais alguma coisa, é só me chamar.';
  } else if (message.toLowerCase().includes('olá') || message.toLowerCase().includes('oi') || message.toLowerCase().includes('bom dia') || message.toLowerCase().includes('boa tarde') || message.toLowerCase().includes('boa noite')) {
    responseText = 'Olá! Como posso ajudar você hoje? Estou aqui para responder suas dúvidas sobre o Tarot de Thoth ou resolver qualquer problema que esteja enfrentando.';
  } else if (message.toLowerCase().includes('whatsapp') || message.toLowerCase().includes('falar com pessoa') || message.toLowerCase().includes('atendente') || message.toLowerCase().includes('humano')) {
    responseText = 'Se preferir falar diretamente com nossa equipe de suporte, você pode entrar em contato via WhatsApp: https://wa.me/5511970603441';
  } else if (message.toLowerCase().includes('reclame aqui') || message.toLowerCase().includes('reclamação formal')) {
    responseText = 'Você pode registrar uma reclamação formal no Reclame Aqui através deste link: https://www.reclameaqui.com.br/ - Mas antes disso, gostaríamos de tentar resolver seu problema diretamente. Poderia me contar mais sobre o que está acontecendo?';
  } else {
    responseText = 'Obrigado por entrar em contato. Como posso ajudar você hoje? Se estiver enfrentando algum problema ou tiver dúvidas sobre o Tarot de Thoth, estou aqui para ajudar.';
  }
  
  return {
    id: generateId(),
    text: responseText,
    sender: 'bot',
    timestamp: Date.now()
  };
};

// Check if the conversation should be escalated to human support
export const shouldEscalateToHuman = (messages: ChatMessage[]): boolean => {
  // If there are more than 5 exchanges and user is still complaining
  if (messages.length >= 10) {
    const lastFiveMessages = messages.slice(-5);
    const userMessages = lastFiveMessages.filter(m => m.sender === 'user');
    
    // Check if recent user messages contain complaint keywords
    return userMessages.some(m => 
      containsKeywords(m.text, complaintKeywords) || 
      m.text.toLowerCase().includes('falar com pessoa') ||
      m.text.toLowerCase().includes('atendente') ||
      m.text.toLowerCase().includes('humano') ||
      m.text.toLowerCase().includes('não resolveu')
    );
  }
  
  return false;
};

// Get escalation message suggesting WhatsApp contact
export const getEscalationMessage = (): ChatMessage => {
  return {
    id: generateId(),
    text: 'Parece que estamos tendo dificuldade em resolver seu problema por aqui. Sugiro entrar em contato diretamente com nossa equipe de suporte via WhatsApp para um atendimento mais personalizado: https://wa.me/5511970603441',
    sender: 'bot',
    timestamp: Date.now()
  };
};

// Get Reclame Aqui suggestion message
export const getReclameAquiMessage = (): ChatMessage => {
  return {
    id: generateId(),
    text: 'Se você preferir registrar uma reclamação formal, pode acessar o Reclame Aqui através deste link: https://www.reclameaqui.com.br/ - No entanto, gostaríamos de ressaltar que estamos comprometidos em resolver seu problema diretamente e da melhor forma possível.',
    sender: 'bot',
    timestamp: Date.now()
  };
};
