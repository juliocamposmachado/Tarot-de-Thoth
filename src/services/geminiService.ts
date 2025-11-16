const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
const API_KEY = "AIzaSyAhM04RjZpk9olc6nZDhbvP6vBBlRdd72s";

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

export const getInterpretation = async (request: InterpretationRequest) => {
  try {
    console.log('Enviando requisição ao Gemini:', request);
    
    const prompt = `Como Aleister Crowley, o mestre ocultista e criador do Tarot de Thoth, você está conduzindo uma leitura de tarot.
    Use linguagem clara e natural em português brasileiro, adequada para leitura em voz alta.
    
    CONTEXTO DA LEITURA:
    Nome do Consulente: ${request.userName || 'Consulente'}
    Data de Nascimento: ${request.birthDate || 'Não informada'}
    Tipo de Tiragem: ${request.spreadType}
    Pergunta: "${request.question}"
    Cartas reveladas: ${request.cards.map(c => 
      `${c.name} na posição ${c.position}${c.isReversed ? ' (invertida)' : ''}`
    ).join(', ')}
    
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

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Resposta recebida do Gemini API:', data);

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Formato de resposta inválido da API');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Erro na interpretação:', error);
    return "Os mistérios do Tarot estão temporariamente velados. Como Crowley ensinou, há momentos em que os portais astrais necessitam realinhamento. Tente novamente em breve, quando as energias estiverem mais propícias.";
  }
};
