// VAULT OS — Pathway Engine types.
// One canonical view of an athlete (or coach/org user). Composed from existing
// tables; not stored in its own table. Every page can read this and ask the
// engine "what should this user do next?".

import type { BucketKey } from "@/lib/ia";

export type AthleteStage =
  | "unassessed"     // no evaluation yet
  | "baseline"      // first eval done, no program started
  | "developing"    // active program, < 50% complete
  | "advanced"      // active program ≥ 50% OR multiple completed
  | "recruiting"    // 14U+ with recruiting profile started
  | "committed";    // commitment_status = committed

export type UserRole = "athlete" | "parent" | "coach" | "owner" | "admin";

export interface AthleteEvaluationSummary {
  latest_score: number | null;
  pillar_breakdown: Record<string, number> | null; // pillar key -> 0-100
  weakest_pillar: string | null;
  strongest_pillar: string | null;
  last_taken_at: string | null;
  needs_reassessment: boolean; // true if last eval > 60 days old
}

export interface AthleteTrainingSummary {
  active_programs: Array<{ key: string; name: string; progress_pct: number; href: string }>;
  completed_programs: string[];
  streak_days: number;
}

export interface AthleteRecruitingSummary {
  has_profile: boolean;
  readiness_score: number | null; // 0-100
  profile_completeness: number;   // 0-100
  commitment_status: string | null;
  next_checklist_item: string | null;
}

export interface AthleteState {
  user_id: string;
  role: UserRole;
  sport: "baseball" | "softball" | "both";
  age: number | null;
  graduation_year: number | null;
  stage: AthleteStage;
  evaluation: AthleteEvaluationSummary;
  training: AthleteTrainingSummary;
  recruiting: AthleteRecruitingSummary;
  loading: boolean;
}

// What the Pathway Engine returns. Consumed by Your Path, Eddie, dashboards,
// post-purchase screens, and per-page next-action strips.
export interface Recommendation {
  id: string;
  bucket: BucketKey;
  kind:
    | "evaluate"
    | "resume_program"
    | "start_program"
    | "purchase_bundle"
    | "recruiting_audit"
    | "recruiting_checklist"
    | "book_lesson"
    | "attend_event"
    | "coach_certification"
    | "coach_marketplace"
    | "org_command_center"
    | "reassess";
  label: string;       // CTA label, e.g. "Continue Velocity System — Week 3"
  href: string;
  reason: string;      // one-liner shown under the CTA explaining "why this"
  priority: number;    // higher = more important; engine ranks by this
  meta?: Record<string, unknown>;
}
