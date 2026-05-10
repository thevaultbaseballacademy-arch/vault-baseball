// VAULT OS — Pathway Engine.
// Pure function: given an AthleteState, return a ranked list of next actions.
// No side effects, no I/O. Easy to unit test, runs client-side.

import type { AthleteState, Recommendation, UserRole } from "./types";

export function computeNextActions(state: AthleteState): Recommendation[] {
  const recs: Recommendation[] = [];

  // ---- Coach-specific path ------------------------------------------------
  if (state.role === "coach") {
    recs.push({
      id: "coach-cert",
      bucket: "scale",
      kind: "coach_certification",
      label: "Continue your Coach Certification",
      href: "/products/certified-coach",
      reason: "Earn the VAULT-Verified credential and unlock the marketplace.",
      priority: 90,
    });
    recs.push({
      id: "coach-marketplace",
      bucket: "scale",
      kind: "coach_marketplace",
      label: "Set up your marketplace listing",
      href: "/coach-dashboard",
      reason: "Start receiving athlete inquiries through the Coach Network.",
      priority: 70,
    });
    return rank(recs);
  }

  // ---- Owner / org-admin path ---------------------------------------------
  if (state.role === "owner" || state.role === "admin") {
    recs.push({
      id: "org-command",
      bucket: "scale",
      kind: "org_command_center",
      label: "Open the Organization Command Center",
      href: "/owner",
      reason: "Track athlete development, coach activity and license usage.",
      priority: 100,
    });
    return rank(recs);
  }

  // ---- Athlete / parent path ----------------------------------------------

  // 1. No evaluation → take the free evaluation. This is the entry point.
  if (state.stage === "unassessed") {
    recs.push({
      id: "evaluate",
      bucket: "assess",
      kind: "evaluate",
      label: "Take your Free Evaluation",
      href: "/evaluate",
      reason: "Your AI-powered development score in under 2 minutes.",
      priority: 100,
    });
    return rank(recs);
  }

  // 2. Reassessment overdue? Highest priority retention nudge.
  if (state.evaluation.needs_reassessment) {
    recs.push({
      id: "reassess",
      bucket: "assess",
      kind: "reassess",
      label: "Re-take your evaluation",
      href: "/evaluate",
      reason: "It's been 60+ days — measure your progress vs your baseline.",
      priority: 95,
    });
  }

  // 3. Active program → resume it.
  const active = state.training.active_programs[0];
  if (active) {
    recs.push({
      id: `resume-${active.key}`,
      bucket: "train",
      kind: "resume_program",
      label: `Continue ${active.name}`,
      href: active.href,
      reason: `You're ${Math.round(active.progress_pct)}% through. Keep the streak going.`,
      priority: 90,
    });
    // If they're well into the program, suggest the next bundle.
    if (active.progress_pct >= 70) {
      recs.push({
        id: "bundle-upgrade",
        bucket: "train",
        kind: "purchase_bundle",
        label: "See bundle options for your next stage",
        href: "/products/bundles",
        reason: "You're nearly done — line up what comes next.",
        priority: 65,
      });
    }
  } else if (state.stage === "baseline") {
    // 4. Eval done but no program → match weakest pillar.
    const pillar = state.evaluation.weakest_pillar;
    recs.push({
      id: "start-program",
      bucket: "train",
      kind: "start_program",
      label: pillar ? `Start a program for your ${pillar} pillar` : "Start your first program",
      href: "/products",
      reason: pillar
        ? `Your evaluation flagged ${pillar} as the highest-leverage area to improve.`
        : "Build on your baseline with a pillar-based program.",
      priority: 88,
    });
  }

  // 5. Recruiting age check (14U+ and grad year set) → audit + checklist.
  const age = state.age ?? 0;
  if (age >= 14 || (state.graduation_year && state.graduation_year - new Date().getFullYear() <= 4)) {
    if (!state.recruiting.has_profile) {
      recs.push({
        id: "recruiting-audit",
        bucket: "get_seen",
        kind: "recruiting_audit",
        label: "Start your Recruiting Audit",
        href: "/products/recruitment",
        reason: "Get a 0–100 college-readiness score and OFP review.",
        priority: 80,
      });
    } else if (state.recruiting.next_checklist_item) {
      recs.push({
        id: "recruiting-checklist",
        bucket: "get_seen",
        kind: "recruiting_checklist",
        label: state.recruiting.next_checklist_item,
        href: "/recruiting",
        reason: `Your profile is ${state.recruiting.profile_completeness}% complete.`,
        priority: 75,
      });
    }
  }

  // 6. Recruiting stage with no event attendance → showcase / tryout.
  if (state.stage === "recruiting") {
    recs.push({
      id: "attend-event",
      bucket: "get_seen",
      kind: "attend_event",
      label: "Find a tryout or showcase",
      href: "/tryouts",
      reason: "Get in front of evaluators and lock in measurables.",
      priority: 60,
    });
  }

  // 7. Universal soft fallback — book a lesson with a Vault coach.
  recs.push({
    id: "book-lesson",
    bucket: "train",
    kind: "book_lesson",
    label: "Book a 1-on-1 with a Vault coach",
    href: "/find-coach",
    reason: "Personalized coaching accelerates every pillar.",
    priority: 40,
  });

  return rank(recs);
}

function rank(recs: Recommendation[]): Recommendation[] {
  return [...recs].sort((a, b) => b.priority - a.priority);
}

// Convenience: the single most important next action.
export function topNextAction(state: AthleteState): Recommendation | null {
  const recs = computeNextActions(state);
  return recs[0] ?? null;
}

// Stage helper used by useAthleteState when composing.
export function deriveStage(input: {
  hasEvaluation: boolean;
  activeProgramProgressPct: number | null;
  completedPrograms: number;
  hasRecruitingProfile: boolean;
  commitmentStatus: string | null;
}): AthleteState["stage"] {
  if (input.commitmentStatus === "committed") return "committed";
  if (input.hasRecruitingProfile) return "recruiting";
  if ((input.activeProgramProgressPct ?? 0) >= 50 || input.completedPrograms >= 1) return "advanced";
  if ((input.activeProgramProgressPct ?? 0) > 0) return "developing";
  if (input.hasEvaluation) return "baseline";
  return "unassessed";
}

// Friendly label for the stage chip shown in Your Path / Eddie.
export function stageLabel(stage: AthleteState["stage"]): string {
  switch (stage) {
    case "unassessed": return "Not yet assessed";
    case "baseline":   return "Baseline";
    case "developing": return "Developing";
    case "advanced":   return "Advanced";
    case "recruiting": return "Recruiting";
    case "committed":  return "Committed";
  }
}

// Consumers (Eddie, dashboards) can ask: "is this user a buyer-ready athlete?"
export function isAthleteRole(role: UserRole): boolean {
  return role === "athlete" || role === "parent";
}
