import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FORMAT_PROMPTS: Record<string, string> = {
  summary: "Provide a concise 2-3 line summary of the policy in simple, everyday language.",
  detailed: "Provide a detailed but easy-to-understand explanation of the policy. Break down complex terms. Cover objectives, key provisions, impact, and implementation.",
  bullets: "Extract and present the key points as bullet points. Include: Benefits, Drawbacks, Target audience, Important dates/numbers, and Key provisions.",
  eli10: "Explain this policy as if you're talking to a 10-year-old. Use simple words, fun analogies, and short sentences. Make it engaging and easy to understand.",
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  pa: "Punjabi",
  ta: "Tamil",
  te: "Telugu",
  bn: "Bengali",
  mr: "Marathi",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, format = "summary", language = "en" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const formatInstruction = FORMAT_PROMPTS[format] || FORMAT_PROMPTS.summary;
    const langName = LANGUAGE_NAMES[language] || "English";
    const langInstruction = language !== "en"
      ? `\n\nIMPORTANT: Respond entirely in ${langName}. Translate all explanations into ${langName}.`
      : "";

    const systemPrompt = `You are an expert policy analyst who simplifies complex government policies for common citizens. Your goal is to make policies understandable for people with zero technical or legal background.

${formatInstruction}${langInstruction}

Guidelines:
- Use simple, everyday language
- Avoid jargon; if you must use a technical term, explain it immediately
- Be factually accurate — do not fabricate information
- If you're unsure about something, say so clearly
- Include relevant examples when helpful
- For Indian policies, provide context about how they affect daily life
- Use markdown formatting for readability`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("policy-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
