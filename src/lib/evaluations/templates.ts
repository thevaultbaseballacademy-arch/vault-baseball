/**
 * Vault OS — Player Evaluation Templates (MVP)
 * Section 6 of the spec. Templates are static defaults in v1.
 */

export type TemplateKey = "pitching_9_12" | "pitching_13_17";
export type AgeGroup = "9-12" | "13-17";

export interface EvalCategory {
  key: string;
  label: string;
  weight: number;          // 0–1, sums to 1 within a template
  description: string;
}

export interface EvalTemplate {
  key: TemplateKey;
  label: string;
  ageGroup: AgeGroup;
  minAge: number;
  maxAge: number;
  categories: EvalCategory[];
}

export const TEMPLATES: Record<TemplateKey, EvalTemplate> = {
  pitching_9_12: {
    key: "pitching_9_12",
    label: "Foundations · Ages 9–12",
    ageGroup: "9-12",
    minAge: 9,
    maxAge: 12,
    categories: [
      { key: "mechanics", label: "Mechanics", weight: 0.30,
        description: "Arm slot, balance, follow-through, repeatable delivery" },
      { key: "command", label: "Command", weight: 0.25,
        description: "Strike-throwing, target zones, competitive pitches" },
      { key: "athleticism", label: "Athleticism", weight: 0.15,
        description: "Fielding position, agility, body control" },
      { key: "mental_game", label: "Mental Game", weight: 0.15,
        description: "Composure after mistakes, focus, body language" },
      { key: "competitiveness", label: "Competitiveness", weight: 0.15,
        description: "Effort, attack mindset, presence on the mound" },
    ],
  },
  pitching_13_17: {
    key: "pitching_13_17",
    label: "Refinement · Ages 13–17",
    ageGroup: "13-17",
    minAge: 13,
    maxAge: 17,
    categories: [
      { key: "mechanics", label: "Mechanics", weight: 0.25,
        description: "Refined delivery, hip-shoulder separation, repeatability under fatigue" },
      { key: "command", label: "Command", weight: 0.25,
        description: "Locate to all 4 quadrants, command of secondary pitches" },
      { key: "pitch_mix", label: "Pitch Mix", weight: 0.15,
        description: "Variety and quality of secondary pitches" },
      { key: "mental_game", label: "Mental Game", weight: 0.15,
        description: "Sequencing, situational awareness, recovery" },
      { key: "competitiveness", label: "Competitiveness", weight: 0.10,
        description: "Mound presence, attack approach, in-game adjustments" },
      { key: "pickoff_fielding", label: "Pickoff & Fielding", weight: 0.10,
        description: "Holds runners, controls run game, clean fielding" },
    ],
  },
};

export function templateForAge(age: number | null | undefined): EvalTemplate {
  if (age != null && age >= 13) return TEMPLATES.pitching_13_17;
  return TEMPLATES.pitching_9_12;
}

export function templateByKey(key: string): EvalTemplate {
  return (TEMPLATES as Record<string, EvalTemplate>)[key] ?? TEMPLATES.pitching_9_12;
}

/** Section 6.4 — weighted overall (1–10 scale). Returns null if no scores. */
export function computeOverall(
  template: EvalTemplate,
  scores: Record<string, number>
): number | null {
  let total = 0;
  let weightUsed = 0;
  for (const cat of template.categories) {
    const v = scores[cat.key];
    if (typeof v === "number" && !Number.isNaN(v)) {
      total += v * cat.weight;
      weightUsed += cat.weight;
    }
  }
  if (weightUsed === 0) return null;
  // Normalize if some categories not yet scored
  return Math.round((total / weightUsed) * 100) / 100;
}

export function rubricTier(score: number): { tier: string; description: string } {
  if (score >= 9) return { tier: "Elite", description: "Stands out significantly above age-group expectations" };
  if (score >= 7) return { tier: "Advanced", description: "Above peers in age group, in polish phase" };
  if (score >= 5) return { tier: "On Track", description: "Age-appropriate execution, room to grow" };
  if (score >= 3) return { tier: "Developing", description: "Inconsistent execution, fundamentals emerging" };
  return { tier: "Beginner", description: "Major focus area for development" };
}
