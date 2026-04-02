import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, TrendingUp, Target, Zap, Award, ChevronDown, ChevronUp, Info } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// --- Data Types & Constants ---

type ToolName = "hit" | "rawPower" | "gamePower" | "run" | "arm" | "field" | "baseballIQ";

interface ToolConfig {
  key: ToolName;
  label: string;
  description: string;
  icon: typeof TrendingUp;
}

const TOOLS: ToolConfig[] = [
  { key: "hit", label: "Hit", description: "Contact ability, bat-to-ball skills, pitch recognition", icon: Target },
  { key: "rawPower", label: "Raw Power", description: "Exit velocity, home run potential, max-effort distance", icon: Zap },
  { key: "gamePower", label: "Game Power", description: "In-game power production, extra-base hit frequency", icon: TrendingUp },
  { key: "run", label: "Run", description: "Speed, 60-yard dash time, base-stealing ability", icon: Zap },
  { key: "arm", label: "Arm", description: "Throwing velocity, accuracy, carry and release", icon: Target },
  { key: "field", label: "Field", description: "Defensive range, hands, footwork, positioning", icon: Shield },
  { key: "baseballIQ", label: "Baseball IQ", description: "Game awareness, instincts, situational decision-making", icon: Award },
];

const GRADE_LABELS: Record<number, string> = {
  20: "Poor", 30: "Well Below Average", 40: "Below Average", 45: "Below Average+",
  50: "Average", 55: "Above Average", 60: "Plus", 65: "Plus+",
  70: "Well Above Average", 80: "Elite",
};

const GRADE_STEPS = [20, 30, 40, 45, 50, 55, 60, 65, 70, 80];

function getGradeLabel(grade: number): string {
  let closest = 20;
  for (const step of GRADE_STEPS) {
    if (Math.abs(grade - step) < Math.abs(grade - closest)) closest = step;
  }
  return GRADE_LABELS[closest] || "Unknown";
}

function getGradeColor(grade: number): string {
  if (grade >= 70) return "hsl(44 100% 59%)"; // gold/elite
  if (grade >= 60) return "hsl(150 75% 53%)"; // green/plus
  if (grade >= 50) return "hsl(220 92% 52%)"; // blue/average
  if (grade >= 40) return "hsl(30 90% 55%)"; // orange
  return "hsl(0 70% 54%)"; // red
}

// Recruiting meaning per grade tier
function getRecruitingMeaning(grade: number): string {
  if (grade >= 70) return "Pro-caliber tool. D1 scholarship-level talent. Coaches will actively recruit based on this alone.";
  if (grade >= 60) return "Above-average D1 tool. This grade earns you looks from Power 5 and top-tier programs.";
  if (grade >= 55) return "Solid D1-level tool. Competitive at mid-major programs and attractive to top D2 schools.";
  if (grade >= 50) return "Average college-level tool. Meets baseline D1 standards; strong for D2/D3 programs.";
  if (grade >= 45) return "Developing tool. Needs improvement for D1 consideration but serviceable at D2/D3/JUCO level.";
  if (grade >= 40) return "Below college average. Targeted development required. Currently fits JUCO/D3 level.";
  if (grade >= 30) return "Significant development needed. Focus training here to become recruitable.";
  return "Major weakness. Prioritize intensive skill work in this area immediately.";
}

function getDevelopmentRec(tool: ToolName, grade: number): string | null {
  if (grade >= 50) return null;
  const recs: Record<ToolName, string> = {
    hit: "Focus on tee work, soft toss, and pitch recognition drills. Track bat-to-ball consistency weekly. Consider vision training.",
    rawPower: "Prioritize strength training (deadlifts, squats, rotational power). Track exit velocity bi-weekly. Add med ball work.",
    gamePower: "Work on situational hitting and driving the ball with intent in BP. Review game film for approach adjustments.",
    run: "Sprint mechanics coaching, agility ladders, and 60-yard dash timing sessions. Add plyometrics 3x/week.",
    arm: "Long toss program, band work, and mechanical video review. Track throwing velocity monthly. Prioritize arm care.",
    field: "Daily ground ball/fly ball reps, footwork drills, and position-specific work. Film fielding sessions for review.",
    baseballIQ: "Study game film, practice situational quizzes, and work with coaches on reads and pre-pitch planning.",
  };
  return recs[tool];
}

// --- Position Standards ---

type Position = "SS" | "2B" | "3B" | "1B" | "OF" | "C" | "P" | "DH";

const POSITION_OPTIONS: { value: Position; label: string }[] = [
  { value: "SS", label: "Shortstop" },
  { value: "2B", label: "Second Base" },
  { value: "3B", label: "Third Base" },
  { value: "1B", label: "First Base" },
  { value: "OF", label: "Outfield" },
  { value: "C", label: "Catcher" },
  { value: "P", label: "Pitcher" },
  { value: "DH", label: "DH / Utility" },
];

// What grades a position typically NEEDS at the D1 level (minimum expectations)
const POSITION_STANDARDS: Record<Position, Record<ToolName, number>> = {
  SS: { hit: 50, rawPower: 45, gamePower: 45, run: 55, arm: 55, field: 60, baseballIQ: 55 },
  "2B": { hit: 55, rawPower: 40, gamePower: 40, run: 50, arm: 45, field: 55, baseballIQ: 55 },
  "3B": { hit: 50, rawPower: 55, gamePower: 50, run: 40, arm: 55, field: 50, baseballIQ: 50 },
  "1B": { hit: 55, rawPower: 60, gamePower: 55, run: 35, arm: 40, field: 45, baseballIQ: 45 },
  OF: { hit: 50, rawPower: 50, gamePower: 50, run: 55, arm: 50, field: 50, baseballIQ: 50 },
  C: { hit: 45, rawPower: 45, gamePower: 45, run: 35, arm: 60, field: 55, baseballIQ: 60 },
  P: { hit: 30, rawPower: 30, gamePower: 30, run: 40, arm: 65, field: 45, baseballIQ: 55 },
  DH: { hit: 60, rawPower: 60, gamePower: 60, run: 30, arm: 30, field: 30, baseballIQ: 45 },
};

// --- Level Thresholds ---

interface LevelThreshold { label: string; minOFP: number; color: string }

const LEVELS: LevelThreshold[] = [
  { label: "PRO", minOFP: 65, color: "hsl(44 100% 59%)" },
  { label: "D1", minOFP: 55, color: "hsl(150 75% 53%)" },
  { label: "D2", minOFP: 48, color: "hsl(220 92% 52%)" },
  { label: "D3", minOFP: 42, color: "hsl(220 60% 60%)" },
  { label: "JUCO", minOFP: 35, color: "hsl(30 80% 55%)" },
];

function getScholarshipProbability(ofp: number): number {
  if (ofp >= 70) return 95;
  if (ofp >= 65) return 80;
  if (ofp >= 60) return 60;
  if (ofp >= 55) return 40;
  if (ofp >= 50) return 20;
  if (ofp >= 45) return 8;
  return 2;
}

// --- Components ---

function GradeSlider({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex items-center gap-3 w-full">
      <input
        type="range"
        min={20}
        max={80}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-2 appearance-none rounded-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${getGradeColor(value)} 0%, ${getGradeColor(value)} ${((value - 20) / 60) * 100}%, hsl(0 0% 18%) ${((value - 20) / 60) * 100}%, hsl(0 0% 18%) 100%)`,
        }}
        aria-label={`${label} grade`}
      />
      <div
        className="w-12 h-10 flex items-center justify-center text-lg font-display font-bold border border-border"
        style={{ color: getGradeColor(value), background: "hsl(0 0% 9%)" }}
      >
        {value}
      </div>
    </div>
  );
}

function ToolCard({ config, grade, onChange, position }: { config: ToolConfig; grade: number; onChange: (v: number) => void; position: Position }) {
  const [expanded, setExpanded] = useState(false);
  const label = getGradeLabel(grade);
  const meaning = getRecruitingMeaning(grade);
  const devRec = getDevelopmentRec(config.key, grade);
  const posStandard = POSITION_STANDARDS[position][config.key];
  const meetsStandard = grade >= posStandard;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      className="border border-border bg-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" style={{ color: "hsl(44 100% 59%)" }} />
            <h3 className="text-sm font-display tracking-wider text-foreground">{config.label.toUpperCase()}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-display tracking-wider px-2 py-0.5"
              style={{
                color: meetsStandard ? "hsl(150 75% 53%)" : "hsl(0 70% 54%)",
                border: `1px solid ${meetsStandard ? "hsl(150 75% 40%)" : "hsl(0 70% 40%)"}`,
              }}
            >
              {meetsStandard ? "MEETS D1" : `NEEDS ${posStandard}`}
            </span>
            <span className="text-xs text-muted-foreground font-display">{label}</span>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">{config.description}</p>

        <GradeSlider value={grade} onChange={onChange} label={config.label} />

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted overflow-hidden">
          <motion.div
            className="h-full"
            style={{ backgroundColor: getGradeColor(grade) }}
            initial={{ width: 0 }}
            animate={{ width: `${((grade - 20) / 60) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[10px] font-display tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "HIDE DETAILS" : "RECRUITING IMPACT"}
        </button>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-2 pt-2 border-t border-border"
          >
            <p className="text-xs text-muted-foreground">{meaning}</p>
            {devRec && (
              <div className="bg-muted/50 border border-border p-3 space-y-1">
                <p className="text-[10px] font-display tracking-wider" style={{ color: "hsl(44 100% 59%)" }}>
                  ⚡ DEVELOPMENT RECOMMENDATION
                </p>
                <p className="text-xs text-muted-foreground">{devRec}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function LevelComparison({ ofp }: { ofp: number }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-display tracking-[0.2em] text-muted-foreground">LEVEL COMPARISON</h3>
      <div className="space-y-2">
        {LEVELS.map((level) => {
          const isAt = ofp >= level.minOFP;
          const barWidth = Math.min(100, (level.minOFP / 80) * 100);
          return (
            <div key={level.label} className="flex items-center gap-3">
              <span
                className="w-12 text-[10px] font-display tracking-wider text-right"
                style={{ color: isAt ? level.color : "hsl(0 0% 35%)" }}
              >
                {level.label}
              </span>
              <div className="flex-1 h-3 bg-muted relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: isAt ? level.color : "hsl(0 0% 20%)",
                    opacity: isAt ? 1 : 0.3,
                  }}
                />
                {/* OFP marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5"
                  style={{
                    left: `${Math.min(100, (ofp / 80) * 100)}%`,
                    backgroundColor: "hsl(44 100% 59%)",
                  }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground w-6">{level.minOFP}+</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <div className="w-3 h-0.5" style={{ backgroundColor: "hsl(44 100% 59%)" }} />
        <span>Your OFP: {ofp.toFixed(1)}</span>
      </div>
    </div>
  );
}

// --- Main Page ---

const ProspectGrader = () => {
  const [position, setPosition] = useState<Position>("SS");
  const [grades, setGrades] = useState<Record<ToolName, number>>({
    hit: 50, rawPower: 50, gamePower: 50, run: 50, arm: 50, field: 50, baseballIQ: 50,
  });

  const updateGrade = (tool: ToolName, value: number) => {
    setGrades((prev) => ({ ...prev, [tool]: value }));
  };

  // OFP: weighted average (some tools matter more)
  const ofp = useMemo(() => {
    const weights: Record<ToolName, number> = {
      hit: 1.2, rawPower: 1.0, gamePower: 1.1, run: 0.9, arm: 0.9, field: 0.95, baseballIQ: 0.95,
    };
    let weightedSum = 0;
    let totalWeight = 0;
    for (const tool of TOOLS) {
      const w = weights[tool.key];
      weightedSum += grades[tool.key] * w;
      totalWeight += w;
    }
    return weightedSum / totalWeight;
  }, [grades]);

  const scholarshipProb = getScholarshipProbability(ofp);

  const currentLevel = useMemo(() => {
    for (const level of LEVELS) {
      if (ofp >= level.minOFP) return level;
    }
    return { label: "DEVELOPING", minOFP: 0, color: "hsl(0 0% 45%)" };
  }, [ofp]);

  const toolsBelowStandard = useMemo(() => {
    return TOOLS.filter((t) => grades[t.key] < POSITION_STANDARDS[position][t.key]);
  }, [grades, position]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">

          {/* Header */}
          <div className="text-center border-b border-border pb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="w-4 h-4" style={{ color: "hsl(44 100% 59%)" }} />
              <span className="text-[10px] font-display tracking-[0.3em] text-muted-foreground">
                VAULT™ OS · PROSPECT GRADER
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display text-foreground">
              20-80 SCOUTING SCALE
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
              Grade each tool on the MLB 20-80 scouting scale. Get your Overall Future Potential (OFP),
              D1 scholarship probability, and position-specific development recommendations.
            </p>
          </div>

          {/* Position Selector */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-[10px] font-display tracking-[0.2em] text-muted-foreground">POSITION:</span>
            {POSITION_OPTIONS.map((pos) => (
              <button
                key={pos.value}
                onClick={() => setPosition(pos.value)}
                className="px-3 py-1.5 text-xs font-display tracking-wider border transition-all"
                style={{
                  borderColor: position === pos.value ? "hsl(44 100% 59%)" : "hsl(var(--border))",
                  color: position === pos.value ? "hsl(44 100% 59%)" : "hsl(var(--muted-foreground))",
                  backgroundColor: position === pos.value ? "hsl(44 100% 59% / 0.08)" : "transparent",
                }}
              >
                {pos.value}
              </button>
            ))}
          </div>

          {/* OFP & Scholarship Hero */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-border bg-card p-6 text-center space-y-2 md:col-span-1">
              <span className="text-[10px] font-display tracking-[0.2em] text-muted-foreground block">
                OVERALL FUTURE POTENTIAL
              </span>
              <div
                className="text-5xl font-display font-bold"
                style={{ color: getGradeColor(ofp) }}
              >
                {ofp.toFixed(0)}
              </div>
              <span className="text-xs font-display tracking-wider" style={{ color: getGradeColor(ofp) }}>
                {getGradeLabel(Math.round(ofp / 5) * 5)}
              </span>
              <div className="pt-2">
                <span
                  className="inline-block px-3 py-1 text-[10px] font-display tracking-wider border"
                  style={{ borderColor: currentLevel.color, color: currentLevel.color }}
                >
                  {currentLevel.label} LEVEL
                </span>
              </div>
            </div>

            <div className="border border-border bg-card p-6 text-center space-y-2 md:col-span-1">
              <span className="text-[10px] font-display tracking-[0.2em] text-muted-foreground block">
                D1 SCHOLARSHIP PROBABILITY
              </span>
              <div className="text-5xl font-display font-bold" style={{ color: "hsl(44 100% 59%)" }}>
                {scholarshipProb}%
              </div>
              <div className="w-full h-2 bg-muted overflow-hidden mt-2">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: "hsl(44 100% 59%)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${scholarshipProb}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Based on OFP across all tools</p>
            </div>

            <div className="border border-border bg-card p-6 space-y-2 md:col-span-1">
              <span className="text-[10px] font-display tracking-[0.2em] text-muted-foreground block">
                POSITION FIT: {position}
              </span>
              <div className="text-3xl font-display font-bold text-foreground">
                {toolsBelowStandard.length === 0 ? (
                  <span style={{ color: "hsl(150 75% 53%)" }}>✓ ALL MET</span>
                ) : (
                  <span style={{ color: "hsl(0 70% 54%)" }}>
                    {toolsBelowStandard.length} GAP{toolsBelowStandard.length > 1 ? "S" : ""}
                  </span>
                )}
              </div>
              {toolsBelowStandard.length > 0 && (
                <div className="text-[10px] text-muted-foreground space-y-0.5">
                  {toolsBelowStandard.map((t) => (
                    <div key={t.key} className="flex justify-between">
                      <span>{t.label}</span>
                      <span style={{ color: "hsl(0 70% 54%)" }}>
                        {grades[t.key]} → need {POSITION_STANDARDS[position][t.key]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tool-by-Tool Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-display tracking-[0.2em] text-muted-foreground">
                TOOL-BY-TOOL BREAKDOWN
              </h2>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Info className="w-3 h-3" />
                <span>Slide to adjust grades</span>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {TOOLS.map((tool) => (
                <ToolCard
                  key={tool.key}
                  config={tool}
                  grade={grades[tool.key]}
                  onChange={(v) => updateGrade(tool.key, v)}
                  position={position}
                />
              ))}
            </div>
          </div>

          {/* Level Comparison */}
          <div className="border border-border bg-card p-6">
            <LevelComparison ofp={ofp} />
          </div>

          {/* Grade Scale Reference */}
          <div className="border border-border bg-card p-6 space-y-3">
            <h3 className="text-xs font-display tracking-[0.2em] text-muted-foreground">20-80 SCALE REFERENCE</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {GRADE_STEPS.map((g) => (
                <div key={g} className="flex items-center gap-2 text-xs">
                  <span className="font-display font-bold w-6" style={{ color: getGradeColor(g) }}>{g}</span>
                  <span className="text-muted-foreground">{GRADE_LABELS[g]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer disclaimer */}
          <div className="text-center border-t border-border pt-6">
            <p className="text-[10px] text-muted-foreground">
              Grades are self-reported estimates. For verified scouting grades, book an evaluation with a VAULT™ certified coach.
              <br />The 20-80 scale is the standard MLB scouting grading system used by professional scouts and college recruiters.
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default ProspectGrader;
