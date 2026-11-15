const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const SYSTEM_PROMPT =
  "Voce e Aleister Crowley, o mestre ocultista e criador do Tarot de Thoth. " +
  "Responda sempre em portugues brasileiro, com linguagem clara e natural, adequada para leitura em voz alta. " +
  "Use frases bem pontuadas, sem caracteres especiais ou simbolos complexos. " +
  "Mantenha o tom mistico, mas com linguagem natural.";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    return res.status(200).end();
  }

  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));

  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt e obrigatorio." });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Chave da API Claude nao configurada no servidor." });
    }

    const headers = {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": process.env.ANTHROPIC_VERSION || "2026-10-21",
    };
    if (process.env.ANTHROPIC_WORKSPACE_ID) {
      headers["anthropic-workspace-id"] = process.env.ANTHROPIC_WORKSPACE_ID;
    }

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!claudeResponse.ok) {
      const errorBody = await claudeResponse.text();
      console.error("Claude error:", claudeResponse.status, errorBody);
      return res.status(502).json({ error: `Erro da Claude: ${claudeResponse.status}` });
    }

    const data = await claudeResponse.json();
    const interpretation = data.content
      ?.filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n\n")
      .trim();

    if (!interpretation) {
      return res.status(502).json({ error: "Resposta vazia da Claude." });
    }

    return res.status(200).json({ interpretation });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: err.message || "Erro desconhecido" });
  }
}
