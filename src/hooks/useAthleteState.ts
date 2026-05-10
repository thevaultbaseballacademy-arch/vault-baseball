// VAULT OS — Unified Athlete State hook.
// Composes existing Supabase tables into one AthleteState object that every
// page can read. Pure read-only; no schema changes required.

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  type AthleteState,
  type AthleteEvaluationSummary,
  type AthleteTrainingSummary,
  type AthleteRecruitingSummary,
  type UserRole,
} from "@/lib/pathway/types";
import { deriveStage } from "@/lib/pathway/engine";

const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

interface RawComposed {
  profile: any | null;
  roleRow: any | null;
  latestEval: any | null;
  recruiting: any | null;
  programs: any[];
}

async function fetchComposed(userId: string): Promise<RawComposed> {
  const [profileRes, roleRes, evalRes, recruitingRes, programsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("user_roles" as any).select("role").eq("user_id", userId).limit(1).maybeSingle(),
    supabase
      .from("player_evaluations" as any)
      .select("overall_score, scores, evaluated_at, template_key")
      .eq("athlete_user_id", userId)
      .order("evaluated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("recruiting_profiles" as any)
      .select("commitment_status, gpa, sat_score, act_score, ncaa_eligibility_center, highlight_video_url, division_target")
      .eq("user_id", userId)
      .maybeSingle(),
    // Active enrollments. Tolerate missing table.
    supabase
      .from("course_enrollments" as any)
      .select("course_id, progress_pct, completed_at, courses:course_id(title, slug)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  return {
    profile: profileRes.data ?? null,
    roleRow: (roleRes as any)?.data ?? null,
    latestEval: (evalRes as any)?.data ?? null,
    recruiting: (recruitingRes as any)?.data ?? null,
    programs: ((programsRes as any)?.data as any[]) ?? [],
  };
}

function computeAge(profile: any): number | null {
  // Age group strings like "U14", "14U" → infer numeric.
  const ag = profile?.age_group as string | undefined;
  if (!ag) return null;
  const m = ag.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

function summarizeEvaluation(latest: any | null): AthleteEvaluationSummary {
  if (!latest) {
    return {
      latest_score: null,
      pillar_breakdown: null,
      weakest_pillar: null,
      strongest_pillar: null,
      last_taken_at: null,
      needs_reassessment: false,
    };
  }
  const scores = (latest.scores ?? {}) as Record<string, number>;
  const entries = Object.entries(scores);
  let weakest: string | null = null;
  let strongest: string | null = null;
  if (entries.length) {
    weakest = entries.reduce((a, b) => (a[1] <= b[1] ? a : b))[0];
    strongest = entries.reduce((a, b) => (a[1] >= b[1] ? a : b))[0];
  }
  const last = latest.evaluated_at as string | null;
  const stale = last ? Date.now() - new Date(last).getTime() > SIXTY_DAYS_MS : false;
  return {
    latest_score: latest.overall_score ?? null,
    pillar_breakdown: entries.length ? scores : null,
    weakest_pillar: weakest,
    strongest_pillar: strongest,
    last_taken_at: last,
    needs_reassessment: stale,
  };
}

function summarizeTraining(programs: any[]): AthleteTrainingSummary {
  const active = programs
    .filter((p) => !p.completed_at)
    .map((p) => ({
      key: p.courses?.slug ?? p.course_id,
      name: p.courses?.title ?? "Your program",
      progress_pct: Number(p.progress_pct ?? 0),
      href: p.courses?.slug ? `/courses/${p.courses.slug}` : "/my-programs",
    }));
  const completed = programs.filter((p) => p.completed_at).map((p) => p.courses?.title ?? "Program");
  return {
    active_programs: active,
    completed_programs: completed,
    streak_days: 0, // wired in Phase C (Progress OS)
  };
}

function summarizeRecruiting(rec: any | null): AthleteRecruitingSummary {
  if (!rec) {
    return {
      has_profile: false,
      readiness_score: null,
      profile_completeness: 0,
      commitment_status: null,
      next_checklist_item: null,
    };
  }
  // Lightweight completeness: count filled fields out of 6.
  const fields = [rec.gpa, rec.sat_score || rec.act_score, rec.ncaa_eligibility_center, rec.highlight_video_url, rec.division_target?.length, rec.commitment_status];
  const filled = fields.filter(Boolean).length;
  const completeness = Math.round((filled / fields.length) * 100);
  // First missing field becomes the checklist item.
  let next: string | null = null;
  if (!rec.highlight_video_url) next = "Add your highlight video";
  else if (!rec.gpa) next = "Add your GPA";
  else if (!(rec.sat_score || rec.act_score)) next = "Add your SAT or ACT score";
  else if (!rec.ncaa_eligibility_center) next = "Register with the NCAA Eligibility Center";
  else if (!rec.division_target?.length) next = "Set your division target";
  return {
    has_profile: true,
    readiness_score: completeness, // proxy until a dedicated scorer ships
    profile_completeness: completeness,
    commitment_status: rec.commitment_status ?? null,
    next_checklist_item: next,
  };
}

export function useAthleteState(): AthleteState {
  const { user, isLoading: authLoading } = useAuth();

  const composed = useQuery({
    queryKey: ["athlete-state", user?.id],
    enabled: !!user?.id,
    staleTime: 60_000,
    queryFn: () => fetchComposed(user!.id),
  });

  return useMemo<AthleteState>(() => {
    const empty: AthleteState = {
      user_id: user?.id ?? "",
      role: "athlete",
      sport: "baseball",
      age: null,
      graduation_year: null,
      stage: "unassessed",
      evaluation: summarizeEvaluation(null),
      training: summarizeTraining([]),
      recruiting: summarizeRecruiting(null),
      loading: authLoading || composed.isLoading,
    };
    if (!composed.data || !user) return empty;

    const { profile, roleRow, latestEval, recruiting, programs } = composed.data;
    const role: UserRole = (roleRow?.role as UserRole) ?? "athlete";
    const evaluation = summarizeEvaluation(latestEval);
    const training = summarizeTraining(programs);
    const recruitingSummary = summarizeRecruiting(recruiting);
    const stage = deriveStage({
      hasEvaluation: !!evaluation.latest_score,
      activeProgramProgressPct: training.active_programs[0]?.progress_pct ?? null,
      completedPrograms: training.completed_programs.length,
      hasRecruitingProfile: recruitingSummary.has_profile,
      commitmentStatus: recruitingSummary.commitment_status,
    });

    const sport = (profile?.sport_type as AthleteState["sport"]) ?? "baseball";
    return {
      user_id: user.id,
      role,
      sport,
      age: computeAge(profile),
      graduation_year: profile?.graduation_year ?? null,
      stage,
      evaluation,
      training,
      recruiting: recruitingSummary,
      loading: false,
    };
  }, [composed.data, user, authLoading, composed.isLoading]);
}
