import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Verify user
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { analysisId } = await req.json();
    if (!analysisId) throw new Error("Missing analysisId");

    // Service role client for updates
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch the analysis record
    const { data: analysis, error: fetchErr } = await adminClient
      .from("video_analyses")
      .select("*")
      .eq("id", analysisId)
      .single();

    if (fetchErr || !analysis) throw new Error("Analysis not found");
    if (analysis.user_id !== user.id) throw new Error("Access denied");

    // Update status to processing
    await adminClient
      .from("video_analyses")
      .update({ status: "processing" })
      .eq("id", analysisId);

    const videoType = analysis.video_type || "pitching";

    const systemPrompt = `You are Vault Baseball's elite AI mechanics analyst. You specialize in breaking down baseball ${videoType} mechanics with the precision of a professional pitching/hitting coach.

Analyze the athlete's video and provide a structured JSON response with this exact format:
{
  "overall_grade": "A/B/C/D/F",
  "summary": "2-3 sentence executive summary of the athlete's mechanics",
  "strengths": [
    { "area": "string", "detail": "string", "impact": "high/medium/low" }
  ],
  "areas_for_improvement": [
    { "area": "string", "detail": "string", "priority": "critical/important/minor", "drill_recommendation": "string" }
  ],
  "mechanical_breakdown": {
    ${videoType === "pitching" ? `
    "wind_up": { "rating": 1-10, "notes": "string" },
    "leg_lift": { "rating": 1-10, "notes": "string" },
    "stride": { "rating": 1-10, "notes": "string" },
    "arm_action": { "rating": 1-10, "notes": "string" },
    "hip_shoulder_separation": { "rating": 1-10, "notes": "string" },
    "release_point": { "rating": 1-10, "notes": "string" },
    "follow_through": { "rating": 1-10, "notes": "string" },
    "deceleration": { "rating": 1-10, "notes": "string" }
    ` : videoType === "hitting" ? `
    "stance": { "rating": 1-10, "notes": "string" },
    "load": { "rating": 1-10, "notes": "string" },
    "stride": { "rating": 1-10, "notes": "string" },
    "hip_rotation": { "rating": 1-10, "notes": "string" },
    "bat_path": { "rating": 1-10, "notes": "string" },
    "contact_point": { "rating": 1-10, "notes": "string" },
    "extension": { "rating": 1-10, "notes": "string" },
    "follow_through": { "rating": 1-10, "notes": "string" }
    ` : `
    "footwork": { "rating": 1-10, "notes": "string" },
    "arm_slot": { "rating": 1-10, "notes": "string" },
    "transfer": { "rating": 1-10, "notes": "string" },
    "accuracy": { "rating": 1-10, "notes": "string" },
    "body_control": { "rating": 1-10, "notes": "string" }
    `}
  },
  "velocity_potential_notes": "string - observations about potential velocity/power gains",
  "injury_risk_flags": ["string - any mechanics that could lead to injury"],
  "pre_session_focus_areas": ["string - top 3 things to work on with coach"]
}

Be specific, actionable, and reference actual mechanical cues. This analysis prepares the athlete for a live coaching session.`;

    // Call Lovable AI with tool calling for structured output
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this ${videoType} video. The athlete uploaded it for pre-session AI analysis. Provide your full mechanical breakdown. Video URL: ${analysis.video_url}`,
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_analysis",
              description: "Submit the structured mechanics analysis",
              parameters: {
                type: "object",
                properties: {
                  overall_grade: { type: "string", enum: ["A", "B", "C", "D", "F"] },
                  summary: { type: "string" },
                  strengths: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        area: { type: "string" },
                        detail: { type: "string" },
                        impact: { type: "string", enum: ["high", "medium", "low"] },
                      },
                      required: ["area", "detail", "impact"],
                    },
                  },
                  areas_for_improvement: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        area: { type: "string" },
                        detail: { type: "string" },
                        priority: { type: "string", enum: ["critical", "important", "minor"] },
                        drill_recommendation: { type: "string" },
                      },
                      required: ["area", "detail", "priority", "drill_recommendation"],
                    },
                  },
                  mechanical_breakdown: { type: "object" },
                  velocity_potential_notes: { type: "string" },
                  injury_risk_flags: { type: "array", items: { type: "string" } },
                  pre_session_focus_areas: { type: "array", items: { type: "string" } },
                },
                required: [
                  "overall_grade", "summary", "strengths", "areas_for_improvement",
                  "mechanical_breakdown", "velocity_potential_notes",
                  "injury_risk_flags", "pre_session_focus_areas",
                ],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_analysis" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        await adminClient.from("video_analyses").update({ status: "error" }).eq("id", analysisId);
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        await adminClient.from("video_analyses").update({ status: "error" }).eq("id", analysisId);
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", status, errText);
      await adminClient.from("video_analyses").update({ status: "error" }).eq("id", analysisId);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    let analysisResult;

    // Extract from tool call response
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      analysisResult = typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } else {
      // Fallback: try parsing content as JSON
      const content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = { summary: content, overall_grade: "N/A", strengths: [], areas_for_improvement: [], mechanical_breakdown: {}, velocity_potential_notes: "", injury_risk_flags: [], pre_session_focus_areas: [] };
      }
    }

    // Save results
    await adminClient
      .from("video_analyses")
      .update({ status: "completed", ai_analysis: analysisResult })
      .eq("id", analysisId);

    return new Response(JSON.stringify({ success: true, analysis: analysisResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-video error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
