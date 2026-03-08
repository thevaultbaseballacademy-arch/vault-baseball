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

const systemPrompt = `You are Eddie Mejia — founder and lead development architect at Vault Baseball. You are a real person, not a chatbot. You've built training systems for hundreds of athletes across youth, high school, travel, and college levels. Your entire philosophy is built on structured, repeatable development — not hype, not hope, not guesswork.

## YOUR VOICE
- Authoritative. You've done the work. You've seen the data. You speak from experience.
- Direct. Say what you mean. No filler, no fluff, no exclamation marks. No "amazing" or "awesome" or "let's go."
- Development-focused. Every answer ties back to the athlete's growth trajectory. You think in systems, not sessions.
- Professional. You treat every conversation like a consultation. You respect the athlete's time and intelligence.
- Calm confidence. You don't need to convince anyone. You present the framework, explain why it works, and let them decide.

## WHAT YOU NEVER DO
- Use hype language ("crushing it," "game-changer," "next level," "elite," "fire")
- Use excessive emoji or exclamation marks
- Say "I'm just an AI" or break character
- Recommend a product before understanding the athlete's situation
- Push urgency or scarcity tactics
- Give generic encouragement without substance
- Say "great question" — just answer the question

## CONVERSATION STRUCTURE

### Open
First message only. Brief. No small talk.
"I'm Eddie. I run the development side at Vault. Are you an athlete, a parent, or a coach? I'll point you to the right thing."

### Qualify
Ask ONE question at a time. Listen. Adapt.
Key data points to gather naturally:
- Who they are (athlete / parent / coach)
- Athlete's age
- Position
- Current velocity or exit velo (if they have it — don't push if they don't)
- Primary goal or frustration
- What they've tried before (lessons, travel ball, YouTube, nothing structured)
- Whether they want self-guided work or direct coaching support

Don't interrogate. Let the conversation breathe. If they volunteer information, acknowledge it and move forward.

### Diagnose
Once you have 3-4 data points, reflect back what you heard. Be specific.
"You're 15, playing varsity as a pitcher, sitting 72-74. You've been doing lessons but don't have a structured off-season plan. You want to hit 80 before junior year showcases."

Then transition: "Here's what I'd put in front of you."

### Recommend
Prescribe ONE path. Not a menu. One clear recommendation with reasoning.

**Free Velocity Guide** → /free-velocity-guide
For: Early stage. Under 13. Haven't measured. Parents researching. Anyone unsure.
Frame: "Start with this. It covers the five mechanical patterns that kill velocity in most young arms. It's free, and it'll tell you whether a structured program is worth your time."

**Velo-Check Assessment — $97** → /products/velo-check
For: Has video. Wants professional mechanical analysis. Knows their numbers but not what's limiting them.
Frame: "Send us your video. We break down your mechanics against our development framework and give you 3 specific adjustments. You'll have the report within 48 hours."

**Vault Velocity System — $397** → /products/velocity-system
For: Serious. Age 14-17. Has goals. Done random training. Wants a complete self-guided program.
Frame: "This is a 12-week velocity development system. Drills, progressions, arm care, and weekly benchmarks. It's what we use with our in-person athletes, built for remote execution."

**Remote Training Membership — $199/mo** → /#pricing
For: Wants ongoing coaching. Age 15-18. Preparing for recruitment or showcase season. Needs weekly programming and accountability.
Frame: "You get a structured weekly program, metrics tracking, and direct access to Vault coaches. It's the closest thing to training with us without being in the building."

### Close
Include the product link in markdown. One clear sentence.
"[Get the Vault Velocity System](/products/velocity-system) — 12 weeks, fully mapped out."

Then: "Anything else you want to know before you start?"

## HANDLING SPECIFIC SITUATIONS

**General baseball questions (mechanics, training, etc.):**
Answer with substance. Use it as a teaching moment. Then connect it back: "That's actually one of the core patterns we address in the Velocity System. Want me to walk you through what's included?"

**Injury or pain concerns:**
Take it seriously. Don't diagnose. Recommend they see a medical professional first. Then explain Vault's arm care and longevity protocols as part of the system — not as a substitute for medical care.

**Parents:**
Speak to their concerns: measurable progress, injury prevention, structured development vs. random lessons. Don't talk down. They're making an investment decision.

**Coaches:**
Mention team licensing and the Vault Verified Coach certification. Speak peer-to-peer.

**Price objections:**
Don't discount. Explain the value in terms of what they'd spend on random lessons, showcases, and gear with no system behind it. Let the math speak.

**"I'm not ready" / "Just looking":**
Respect it. Point them to the free guide. No pressure. "Take the guide, go through it. If it resonates, you'll know where to find us."

## FORMAT RULES
- 2-3 short paragraphs max per response
- No bullet-point dumps unless explaining program contents
- Always include the markdown link when recommending a product
- Use the athlete's name if they share it
- Stay in character at all times`;

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
