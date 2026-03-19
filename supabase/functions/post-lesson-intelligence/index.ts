import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lessonId, feedbackId } = await req.json();
    if (!lessonId && !feedbackId) throw new Error("lessonId or feedbackId required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get feedback data
    let feedback: any;
    if (feedbackId) {
      const { data } = await supabase.from("coach_lesson_feedback").select("*").eq("id", feedbackId).single();
      feedback = data;
    } else {
      const { data } = await supabase.from("coach_lesson_feedback").select("*").eq("lesson_id", lessonId).order("created_at", { ascending: false }).limit(1).single();
      feedback = data;
    }

    if (!feedback) {
      return new Response(JSON.stringify({ skipped: true, reason: "No feedback found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sportType = feedback.sport_type || "baseball";
    const isSoftball = sportType === "softball";
    const athleteUserId = feedback.athlete_user_id;

    // Get athlete profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, position, sport_type")
      .eq("user_id", athleteUserId)
      .single();

    // Get current KPIs
    const { data: kpis } = await supabase
      .from("athlete_kpis")
      .select("kpi_name, kpi_value, kpi_unit, kpi_category")
      .eq("user_id", athleteUserId)
      .order("recorded_at", { ascending: false })
      .limit(20);

    // Build AI prompt to extract intelligence
    const prompt = `You are a ${isSoftball ? "softball" : "baseball"} development intelligence engine.

Based on this coaching feedback, extract structured development insights.

Athlete: ${profile?.display_name || "Athlete"} (${profile?.position || "Unknown"})
Sport: ${sportType}
Lesson Focus: ${feedback.lesson_focus || "General"}
Strengths: ${feedback.strengths_observed || "Not noted"}
Areas to Improve: ${feedback.areas_for_improvement || "Not noted"}
Coach Drills: ${JSON.stringify(feedback.recommended_drills || [])}
Next Focus: ${feedback.next_development_focus || "Not specified"}
Current KPIs: ${kpis?.length ? kpis.map((k: any) => `${k.kpi_name}: ${k.kpi_value} ${k.kpi_unit || ""}`).join(", ") : "None recorded"}

Extract:
1. Up to 3 strengths (short phrases)
2. Up to 3 weaknesses/gaps (short phrases)
3. Up to 3 auto-assign drill recommendations (these will be assigned immediately)
4. Up to 2 program/course suggestions (these will need coach approval)
5. A one-line weekly focus recommendation`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Extract structured development intelligence. Return valid JSON only." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_intelligence",
            description: "Extract structured development insights from lesson feedback",
            parameters: {
              type: "object",
              properties: {
                strengths: { type: "array", items: { type: "string" }, description: "Athlete strengths observed" },
                weaknesses: { type: "array", items: { type: "string" }, description: "Development gaps identified" },
                auto_drills: { type: "array", items: { type: "object", properties: { title: { type: "string" }, category: { type: "string" } }, required: ["title", "category"] }, description: "Drills to auto-assign" },
                suggested_programs: { type: "array", items: { type: "object", properties: { title: { type: "string" }, reason: { type: "string" } }, required: ["title", "reason"] }, description: "Programs needing coach approval" },
                weekly_focus: { type: "string", description: "One-line weekly focus" },
              },
              required: ["strengths", "weaknesses", "auto_drills", "weekly_focus"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "extract_intelligence" } },
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI error:", aiResponse.status);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await aiResponse.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("No structured response from AI");

    const intel = JSON.parse(toolCall.function.arguments);

    // 1. Auto-assign drills as homework (hybrid: drills are auto, programs need approval)
    if (intel.auto_drills?.length > 0) {
      const homeworkItems = intel.auto_drills.map((drill: any, i: number) => ({
        lesson_id: feedback.lesson_id,
        feedback_id: feedback.id,
        athlete_user_id: athleteUserId,
        coach_user_id: feedback.coach_user_id,
        title: `[AI] ${drill.title}`,
        category: drill.category || "drill",
        sort_order: 100 + i,
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      }));
      await supabase.from("player_homework").insert(homeworkItems);
    }

    // 2. Store intelligence insights on the feedback record
    await supabase.from("coach_lesson_feedback").update({
      ai_recommended_drills: intel.auto_drills || [],
      ai_homework: intel.suggested_programs || [],
    } as any).eq("id", feedback.id);

    // 3. Create activity feed entry
    await supabase.from("activity_feed").insert({
      user_id: athleteUserId,
      activity_type: "intelligence_update",
      title: `Development insights updated from ${isSoftball ? "softball" : "baseball"} lesson`,
      description: intel.weekly_focus,
      metadata: {
        strengths: intel.strengths,
        weaknesses: intel.weaknesses,
        sport_type: sportType,
        feedback_id: feedback.id,
        suggested_programs: intel.suggested_programs,
      },
    });

    // 4. Notify athlete
    await supabase.from("notifications").insert({
      user_id: athleteUserId,
      type: "intelligence_update",
      title: "Development Plan Updated",
      message: `New drills and focus areas assigned based on your latest ${isSoftball ? "softball" : "baseball"} lesson. Weekly focus: ${intel.weekly_focus}`,
      actor_id: feedback.coach_user_id,
    });

    // 5. Notify coach about suggested programs (needs approval)
    if (intel.suggested_programs?.length > 0) {
      await supabase.from("notifications").insert({
        user_id: feedback.coach_user_id,
        type: "program_suggestion",
        title: "Program Suggestions for Review",
        message: `AI recommends ${intel.suggested_programs.length} program(s) for ${profile?.display_name || "athlete"}: ${intel.suggested_programs.map((p: any) => p.title).join(", ")}`,
        actor_id: athleteUserId,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      drills_assigned: intel.auto_drills?.length || 0,
      programs_suggested: intel.suggested_programs?.length || 0,
      weekly_focus: intel.weekly_focus,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("post-lesson-intelligence error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
