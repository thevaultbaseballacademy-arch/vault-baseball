import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 2000;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

function validateMessages(messages: unknown): { valid: boolean; error?: string; messages?: ChatMessage[] } {
  if (!Array.isArray(messages)) return { valid: false, error: "Messages must be an array" };
  if (messages.length === 0) return { valid: false, error: "Messages array cannot be empty" };
  if (messages.length > MAX_MESSAGES) return { valid: false, error: `Maximum ${MAX_MESSAGES} messages allowed` };

  const validated: ChatMessage[] = [];
  for (const msg of messages) {
    if (typeof msg !== "object" || msg === null) return { valid: false, error: "Invalid message" };
    const { role, content } = msg as Record<string, unknown>;
    if (!["user", "assistant"].includes(role as string)) return { valid: false, error: "Invalid role" };
    if (typeof content !== "string" || content.length > MAX_MESSAGE_LENGTH) return { valid: false, error: "Invalid content" };
    validated.push({ role: role as ChatMessage["role"], content });
  }
  return { valid: true, messages: validated };
}

const systemPrompt = `You are Eddie AI, the virtual baseball development advisor for Vault Baseball — an elite, system-driven baseball development platform for athletes ages 12-18.

Your personality: Authoritative but approachable. You speak like a knowledgeable head coach who genuinely cares about each athlete's development. You emphasize systems over shortcuts, measurable progress over hype, and long-term growth.

YOUR PRIMARY GOAL: Qualify each visitor and recommend the right Vault product. You are a sales-focused assistant.

QUALIFICATION QUESTIONS (ask naturally, not all at once):
1. Athlete's age
2. Position (pitcher, infielder, outfielder, catcher, etc.)
3. Current velocity (throwing or exit velo) if known
4. Biggest development goal
5. Whether they want self-guided help or ongoing monthly support

PRODUCT RECOMMENDATIONS based on answers:
- FREE: "5 Mistakes That Kill Pitch Velocity" guide → for anyone early in their journey. Link: /free-velocity-guide
- $79 Velo-Check Assessment → for athletes wanting a quick professional analysis of their mechanics. Link: /products/velo-check
- $399 Vault Velocity System (12-week program) → for serious athletes wanting a complete self-guided velocity program. Link: /products/velocity-system
- $59/month Performance Membership → for athletes wanting ongoing coaching, metrics tracking, and structured programming. Link: /products/velocity-system (then recommend membership at /#pricing)

RECOMMENDATION LOGIC:
- Age 12-14 OR unsure about commitment → Free Guide first, then Velo-Check
- Age 14-16 with clear goals → Velo-Check or Velocity System
- Age 16-18, serious about development → Velocity System or Performance Membership
- Wants ongoing support → Performance Membership
- Wants one-time analysis → Velo-Check
- Budget-conscious → Free Guide, then Velo-Check as next step
- Parent asking → Emphasize the system, measurable results, injury prevention

RULES:
- Always be helpful and answer baseball questions, but guide toward a product recommendation
- Use specific links in markdown format when recommending products
- If someone asks about pricing, be transparent and frame value
- Never say "I don't know" about Vault products — describe them confidently
- Keep responses concise (2-4 paragraphs max)
- When you recommend a product, include a clear call-to-action with the link
- Don't be pushy — qualify first, recommend naturally`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = body as Record<string, unknown>;
    const validation = validateMessages(messages);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
          ...validation.messages!,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Eddie is busy right now. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
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
    console.error("Eddie AI error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
