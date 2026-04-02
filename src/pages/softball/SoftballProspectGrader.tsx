import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Shield, TrendingUp, Target, Zap, Award, ChevronDown, ChevronUp,
  Info, GraduationCap, Star, AlertTriangle, CircleDot, Eye, Brain
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Types ──────────────────────────────────────────────────────────
type ToolName = "hit" | "rawPower" | "gamePower" | "speed" | "arm" | "defense" | "pitchingVelo" | "spinMovement" | "softballIQ";
type Position = "pitcher" | "catcher" | "infield" | "outfield" | "utility";
type Format = "fastpitch" | "slowpitch";

interface ToolConfig {
  key: ToolName;
  label: string;
  description: string;
  icon: typeof TrendingUp;
  pitcherOnly?: boolean;
}

// ── Constants ──────────────────────────────────────────────────────
const TOOLS: ToolConfig[] = [
  { key: "hit", label: "Hit", description: "Contact ability, bat-to-ball skill, pitch recognition, slap hitting potential", icon: Target },
  { key: "rawPower", label: "Raw Power", description: "Exit velocity, max distance, bat speed potential", icon: Zap },
  { key: "gamePower", label: "Game Power", description: "In-game production, extra-base hits, RBI situations", icon: TrendingUp },
  { key: "speed", label: "Speed", description: "Home-to-first time, 60-yard dash, base-stealing instincts", icon: Zap },
  { key: "arm", label: "Arm Strength", description: "Throwing velocity, accuracy, carry from outfield / pop from catcher", icon: Target },
  { key: "defense", label: "Defense", description: "Range, hands, footwork, positioning, reaction time", icon: Shield },
  { key: "pitchingVelo", label: "Pitching Velocity", description: "Windmill velocity by age group & division standard", icon: CircleDot, pitcherOnly: true },
  { key: "spinMovement", label: "Spin / Movement", description: "Rise ball, drop ball, curve, change-up quality grades", icon: Eye, pitcherOnly: true },
  { key: "softballIQ", label: "Softball IQ", description: "Game awareness, situational play, base-running decisions", icon: Brain },
];

const GRADE_LABELS: Record<number, string> = {
  20: "Poor", 30: "Well Below Avg", 40: "Below Average", 45: "Below Avg+",
  50: "Average", 55: "Above Average", 60: "Plus", 65: "Plus+",
  70: "Well Above Avg", 80: "Elite",
};
const GRADE_STEPS = [20, 30, 40, 45, 50, 55, 60, 65, 70, 80];

const getGradeLabel = (g: number) => {
  let closest = 20;
  for (const s of GRADE_STEPS) if (Math.abs(g - s) < Math.abs(g - closest)) closest = s;
  return GRADE_LABELS[closest] ?? "Unknown";
};

// Purple-gold palette for softball
const PURPLE = "270 60% 55%";  // softball accent
const GOLD = "44 100% 59%";   // vault gold

const getGradeColor = (g: number) => {
  if (g >= 70) return `hsl(${GOLD})`;
  if (g >= 60) return "hsl(150 75% 53%)";
  if (g >= 50) return `hsl(${PURPLE})`;
  if (g >= 40) return "hsl(30 90% 55%)";
  return "hsl(0 70% 54%)";
};

const pct = (v: number) => Math.max(0, Math.min(100, ((v - 20) / 60) * 100));

const POSITION_STANDARDS: Record<Position, Partial<Record<ToolName, number>>> = {
  pitcher: { pitchingVelo: 60, spinMovement: 60, defense: 50, softballIQ: 55, hit: 40 },
  catcher: { arm: 60, defense: 60, softballIQ: 60, hit: 50, speed: 40 },
  infield: { defense: 60, arm: 55, speed: 55, hit: 55, softballIQ: 55 },
  outfield: { speed: 60, arm: 55, defense: 55, hit: 55, rawPower: 50 },
  utility: { hit: 55, defense: 55, speed: 50, arm: 50, softballIQ: 55 },
};

const DIVISION_MINIMUMS: Record<string, number> = {
  "D1 Power 5": 55, "D1 Mid-Major": 50, "D2": 45, "D3 / NAIA": 40, "JUCO": 35,
};

const DIVISION_VELO: Record<string, { min: number; max: number }> = {
  "D1 Power 5": { min: 64, max: 72 },
  "D1 Mid-Major": { min: 60, max: 66 },
  "D2": { min: 56, max: 63 },
  "D3 / NAIA": { min: 52, max: 60 },
  "JUCO": { min: 50, max: 58 },
};

const DIVISION_POP: Record<string, { elite: number; good: number }> = {
  "D1 Power 5": { elite: 1.7, good: 1.85 },
  "D1 Mid-Major": { elite: 1.8, good: 1.95 },
  "D2": { elite: 1.9, good: 2.05 },
  "D3 / NAIA": { elite: 2.0, good: 2.15 },
  "JUCO": { elite: 2.0, good: 2.2 },
};

const DEV_TIPS: Partial<Record<ToolName, string>> = {
  hit: "Focus on tee work, soft toss, and timing drills. Track pitch recognition accuracy.",
  rawPower: "Strengthen lower half & core. Use overload/underload bat training protocols.",
  gamePower: "Work on situational hitting — gap-to-gap approach and driving the ball in count leverage.",
  speed: "Sprint mechanics, resistance running, and agility ladder drills 3x/week.",
  arm: "Long toss progression, band work, and weighted ball protocols (age-appropriate).",
  defense: "100 reps/day minimum: ground balls, fly balls, footwork patterns.",
  pitchingVelo: "Focus on leg drive, hip-to-shoulder separation, and wrist snap. Film & review mechanics.",
  spinMovement: "Dedicate sessions to individual pitch development. Use spin rate feedback if available.",
  softballIQ: "Watch film, study situations, quiz yourself on game scenarios before each practice.",
};

const EXAMPLE_SCHOOLS: Record<string, string[]> = {
  "D1 Power 5": ["Oklahoma", "UCLA", "Alabama", "Florida St."],
  "D1 Mid-Major": ["UCF", "James Madison", "Liberty", "Fresno St."],
  "D2": ["West Florida", "Anderson", "Augustana", "Tampa"],
  "D3 / NAIA": ["Emory", "Tufts", "Ithaca", "Linfield"],
  "JUCO": ["Indian Hills", "Butler CC", "Chipola", "Central Arizona"],
};

// ── Component ──────────────────────────────────────────────────────
const SoftballProspectGrader = () => {
  const [position, setPosition] = useState<Position>("pitcher");
  const [format, setFormat] = useState<Format>("fastpitch");
  const [expandedTool, setExpandedTool] = useState<ToolName | null>(null);
  const [grades, setGrades] = useState<Record<ToolName, number>>(
    Object.fromEntries(TOOLS.map((t) => [t.key, 50])) as Record<ToolName, number>
  );

  // Pitcher-specific
  const [pitchVeloMph, setPitchVeloMph] = useState(58);
  const [qualityPitches, setQualityPitches] = useState(3);
  const [strikePct, setStrikePct] = useState(60);
  const [spinAwareness, setSpinAwareness] = useState(50);

  // Catcher-specific
  const [popTime, setPopTime] = useState(1.9);
  const [blockingGrade, setBlockingGrade] = useState(50);
  const [framingGrade, setFramingGrade] = useState(50);
  const [leadershipGrade, setLeadershipGrade] = useState(50);

  const isPitcher = position === "pitcher";
  const isCatcher = position === "catcher";

  const visibleTools = useMemo(
    () => TOOLS.filter((t) => !t.pitcherOnly || isPitcher),
    [isPitcher]
  );

  // OFP calculation
  const ofp = useMemo(() => {
    const weights: Partial<Record<ToolName, number>> = {
      hit: 1.2, rawPower: 0.9, gamePower: 1.1, speed: 1.0, arm: 0.85,
      defense: 1.0, softballIQ: 0.95,
      ...(isPitcher ? { pitchingVelo: 1.3, spinMovement: 1.2 } : {}),
    };
    let ws = 0, tw = 0;
    visibleTools.forEach((t) => {
      const w = weights[t.key] ?? 1;
      ws += grades[t.key] * w;
      tw += w;
    });
    return Math.round(ws / tw);
  }, [grades, visibleTools, isPitcher]);

  const scholarshipPct = useMemo(() => {
    if (ofp >= 65) return 95;
    if (ofp >= 60) return 78;
    if (ofp >= 55) return 58;
    if (ofp >= 50) return 35;
    if (ofp >= 45) return 15;
    return 5;
  }, [ofp]);

  // Division fit
  const divisionFit = useMemo(() => {
    return Object.entries(DIVISION_MINIMUMS).map(([div, min]) => ({
      division: div,
      fits: ofp >= min,
      schools: EXAMPLE_SCHOOLS[div] ?? [],
      tier: ofp >= min + 10 ? "safety" : ofp >= min ? "target" : "reach",
    }));
  }, [ofp]);

  const posStandards = POSITION_STANDARDS[position] ?? {};

  const tierColor = (tier: string) => {
    if (tier === "safety") return "hsl(150 75% 53%)";
    if (tier === "target") return `hsl(${GOLD})`;
    return "hsl(0 70% 54%)";
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">

          {/* ═══ HEADER ═══ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="w-20 h-20 mx-auto mb-5 flex items-center justify-center border"
              style={{ background: `hsl(${PURPLE} / .12)`, borderColor: `hsl(${PURPLE} / .3)` }}>
              <GraduationCap className="w-10 h-10" style={{ color: `hsl(${PURPLE})` }} />
            </div>
            <h1 className="text-4xl md:text-6xl font-display text-foreground tracking-wide mb-2">
              SOFTBALL PROSPECT GRADER
            </h1>
            <p className="text-xl md:text-2xl font-display" style={{ color: `hsl(${GOLD})` }}>
              20-80 SCOUTING SCALE — FASTPITCH & SLOWPITCH
            </p>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-sm">
              Grade every tool on the professional 20-80 scale adapted for softball. See your OFP, scholarship probability, and where you fit at every division level.
            </p>
          </motion.div>

          {/* ═══ POSITION & FORMAT SELECTORS ═══ */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="grid sm:grid-cols-2 gap-4 mb-8">
            {/* Position */}
            <div className="bg-card border border-border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Position</p>
              <div className="flex flex-wrap gap-2">
                {(["pitcher", "catcher", "infield", "outfield", "utility"] as Position[]).map((p) => (
                  <button key={p} onClick={() => setPosition(p)}
                    className="px-3 py-1.5 text-xs font-display uppercase tracking-wider transition-colors"
                    style={{
                      background: position === p ? `hsl(${PURPLE} / .2)` : "hsl(var(--muted))",
                      color: position === p ? `hsl(${PURPLE})` : "hsl(var(--muted-foreground))",
                      border: `1px solid ${position === p ? `hsl(${PURPLE} / .4)` : "hsl(var(--border))"}`,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            {/* Format */}
            <div className="bg-card border border-border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Format</p>
              <div className="flex gap-2">
                {(["fastpitch", "slowpitch"] as Format[]).map((f) => (
                  <button key={f} onClick={() => setFormat(f)}
                    className="px-4 py-1.5 text-xs font-display uppercase tracking-wider transition-colors flex-1"
                    style={{
                      background: format === f ? `hsl(${GOLD} / .15)` : "hsl(var(--muted))",
                      color: format === f ? `hsl(${GOLD})` : "hsl(var(--muted-foreground))",
                      border: `1px solid ${format === f ? `hsl(${GOLD} / .4)` : "hsl(var(--border))"}`,
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
              {format === "slowpitch" && (
                <p className="text-[10px] text-muted-foreground mt-2">
                  Slowpitch removes pitching velocity & spin tools. Arc reading & USSSA bat knowledge emphasized.
                </p>
              )}
            </div>
          </motion.div>

          {/* ═══ OFP HERO ═══ */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card border border-border p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke={`hsl(${PURPLE})`}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${pct(ofp) * 3.27} 327`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-display text-foreground">{ofp}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">OFP</span>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-display text-foreground mb-1">Overall Future Potential</h2>
                <p className="text-sm mb-3" style={{ color: getGradeColor(ofp) }}>{getGradeLabel(ofp)}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/40 p-3 text-center">
                    <p className="text-2xl font-display" style={{ color: `hsl(${GOLD})` }}>{scholarshipPct}%</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">D1 Scholarship Prob.</p>
                  </div>
                  <div className="bg-muted/40 p-3 text-center">
                    <p className="text-2xl font-display text-foreground">{getGradeLabel(ofp)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Grade Label</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ═══ TABS ═══ */}
          <Tabs defaultValue="tools" className="space-y-6">
            <TabsList className="w-full flex-wrap h-auto gap-1 bg-card border border-border p-1">
              {[
                { value: "tools", label: "All Tools" },
                ...(isPitcher && format === "fastpitch" ? [{ value: "pitcher", label: "Pitcher" }] : []),
                ...(isCatcher ? [{ value: "catcher", label: "Catcher" }] : []),
                { value: "division", label: "Division Fit" },
              ].map((t) => (
                <TabsTrigger key={t.value} value={t.value}
                  className="flex-1 min-w-[90px] text-xs sm:text-sm data-[state=active]:text-foreground"
                  style={{ "--tw-ring-color": `hsl(${PURPLE})` } as any}
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ─── ALL TOOLS ─── */}
            <TabsContent value="tools">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {visibleTools
                  .filter((t) => format === "fastpitch" || !t.pitcherOnly)
                  .map((tool) => {
                    const g = grades[tool.key];
                    const isOpen = expandedTool === tool.key;
                    const posMin = posStandards[tool.key];
                    const belowAvg = g < 50;

                    return (
                      <div key={tool.key} className="bg-card border border-border">
                        <button onClick={() => setExpandedTool(isOpen ? null : tool.key)}
                          className="w-full flex items-center gap-3 p-4 text-left">
                          <div className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                            style={{ background: `${getGradeColor(g)}18` }}>
                            <tool.icon className="w-4 h-4" style={{ color: getGradeColor(g) }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-display text-foreground">{tool.label}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] px-1.5 py-0.5"
                                  style={{ background: `${getGradeColor(g)}18`, color: getGradeColor(g) }}>
                                  {getGradeLabel(g)}
                                </span>
                                <span className="text-sm font-display text-foreground w-6 text-right">{g}</span>
                              </div>
                            </div>
                            <div className="h-1.5 bg-muted w-full">
                              <div className="h-full transition-all" style={{ width: `${pct(g)}%`, background: `hsl(${GOLD})` }} />
                            </div>
                          </div>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                        </button>

                        {isOpen && (
                          <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                            <p className="text-xs text-muted-foreground">{tool.description}</p>
                            <input type="range" min={20} max={80} step={5} value={g}
                              onChange={(e) => setGrades((prev) => ({ ...prev, [tool.key]: Number(e.target.value) }))}
                              className="w-full" style={{ accentColor: `hsl(${GOLD})` }}
                            />
                            {/* Division comparison */}
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Division Benchmark</p>
                              <div className="flex gap-1">
                                {Object.entries(DIVISION_MINIMUMS).map(([div, min]) => (
                                  <div key={div} className="flex-1 text-center p-1"
                                    style={{ background: g >= min ? "hsl(150 75% 53% / .1)" : "hsl(var(--muted))" }}>
                                    <p className="text-[9px] text-muted-foreground truncate">{div.replace(" / NAIA", "")}</p>
                                    <p className="text-xs font-display" style={{ color: g >= min ? "hsl(150 75% 53%)" : "hsl(var(--muted-foreground))" }}>
                                      {g >= min ? "✓" : "—"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {/* Position standard */}
                            {posMin && (
                              <div className="flex items-center gap-2 text-xs">
                                <Info className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  D1 {position} standard: <strong className="text-foreground">{posMin}</strong>
                                  {g < posMin ? (
                                    <span style={{ color: "hsl(0 70% 54%)" }}> — {posMin - g} pts below</span>
                                  ) : (
                                    <span style={{ color: "hsl(150 75% 53%)" }}> — meets standard ✓</span>
                                  )}
                                </span>
                              </div>
                            )}
                            {/* Dev tip */}
                            {belowAvg && DEV_TIPS[tool.key] && (
                              <div className="p-2 text-xs flex items-start gap-2"
                                style={{ background: `hsl(${GOLD} / .08)`, border: `1px solid hsl(${GOLD} / .2)` }}>
                                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: `hsl(${GOLD})` }} />
                                <span className="text-muted-foreground">{DEV_TIPS[tool.key]}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </motion.div>
            </TabsContent>

            {/* ─── PITCHER SECTION ─── */}
            {isPitcher && format === "fastpitch" && (
              <TabsContent value="pitcher">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="bg-card border border-border p-6 space-y-5">
                    <h3 className="text-lg font-display text-foreground flex items-center gap-2">
                      <CircleDot className="w-5 h-5" style={{ color: `hsl(${PURPLE})` }} />
                      Windmill Pitching Assessment
                    </h3>

                    {/* Velocity */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">Velocity</span>
                        <span className="font-display text-foreground">{pitchVeloMph} mph</span>
                      </div>
                      <input type="range" min={40} max={75} value={pitchVeloMph}
                        onChange={(e) => setPitchVeloMph(Number(e.target.value))}
                        className="w-full" style={{ accentColor: `hsl(${PURPLE})` }} />
                      <div className="mt-2 overflow-x-auto">
                        <table className="w-full text-[11px]">
                          <thead><tr className="border-b border-border">
                            <th className="text-left py-1 text-muted-foreground font-normal">Division</th>
                            <th className="text-center py-1 text-muted-foreground font-normal">Range (mph)</th>
                            <th className="text-center py-1 text-muted-foreground font-normal">Status</th>
                          </tr></thead>
                          <tbody>
                            {Object.entries(DIVISION_VELO).map(([div, v]) => {
                              const fits = pitchVeloMph >= v.min;
                              return (
                                <tr key={div} className="border-b border-border/40">
                                  <td className="py-1 font-display text-foreground">{div}</td>
                                  <td className="py-1 text-center text-muted-foreground">{v.min}–{v.max}</td>
                                  <td className="py-1 text-center">
                                    <span className="text-[10px] px-1.5 py-0.5"
                                      style={{ background: fits ? "hsl(150 75% 53% / .12)" : "hsl(0 70% 54% / .12)", color: fits ? "hsl(150 75% 53%)" : "hsl(0 70% 54%)" }}>
                                      {fits ? "In Range ✓" : "Below"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Movement / Quality Pitches */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">Quality Pitches (#)</label>
                        <input type="number" min={1} max={6} value={qualityPitches}
                          onChange={(e) => setQualityPitches(Number(e.target.value))}
                          className="w-full mt-1 bg-muted border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1" style={{ "--tw-ring-color": `hsl(${PURPLE})` } as any} />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          D1 expects 3-4 quality pitches (rise, drop, curve, change)
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">Strike % (Control)</label>
                        <input type="number" min={20} max={100} value={strikePct}
                          onChange={(e) => setStrikePct(Number(e.target.value))}
                          className="w-full mt-1 bg-muted border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1" style={{ "--tw-ring-color": `hsl(${PURPLE})` } as any} />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          D1 average: 62-68% • Elite: 70%+
                        </p>
                      </div>
                    </div>

                    {/* Spin Awareness */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">Spin Rate Awareness</span>
                        <span className="text-xs px-1.5 py-0.5" style={{ background: `${getGradeColor(spinAwareness)}18`, color: getGradeColor(spinAwareness) }}>
                          {getGradeLabel(spinAwareness)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted"><div className="h-full" style={{ width: `${pct(spinAwareness)}%`, background: `hsl(${PURPLE})` }} /></div>
                      <input type="range" min={20} max={80} step={5} value={spinAwareness}
                        onChange={(e) => setSpinAwareness(Number(e.target.value))}
                        className="w-full mt-1" style={{ accentColor: `hsl(${PURPLE})` }} />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Understanding of how spin axis affects pitch movement. Use Rapsodo or pocket radar feedback when available.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            )}

            {/* ─── CATCHER SECTION ─── */}
            {isCatcher && (
              <TabsContent value="catcher">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="bg-card border border-border p-6 space-y-5">
                    <h3 className="text-lg font-display text-foreground flex items-center gap-2">
                      <Shield className="w-5 h-5" style={{ color: `hsl(${PURPLE})` }} />
                      Catcher Evaluation
                    </h3>

                    {/* Pop Time */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">Pop Time (seconds)</span>
                        <span className="font-display text-foreground">{popTime.toFixed(2)}s</span>
                      </div>
                      <input type="range" min={1.5} max={2.5} step={0.05} value={popTime}
                        onChange={(e) => setPopTime(Number(e.target.value))}
                        className="w-full" style={{ accentColor: `hsl(${GOLD})` }} />
                      <div className="mt-2 overflow-x-auto">
                        <table className="w-full text-[11px]">
                          <thead><tr className="border-b border-border">
                            <th className="text-left py-1 text-muted-foreground font-normal">Division</th>
                            <th className="text-center py-1 text-muted-foreground font-normal">Elite</th>
                            <th className="text-center py-1 text-muted-foreground font-normal">Good</th>
                            <th className="text-center py-1 text-muted-foreground font-normal">You</th>
                          </tr></thead>
                          <tbody>
                            {Object.entries(DIVISION_POP).map(([div, v]) => {
                              const isElite = popTime <= v.elite;
                              const isGood = popTime <= v.good;
                              return (
                                <tr key={div} className="border-b border-border/40">
                                  <td className="py-1 font-display text-foreground">{div}</td>
                                  <td className="py-1 text-center text-muted-foreground">{v.elite}s</td>
                                  <td className="py-1 text-center text-muted-foreground">{v.good}s</td>
                                  <td className="py-1 text-center">
                                    <span className="text-[10px] px-1.5 py-0.5"
                                      style={{
                                        background: isElite ? `hsl(${GOLD} / .12)` : isGood ? "hsl(150 75% 53% / .12)" : "hsl(0 70% 54% / .12)",
                                        color: isElite ? `hsl(${GOLD})` : isGood ? "hsl(150 75% 53%)" : "hsl(0 70% 54%)",
                                      }}>
                                      {isElite ? "Elite ★" : isGood ? "Good ✓" : "Needs Work"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Blocking / Framing / Leadership */}
                    {[
                      { label: "Blocking Grade", value: blockingGrade, set: setBlockingGrade, desc: "Ability to block pitches in the dirt consistently" },
                      { label: "Framing Grade", value: framingGrade, set: setFramingGrade, desc: "Receiving and presenting borderline pitches as strikes" },
                      { label: "Leadership Grade", value: leadershipGrade, set: setLeadershipGrade, desc: "Communication, game-calling, managing the pitcher's circle" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-foreground">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-1.5 py-0.5"
                              style={{ background: `${getGradeColor(item.value)}18`, color: getGradeColor(item.value) }}>
                              {getGradeLabel(item.value)}
                            </span>
                            <span className="text-sm font-display text-foreground w-6 text-right">{item.value}</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-muted"><div className="h-full" style={{ width: `${pct(item.value)}%`, background: `hsl(${GOLD})` }} /></div>
                        <input type="range" min={20} max={80} step={5} value={item.value}
                          onChange={(e) => item.set(Number(e.target.value))}
                          className="w-full mt-1" style={{ accentColor: `hsl(${GOLD})` }} />
                        <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>
            )}

            {/* ─── DIVISION FIT ─── */}
            <TabsContent value="division">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Benchmark bars */}
                <div className="bg-card border border-border p-6">
                  <h3 className="text-lg font-display text-foreground mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" style={{ color: `hsl(${GOLD})` }} />
                    Division Benchmark
                  </h3>
                  <div className="space-y-3">
                    {divisionFit.map((d) => (
                      <div key={d.division} className="flex items-center gap-3">
                        <div className="w-24 text-xs font-display text-foreground truncate">{d.division}</div>
                        <div className="flex-1 relative h-5 bg-muted">
                          <div className="absolute inset-y-0 left-0"
                            style={{ width: `${(DIVISION_MINIMUMS[d.division] / 80) * 100}%`, background: `${tierColor(d.tier)}22` }} />
                          <div className="absolute top-0 h-full w-0.5"
                            style={{ left: `${pct(ofp)}%`, background: `hsl(${PURPLE})` }} />
                        </div>
                        <span className="w-16 text-right text-[10px] px-1.5 py-0.5"
                          style={{ background: `${tierColor(d.tier)}18`, color: tierColor(d.tier) }}>
                          {d.fits ? "Fit ✓" : "Below"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* School tiers */}
                <div className="bg-card border border-border p-6">
                  <h3 className="text-lg font-display text-foreground mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" style={{ color: `hsl(${GOLD})` }} />
                    College Program Fit
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {(["reach", "target", "safety"] as const).map((tier) => {
                      const items = divisionFit.filter((d) => d.tier === tier);
                      if (!items.length) return null;
                      return (
                        <div key={tier}>
                          <p className="text-xs uppercase tracking-wider font-display mb-2"
                            style={{ color: tierColor(tier) }}>
                            {tier === "reach" ? "🔴 Reach" : tier === "target" ? "🟡 Target" : "🟢 Safety"}
                          </p>
                          {items.map((d) => (
                            <div key={d.division} className="mb-3">
                              <p className="text-xs font-display text-foreground mb-1">{d.division}</p>
                              <div className="flex flex-wrap gap-1">
                                {d.schools.map((s) => (
                                  <span key={s} className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground">{s}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Position-specific standards reminder */}
                <div className="bg-card border border-border p-6"
                  style={{ borderLeftWidth: 3, borderLeftColor: `hsl(${PURPLE})` }}>
                  <h4 className="text-sm font-display text-foreground mb-2">
                    Position Standards: {position.charAt(0).toUpperCase() + position.slice(1)}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(posStandards).map(([tool, min]) => (
                      <div key={tool} className="text-xs bg-muted/50 px-2 py-1">
                        <span className="text-muted-foreground">{TOOLS.find((t) => t.key === tool)?.label}: </span>
                        <span className="font-display" style={{
                          color: grades[tool as ToolName] >= (min ?? 0) ? "hsl(150 75% 53%)" : "hsl(0 70% 54%)"
                        }}>
                          {grades[tool as ToolName]} / {min}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default SoftballProspectGrader;
