const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }

  // Set CORS on all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    const { prompt, model } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt e obrigatorio." });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Chave da API OpenAI nao configurada no servidor." });
    }

    const selectedModel = model || "gpt-4o-mini";

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: "system",
            content: "Voce e Aleister Crowley, o mestre ocultista e criador do Tarot de Thoth. Responda sempre em portugues brasileiro, com linguagem clara e natural, adequada para leitura em voz alta. Use frases bem pontuadas, sem caracteres especiais ou simbolos complexos. Mantenha o tom mistico mas com linguagem natural.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.text();
      console.error("OpenAI error:", openaiResponse.status, errorBody);
      return res.status(502).json({ error: `Erro da OpenAI: ${openaiResponse.status}` });
    }

    const data = await openaiResponse.json();
    const interpretation = data.choices?.[0]?.message?.content;

    if (!interpretation) {
      return res.status(502).json({ error: "Resposta vazia da OpenAI." });
    }

    return res.status(200).json({ interpretation });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: err.message || "Erro desconhecido" });
  }
}
