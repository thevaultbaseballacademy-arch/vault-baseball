import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation constants
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_TOTAL_CONTENT_LENGTH = 50000;
const MAX_TARGET_SCHOOLS = 20;
const MAX_STRING_LENGTH = 200;

// Simple message schema validator
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface AthleteContext {
  name?: string;
  position?: string;
  graduationYear?: number;
  targetSchools?: string[];
}

function validateMessages(messages: unknown): { valid: boolean; error?: string; messages?: ChatMessage[] } {
  if (!Array.isArray(messages)) {
    return { valid: false, error: "Messages must be an array" };
  }

  if (messages.length === 0) {
    return { valid: false, error: "Messages array cannot be empty" };
  }

  if (messages.length > MAX_MESSAGES) {
    return { valid: false, error: `Maximum ${MAX_MESSAGES} messages allowed` };
  }

  let totalContentLength = 0;
  const validatedMessages: ChatMessage[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    if (typeof msg !== "object" || msg === null) {
      return { valid: false, error: `Message at index ${i} must be an object` };
    }

    const { role, content } = msg as Record<string, unknown>;

    if (!role || typeof role !== "string") {
      return { valid: false, error: `Message at index ${i} must have a valid role` };
    }

    if (!["user", "assistant", "system"].includes(role)) {
      return { valid: false, error: `Invalid role "${role}" at index ${i}. Must be user, assistant, or system` };
    }

    if (typeof content !== "string") {
      return { valid: false, error: `Message content at index ${i} must be a string` };
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      return { valid: false, error: `Message at index ${i} exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` };
    }

    totalContentLength += content.length;

    if (totalContentLength > MAX_TOTAL_CONTENT_LENGTH) {
      return { valid: false, error: `Total message content exceeds maximum of ${MAX_TOTAL_CONTENT_LENGTH} characters` };
    }

    validatedMessages.push({ role: role as ChatMessage["role"], content });
  }

  return { valid: true, messages: validatedMessages };
}

function validateAthleteContext(context: unknown): { valid: boolean; error?: string; context?: AthleteContext } {
  if (context === undefined || context === null) {
    return { valid: true, context: undefined };
  }

  if (typeof context !== "object") {
    return { valid: false, error: "Athlete context must be an object" };
  }

  const ctx = context as Record<string, unknown>;
  const validated: AthleteContext = {};

  if (ctx.name !== undefined) {
    if (typeof ctx.name !== "string" || ctx.name.length > MAX_STRING_LENGTH) {
      return { valid: false, error: `Name must be a string with max ${MAX_STRING_LENGTH} characters` };
    }
    validated.name = ctx.name;
  }

  if (ctx.position !== undefined) {
    if (typeof ctx.position !== "string" || ctx.position.length > MAX_STRING_LENGTH) {
      return { valid: false, error: `Position must be a string with max ${MAX_STRING_LENGTH} characters` };
    }
    validated.position = ctx.position;
  }

  if (ctx.graduationYear !== undefined) {
    if (typeof ctx.graduationYear !== "number" || ctx.graduationYear < 2000 || ctx.graduationYear > 2050) {
      return { valid: false, error: "Graduation year must be a number between 2000 and 2050" };
    }
    validated.graduationYear = ctx.graduationYear;
  }

  if (ctx.targetSchools !== undefined) {
    if (!Array.isArray(ctx.targetSchools)) {
      return { valid: false, error: "Target schools must be an array" };
    }
    if (ctx.targetSchools.length > MAX_TARGET_SCHOOLS) {
      return { valid: false, error: `Maximum ${MAX_TARGET_SCHOOLS} target schools allowed` };
    }
    for (const school of ctx.targetSchools) {
      if (typeof school !== "string" || school.length > MAX_STRING_LENGTH) {
        return { valid: false, error: `Each school must be a string with max ${MAX_STRING_LENGTH} characters` };
      }
    }
    validated.targetSchools = ctx.targetSchools as string[];
  }

  return { valid: true, context: validated };
}

const SYSTEM_PROMPT = `You are an expert college baseball recruiting advisor for high school athletes. Your role is to help athletes navigate the college recruiting process.

You can help with:
- Writing and improving recruiting emails to coaches
- Preparing for unofficial and official visits
- Understanding NCAA eligibility requirements
- Creating a recruiting timeline and action plan
- Crafting compelling athlete profiles
- Answering questions about D1, D2, D3, NAIA, and JUCO programs
- Providing tips for showcase events and camps
- Explaining the scholarship process and financial aid

Keep responses concise, actionable, and encouraging. Use your knowledge of baseball recruiting to provide specific, helpful advice. When drafting emails or messages, maintain a professional but personable tone appropriate for a student-athlete.

If asked about specific schools or coaches, provide general guidance rather than specific contact info. Always encourage athletes to verify current information with the school directly.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Invalid or expired token:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid or expired session. Please sign in again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof body !== "object" || body === null) {
      return new Response(
        JSON.stringify({ error: "Request body must be an object" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, athleteContext } = body as Record<string, unknown>;

    // Validate messages
    const messagesValidation = validateMessages(messages);
    if (!messagesValidation.valid) {
      console.error("Messages validation failed:", messagesValidation.error);
      return new Response(
        JSON.stringify({ error: messagesValidation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate athlete context
    const contextValidation = validateAthleteContext(athleteContext);
    if (!contextValidation.valid) {
      console.error("Athlete context validation failed:", contextValidation.error);
      return new Response(
        JSON.stringify({ error: contextValidation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context about the athlete if provided
    let contextMessage = "";
    const validatedContext = contextValidation.context;
    if (validatedContext) {
      contextMessage = `\n\nCurrent athlete context:
- Name: ${validatedContext.name || "Not provided"}
- Position: ${validatedContext.position || "Not provided"}
- Graduation Year: ${validatedContext.graduationYear || "Not provided"}
- Target Schools: ${validatedContext.targetSchools?.join(", ") || "Not specified"}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + contextMessage },
          ...messagesValidation.messages!,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Recruiting assistant error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
