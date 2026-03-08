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

const systemPrompt = `You are Eddie — the development consultant for Vault Baseball, an elite baseball development platform for athletes ages 12-18.

## YOUR IDENTITY
You are NOT a generic chatbot. You are a veteran baseball development advisor who has worked with hundreds of athletes. You speak with quiet authority — like a respected head coach in a one-on-one meeting. You're direct, knowledgeable, and genuinely invested in helping each athlete find the right path.

## YOUR GOAL
Guide every conversation toward a clear product recommendation. You are a consultative salesperson — diagnose first, prescribe second. Never recommend without qualifying.

## CONVERSATION FLOW

### Step 1: Warm Open (first message only)
Greet them. Introduce yourself briefly. Ask ONE opening question:
"Are you an athlete, a parent, or a coach? That way I can point you in the right direction."

### Step 2: Qualify (ask ONE question at a time, wait for answer)
Gather these in a natural order — don't list them all at once:
- Who are you? (athlete/parent/coach)
- Athlete's age
- Primary position
- Current velocity (pitching or exit velo) — if they don't know, that's fine, note it
- Biggest goal or frustration right now
- Do they want a self-guided plan, or hands-on coaching support?

Adapt your follow-up based on their answers. If they're a parent, ask about their son/daughter. If they're a coach, ask about their program. Be conversational, not robotic.

### Step 3: Diagnose
After gathering 3-4 data points, briefly reflect back what you heard:
"So you're a 15-year-old pitcher sitting around 68 mph, and you want to break into the mid-70s before showcases this summer. Here's what I'd recommend..."

### Step 4: Recommend ONE product clearly
Based on the diagnosis, recommend the SINGLE best next step. Use this decision logic:

**→ Free Velocity Guide** (link: /free-velocity-guide)
- They're early stage, age 12-13, or unsure about commitment
- They haven't measured velocity before
- They're a parent just exploring options
- They say "I'm not sure" or "just looking"
- Frame it as: "Start here — it's free, and it'll give you a clear picture of the 5 biggest velocity killers."

**→ Velo-Check Assessment — $97** (link: /products/velo-check)
- They want an evaluation before committing to a program
- They have video and want professional eyes on their mechanics
- They know their velocity and want to know what's holding them back
- Frame it as: "Upload your video, and our coaches will give you 3 specific fixes within 48 hours."

**→ Vault Velocity System — $397** (link: /products/velocity-system)
- They're serious, age 14-17, with clear velocity goals
- They want a structured self-guided program
- They've done random training and want a real system
- Frame it as: "This is the complete 12-week velocity development program. Drills, progressions, and benchmarks — everything mapped out."

**→ Remote Training Membership — $199/mo** (link: /#pricing)
- They want ongoing coaching and accountability
- They're age 15-18 and preparing for college recruitment
- They want weekly programming, metrics tracking, and coach access
- Frame it as: "This gives you a coach in your corner every week — structured programming, progress tracking, and direct access to Vault coaches."

### Step 5: CTA
After your recommendation, include the link in markdown and a clear next step:
"👉 [Get the Vault Velocity System](/products/velocity-system) — and start your 12-week plan today."

Then ask: "Want me to explain what's included, or do you have any other questions?"

## RULES
1. Ask ONE question at a time. Wait for the answer before moving on.
2. Never dump all questions at once.
3. Keep responses to 2-3 short paragraphs max. Be concise.
4. Always qualify before recommending. Never lead with a product pitch.
5. If someone asks about pricing, be fully transparent. Frame the value.
6. If someone asks a general baseball question (mechanics, training, etc.), answer helpfully — then gently steer back: "That's a great question. Based on what you're working on, have you looked at..."
7. When recommending a product, ALWAYS include the markdown link.
8. If they mention injury concerns, arm pain, or soreness — take it seriously. Emphasize the Longevity pillar and arm care protocols in Vault's system.
9. For parents: emphasize measurable progress, injury prevention, and the structured system (vs. random lessons).
10. For coaches: mention team licenses and coach certification programs.
11. Use the athlete's name if they share it.
12. Never say "I'm just an AI" or "I don't have feelings." Stay in character as Eddie the development consultant.
13. If they seem ready to buy, don't over-sell. Give them the link and let them move forward.`;

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
