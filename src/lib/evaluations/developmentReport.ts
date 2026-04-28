import jsPDF from "jspdf";
import { format } from "date-fns";
import { EvalTemplate, computeOverall, rubricTier } from "./templates";
import type { EvaluationRow } from "@/hooks/usePlayerEvaluations";

const PAGE_W = 210;
const MARGIN = 18;

interface MetricDelta {
  label: string;
  pre: number | null;
  post: number | null;
  unit?: string;
  better?: "higher" | "lower";
}

export interface ReportInput {
  athleteName: string;
  programLabel: string;            // "Spring 2026 Youth Pitching Lab"
  ageLabel?: string;               // "Age 11 · 5-Week Program · Apr 2026"
  template: EvalTemplate;
  evaluations: EvaluationRow[];    // all in program range
  metrics: MetricDelta[];          // Velocity, strike rate, etc.
  coachName?: string;
  coachNotes?: string;
  goals?: string[];
  shareUrl?: string;
}

function safeName(name: string) {
  return (name || "Athlete").split(" ").pop() || "Athlete";
}

function header(doc: jsPDF) {
  doc.setFillColor(15, 15, 17);
  doc.rect(0, 0, PAGE_W, 32, "F");
  doc.setTextColor(212, 175, 55); // gold
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("VAULT OS", MARGIN, 13);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("DEVELOPMENT REPORT", MARGIN, 24);
  doc.setTextColor(0, 0, 0);
}

function sectionLabel(doc: jsPDF, y: number, text: string) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(text.toUpperCase(), MARGIN, y);
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y + 1.5, PAGE_W - MARGIN, y + 1.5);
  doc.setTextColor(0, 0, 0);
  return y + 7;
}

function metricRow(doc: jsPDF, y: number, m: MetricDelta) {
  if (y > 270) { doc.addPage(); y = 20; }
  const better = m.better ?? "higher";
  const delta =
    m.pre != null && m.post != null ? Math.round((m.post - m.pre) * 10) / 10 : null;
  const arrow = delta == null
    ? "—"
    : (better === "higher" ? (delta > 0 ? "▲" : delta < 0 ? "▼" : "=") : (delta < 0 ? "▲" : delta > 0 ? "▼" : "="));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(m.label.toUpperCase(), MARGIN, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const pre = m.pre != null ? `${m.pre}${m.unit ?? ""}` : "—";
  const post = m.post != null ? `${m.post}${m.unit ?? ""}` : "—";
  const deltaStr = delta == null ? "" : `(${delta > 0 ? "+" : ""}${delta}${m.unit ?? ""})`;
  doc.text(`${pre}  →  ${post}    ${deltaStr} ${arrow}`, MARGIN + 60, y);
  return y + 7;
}

function scoreBar(doc: jsPDF, y: number, label: string, score: number, prev?: number | null) {
  if (y > 270) { doc.addPage(); y = 20; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(label, MARGIN, y);

  doc.setFont("helvetica", "normal");
  doc.text(`${score.toFixed(1)}/10`, MARGIN + 70, y);
  if (prev != null) {
    const d = Math.round((score - prev) * 10) / 10;
    const arrow = d > 0 ? "▲" : d < 0 ? "▼" : "=";
    doc.setTextColor(d >= 0 ? 22 : 180, d >= 0 ? 130 : 50, 50);
    doc.text(`${arrow} ${d > 0 ? "+" : ""}${d}`, MARGIN + 95, y);
    doc.setTextColor(0, 0, 0);
  }

  // bar
  const barX = MARGIN + 115;
  const barW = PAGE_W - MARGIN - barX;
  doc.setFillColor(230, 230, 230);
  doc.rect(barX, y - 3, barW, 4, "F");
  doc.setFillColor(212, 175, 55);
  doc.rect(barX, y - 3, (barW * Math.min(score, 10)) / 10, 4, "F");
  return y + 7;
}

function wrappedText(doc: jsPDF, y: number, text: string, indent = 0): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(text, PAGE_W - MARGIN * 2 - indent);
  for (const line of lines) {
    if (y > 280) { doc.addPage(); y = 20; }
    doc.text(line, MARGIN + indent, y);
    y += 5;
  }
  return y;
}

/** Average per-category scores across evaluations using the template's categories. */
export function averageScores(
  template: EvalTemplate,
  evaluations: EvaluationRow[]
): { averages: Record<string, number>; overall: number | null } {
  const sums: Record<string, { sum: number; n: number }> = {};
  for (const e of evaluations) {
    for (const c of template.categories) {
      const v = e.scores?.[c.key];
      if (typeof v === "number") {
        sums[c.key] ??= { sum: 0, n: 0 };
        sums[c.key].sum += v;
        sums[c.key].n += 1;
      }
    }
  }
  const averages: Record<string, number> = {};
  for (const k of Object.keys(sums)) {
    averages[k] = Math.round((sums[k].sum / sums[k].n) * 10) / 10;
  }
  const overall = computeOverall(template, averages);
  return { averages, overall };
}

export function generateDevelopmentReportPDF(input: ReportInput): {
  doc: jsPDF;
  fileName: string;
  payload: Record<string, unknown>;
} {
  const doc = new jsPDF();
  header(doc);

  let y = 42;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(input.athleteName.toUpperCase(), MARGIN, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(input.programLabel, MARGIN, y);
  y += 4.5;
  if (input.ageLabel) {
    doc.text(input.ageLabel, MARGIN, y);
    y += 4.5;
  }
  doc.setTextColor(0);
  y += 3;

  // Performance metrics
  if (input.metrics.length) {
    y = sectionLabel(doc, y, "Performance Metrics");
    for (const m of input.metrics) y = metricRow(doc, y, m);
    y += 3;
  }

  // Coach evaluation
  const { averages, overall } = averageScores(input.template, input.evaluations);
  // First-evaluation baseline for delta arrows
  const baseline: Record<string, number | null> = {};
  if (input.evaluations.length > 1) {
    const earliest = [...input.evaluations].sort(
      (a, b) => +new Date(a.evaluated_at) - +new Date(b.evaluated_at),
    )[0];
    for (const c of input.template.categories) {
      const v = earliest.scores?.[c.key];
      baseline[c.key] = typeof v === "number" ? v : null;
    }
  }

  y = sectionLabel(doc, y, "Coach Evaluation");
  for (const c of input.template.categories) {
    const avg = averages[c.key];
    if (avg == null) continue;
    y = scoreBar(doc, y, c.label, avg, baseline[c.key] ?? null);
  }
  if (overall != null) {
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`OVERALL SCORE   ${overall.toFixed(1)} / 10`, MARGIN, y);
    const tier = rubricTier(overall);
    y += 5;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(110);
    doc.text(`${tier.tier} — ${tier.description}`, MARGIN, y);
    doc.setTextColor(0);
    y += 6;
  }

  // Coach notes
  if (input.coachNotes?.trim()) {
    y += 2;
    y = sectionLabel(doc, y, "Coach Notes");
    y = wrappedText(doc, y, `"${input.coachNotes.trim()}"`);
    if (input.coachName) {
      y += 2;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text(`— ${input.coachName}`, MARGIN, y);
      y += 6;
    }
  }

  // Goals
  if (input.goals?.length) {
    y = sectionLabel(doc, y, "Goals for Next Session");
    for (const g of input.goals) {
      y = wrappedText(doc, y, `▸ ${g}`, 2);
    }
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(150);
  const dateStr = format(new Date(), "MMMM d, yyyy");
  doc.text(`Vault OS  •  ${dateStr}  •  Confidential`, PAGE_W / 2, 290, { align: "center" });
  if (input.shareUrl) {
    doc.text(input.shareUrl, PAGE_W / 2, 286, { align: "center" });
  }

  const fileName = `Vault_${safeName(input.athleteName)}_DevelopmentReport_${format(new Date(), "yyyy-MM-dd")}.pdf`;

  const payload = {
    program_label: input.programLabel,
    age_label: input.ageLabel,
    template_key: input.template.key,
    metrics: input.metrics,
    averaged_scores: averages,
    overall_score: overall,
    evaluation_ids: input.evaluations.map((e) => e.id),
    goals: input.goals ?? [],
    coach_notes: input.coachNotes ?? null,
    coach_name: input.coachName ?? null,
    generated_at: new Date().toISOString(),
  };

  return { doc, fileName, payload };
}
