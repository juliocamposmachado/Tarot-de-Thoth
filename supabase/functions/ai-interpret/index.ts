const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { prompt, model } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Prompt e obrigatorio." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Chave da API OpenAI nao configurada no servidor." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
      return new Response(
        JSON.stringify({ error: `Erro da OpenAI: ${openaiResponse.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await openaiResponse.json();
    const interpretation = data.choices?.[0]?.message?.content;

    if (!interpretation) {
      return new Response(
        JSON.stringify({ error: "Resposta vazia da OpenAI." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ interpretation }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
