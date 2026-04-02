import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, Check, ArrowRight, Loader2, Target, FileText,
  BarChart3, Calendar, TrendingUp, Route, Video, Mail, School,
  BookOpen, Shield, Clock, AlertTriangle, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, Star, Users, MapPin, Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileConversionBar from "@/components/products/MobileConversionBar";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Types ──────────────────────────────────────────────────────────
type VideoType = "hitting" | "fielding" | "pitching";
type Grade = "freshman" | "sophomore" | "junior" | "senior";
type SchoolTier = "reach" | "target" | "safety";

interface SchoolEntry {
  name: string;
  division: string;
  tier: SchoolTier;
}

interface OutreachEntry {
  school: string;
  contacted: boolean;
  responded: boolean;
  campVisit: boolean;
  officialVisit: boolean;
  unofficialVisit: boolean;
  offerReceived: boolean;
}

// ── Constants ──────────────────────────────────────────────────────
const PROFILE_SECTIONS = [
  { label: "Contact info complete", key: "contact" },
  { label: "Athletic stats entered", key: "stats" },
  { label: "Highlight video uploaded", key: "video" },
  { label: "Academic info added", key: "academic" },
  { label: "Target schools listed", key: "schools" },
  { label: "Coach references added", key: "references" },
  { label: "Profile photo uploaded", key: "photo" },
  { label: "Social links connected", key: "social" },
] as const;

const DIVISION_GPA: Record<string, number> = { D1: 2.3, D2: 2.2, D3: 2.0, NAIA: 2.0, JUCO: 1.8 };
const DIVISION_SAT: Record<string, number> = { D1: 900, D2: 820, D3: 0, NAIA: 860, JUCO: 0 };
const DIVISION_ACT: Record<string, number> = { D1: 17, D2: 15, D3: 0, NAIA: 16, JUCO: 0 };

const CORE_COURSES = [
  "English (4 years)", "Math (3 years)", "Natural/Physical Science (2 years)",
  "Additional English/Math/Science (1 year)", "Social Science (2 years)",
  "Additional Core (4 years)",
] as const;

const VIDEO_CHECKLIST: Record<VideoType, { label: string; tips: string[]; idealLength: string; coachLook: string[] }> = {
  hitting: {
    label: "Hitting Video",
    tips: ["Front toss or live at-bats", "Show full swing from multiple angles", "Include exit velo overlay if possible"],
    idealLength: "60-90 seconds",
    coachLook: ["Bat speed & path", "Approach at the plate", "Power potential", "Pitch recognition"],
  },
  fielding: {
    label: "Fielding Video",
    tips: ["Ground balls, fly balls, transfers", "Show arm strength on throws", "Include footwork close-ups"],
    idealLength: "45-75 seconds",
    coachLook: ["First-step quickness", "Hands & glove work", "Arm accuracy", "Range & positioning"],
  },
  pitching: {
    label: "Pitching / Throwing Video",
    tips: ["Bullpen or in-game footage", "Show all pitches thrown", "Include velocity readings"],
    idealLength: "60-120 seconds",
    coachLook: ["Arm action & mechanics", "Velocity & spin", "Command & composure", "Pitch mix variety"],
  },
};

const TIMELINE: Record<Grade, { title: string; color: string; items: string[] }> = {
  freshman: {
    title: "Freshman Year",
    color: "hsl(var(--vault-athleticism))",
    items: [
      "Focus on skill development & strength base",
      "Build a highlight video (early cuts OK)",
      "Start researching colleges & division levels",
      "Attend local showcases & camps",
      "Register with NCAA Eligibility Center",
    ],
  },
  sophomore: {
    title: "Sophomore Year",
    color: "hsl(var(--vault-utility))",
    items: [
      "Update highlight reel with new footage",
      "Take PSAT & plan SAT/ACT prep",
      "Attend college camps at target schools",
      "Begin emailing college coaches",
      "Build academic transcript awareness",
    ],
  },
  junior: {
    title: "Junior Year — CRITICAL WINDOW",
    color: "hsl(var(--vault-velocity))",
    items: [
      "Primary recruiting year — coaches are watching",
      "Take SAT/ACT and submit scores",
      "Schedule unofficial visits",
      "Attend elite showcases & PBR / PG events",
      "Follow up with every coach contact monthly",
      "Verify NCAA core course track is on pace",
    ],
  },
  senior: {
    title: "Senior Year — Final Push",
    color: "hsl(var(--vault-longevity))",
    items: [
      "Finalize college decision",
      "Sign NLI during signing period",
      "Complete NCAA Clearinghouse process",
      "Maintain GPA — don't let grades slip",
      "Consider JUCO if D1/D2 offers don't materialize",
    ],
  },
};

const DIVISION_OFP: Record<string, { min: number; label: string; color: string }> = {
  "Pro / Draft": { min: 55, label: "55+ OFP", color: "hsl(var(--vault-velocity))" },
  "D1 Power 5": { min: 50, label: "50+ OFP", color: "hsl(var(--vault-utility))" },
  "D1 Mid-Major": { min: 45, label: "45+ OFP", color: "hsl(var(--vault-utility))" },
  "D2": { min: 40, label: "40+ OFP", color: "hsl(var(--vault-athleticism))" },
  "D3 / NAIA": { min: 35, label: "35+ OFP", color: "hsl(var(--vault-longevity))" },
  "JUCO": { min: 30, label: "30+ OFP", color: "hsl(var(--vault-transfer))" },
};

// ── Helpers ────────────────────────────────────────────────────────
const gradeLabel = (g: number) => {
  if (g >= 80) return "Elite";
  if (g >= 70) return "Well Above Avg";
  if (g >= 65) return "Plus+";
  if (g >= 60) return "Plus";
  if (g >= 55) return "Above Average";
  if (g >= 50) return "Average";
  if (g >= 45) return "Below Avg+";
  if (g >= 40) return "Below Average";
  if (g >= 30) return "Well Below Avg";
  return "Poor";
};

const gradeColor = (g: number) => {
  if (g >= 70) return "hsl(var(--vault-utility))";
  if (g >= 55) return "hsl(var(--vault-longevity))";
  if (g >= 45) return "hsl(var(--vault-athleticism))";
  return "hsl(var(--vault-velocity))";
};

const pct = (v: number, max: number) => Math.min(100, Math.max(0, ((v - 20) / (max - 20)) * 100));

// ── Component ──────────────────────────────────────────────────────
const RecruitmentAudit = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.recruitment_audit;

  // Profile completeness
  const [profileChecks, setProfileChecks] = useState<Record<string, boolean>>(
    Object.fromEntries(PROFILE_SECTIONS.map((s) => [s.key, false]))
  );
  const profileScore = useMemo(() => {
    const done = Object.values(profileChecks).filter(Boolean).length;
    return Math.round((done / PROFILE_SECTIONS.length) * 100);
  }, [profileChecks]);

  // Academics
  const [gpa, setGpa] = useState(3.0);
  const [sat, setSat] = useState(1000);
  const [act, setAct] = useState(20);
  const [coreChecks, setCoreChecks] = useState<Record<string, boolean>>(
    Object.fromEntries(CORE_COURSES.map((c) => [c, false]))
  );
  const [clearinghouseRegistered, setClearinghouseRegistered] = useState(false);

  // Videos
  const [videoChecks, setVideoChecks] = useState<Record<VideoType, boolean>>({
    hitting: false, fielding: false, pitching: false,
  });
  const [expandedVideo, setExpandedVideo] = useState<VideoType | null>(null);

  // Outreach
  const [outreach, setOutreach] = useState<OutreachEntry[]>([
    { school: "", contacted: false, responded: false, campVisit: false, officialVisit: false, unofficialVisit: false, offerReceived: false },
  ]);
  const responseRate = useMemo(() => {
    const contacted = outreach.filter((o) => o.contacted).length;
    const responded = outreach.filter((o) => o.responded).length;
    return contacted > 0 ? Math.round((responded / contacted) * 100) : 0;
  }, [outreach]);

  // 20-80 tool grades (for Division Fit)
  const [toolGrades, setToolGrades] = useState({
    hit: 50, rawPower: 50, gamePower: 50, run: 50, arm: 50, field: 50, baseballIQ: 50,
  });
  const ofp = useMemo(() => {
    const w = { hit: 1.2, rawPower: 1.0, gamePower: 1.1, run: 0.9, arm: 0.9, field: 0.95, baseballIQ: 0.95 };
    let ws = 0, tw = 0;
    (Object.keys(w) as (keyof typeof w)[]).forEach((k) => { ws += toolGrades[k] * w[k]; tw += w[k]; });
    return Math.round(ws / tw);
  }, [toolGrades]);
  const scholarshipPct = useMemo(() => {
    if (ofp >= 65) return 95;
    if (ofp >= 60) return 80;
    if (ofp >= 55) return 60;
    if (ofp >= 50) return 40;
    if (ofp >= 45) return 20;
    return 5;
  }, [ofp]);

  // Division Fit schools (example)
  const schoolList: SchoolEntry[] = useMemo(() => {
    const schools: SchoolEntry[] = [];
    if (ofp >= 55) {
      schools.push({ name: "Vanderbilt", division: "D1", tier: "reach" });
      schools.push({ name: "Florida", division: "D1", tier: "reach" });
    }
    if (ofp >= 50) {
      schools.push({ name: "Dallas Baptist", division: "D1", tier: "target" });
      schools.push({ name: "Coastal Carolina", division: "D1", tier: "target" });
    }
    if (ofp >= 45) {
      schools.push({ name: "Tampa", division: "D2", tier: "target" });
      schools.push({ name: "Catawba", division: "D2", tier: "safety" });
    }
    if (ofp >= 35) {
      schools.push({ name: "Emory", division: "D3", tier: "safety" });
      schools.push({ name: "Chipola College", division: "JUCO", tier: "safety" });
    }
    return schools;
  }, [ofp]);

  // Overall recruiting score
  const recruitingScore = useMemo(() => {
    const videoScore = Object.values(videoChecks).filter(Boolean).length / 3;
    const academicScore = (gpa >= 2.3 ? 0.3 : gpa / 2.3 * 0.3) + (clearinghouseRegistered ? 0.2 : 0);
    const outreachScore = Math.min(1, outreach.filter((o) => o.contacted).length / 10) * 0.2;
    const profilePart = (profileScore / 100) * 0.3;
    return Math.round((profilePart + videoScore * 0.2 + academicScore + outreachScore) * 100);
  }, [profileScore, videoChecks, gpa, clearinghouseRegistered, outreach]);

  const tierColors: Record<SchoolTier, string> = {
    reach: "hsl(var(--vault-velocity))",
    target: "hsl(var(--vault-utility))",
    safety: "hsl(var(--vault-longevity))",
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">

          {/* ═══════ HEADER ═══════ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <div className="w-20 h-20 rounded-none bg-[hsl(var(--vault-utility)/.12)] flex items-center justify-center mx-auto mb-6 border border-[hsl(var(--vault-utility)/.3)]">
              <GraduationCap className="w-10 h-10" style={{ color: "hsl(var(--vault-utility))" }} />
            </div>
            <h1 className="text-4xl md:text-6xl font-display text-foreground mb-3 tracking-wide">
              RECRUITMENT AUDIT
            </h1>
            <p className="text-xl md:text-2xl font-display" style={{ color: "hsl(var(--vault-utility))" }}>
              KNOW EXACTLY WHERE YOU STAND
            </p>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              A comprehensive, data-driven assessment of your recruiting profile, academics, video, outreach, and timeline — built for families who want clarity.
            </p>
          </motion.div>

          {/* ═══════ OVERALL SCORE HERO ═══════ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-card border border-border p-8 mb-10"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-36 h-36 flex-shrink-0">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--vault-utility))"
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(recruitingScore / 100) * 327} 327`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-display text-foreground">{recruitingScore}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Score</span>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-display text-foreground mb-2">RECRUITING PROFILE SCORE</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Composite of profile completeness, video quality, academic eligibility, outreach progress, and timeline status. Complete each section below to raise your score.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  {[
                    { label: "Profile", value: profileScore },
                    { label: "Video", value: Math.round(Object.values(videoChecks).filter(Boolean).length / 3 * 100) },
                    { label: "Academic", value: gpa >= 2.3 ? 100 : Math.round((gpa / 2.3) * 100) },
                    { label: "Outreach", value: Math.min(100, outreach.filter((o) => o.contacted).length * 10) },
                    { label: "Timeline", value: clearinghouseRegistered ? 80 : 30 },
                  ].map((s) => (
                    <div key={s.label} className="bg-muted/50 p-2">
                      <p className="text-lg font-display text-foreground">{s.value}%</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ═══════ TABS ═══════ */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="w-full flex-wrap h-auto gap-1 bg-card border border-border p-1">
              {[
                { value: "profile", label: "Profile", icon: FileText },
                { value: "academic", label: "Academics", icon: BookOpen },
                { value: "video", label: "Video Audit", icon: Video },
                { value: "outreach", label: "Outreach", icon: Mail },
                { value: "timeline", label: "Timeline", icon: Calendar },
                { value: "division", label: "Division Fit", icon: Target },
              ].map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="flex-1 min-w-[100px] data-[state=active]:bg-[hsl(var(--vault-utility)/.15)] data-[state=active]:text-foreground text-xs sm:text-sm gap-1.5">
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ─── 1. PROFILE COMPLETENESS ─── */}
            <TabsContent value="profile">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-display text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5" style={{ color: "hsl(var(--vault-utility))" }} />
                    Profile Completeness
                  </h3>
                  <span className="text-2xl font-display text-foreground">{profileScore}%</span>
                </div>
                <Progress value={profileScore} className="h-2" />
                <div className="grid sm:grid-cols-2 gap-3">
                  {PROFILE_SECTIONS.map((s) => (
                    <label key={s.key} className="flex items-center gap-3 bg-muted/30 p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      <input type="checkbox" checked={profileChecks[s.key]} onChange={() => setProfileChecks((p) => ({ ...p, [s.key]: !p[s.key] }))}
                        className="w-4 h-4 accent-[hsl(var(--vault-utility))]"
                      />
                      <span className="text-sm text-foreground">{s.label}</span>
                      {profileChecks[s.key] && <CheckCircle2 className="w-4 h-4 ml-auto" style={{ color: "hsl(var(--vault-longevity))" }} />}
                    </label>
                  ))}
                </div>
              </motion.div>
            </TabsContent>

            {/* ─── 2. ACADEMIC REQUIREMENTS ─── */}
            <TabsContent value="academic">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* GPA / SAT / ACT */}
                <div className="bg-card border border-border p-6 space-y-5">
                  <h3 className="text-xl font-display text-foreground flex items-center gap-2">
                    <BookOpen className="w-5 h-5" style={{ color: "hsl(var(--vault-utility))" }} />
                    Academic Tracker
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { label: "GPA", value: gpa, set: setGpa, min: 0, max: 4.0, step: 0.1 },
                      { label: "SAT", value: sat, set: setSat, min: 400, max: 1600, step: 10 },
                      { label: "ACT", value: act, set: setAct, min: 1, max: 36, step: 1 },
                    ].map((f) => (
                      <div key={f.label} className="space-y-2">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">{f.label}</label>
                        <input type="number" value={f.value} onChange={(e) => f.set(Number(e.target.value))}
                          min={f.min} max={f.max} step={f.step}
                          className="w-full bg-muted border border-border px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--vault-utility))]"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Division comparison table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-muted-foreground font-normal">Division</th>
                          <th className="text-center py-2 text-muted-foreground font-normal">Min GPA</th>
                          <th className="text-center py-2 text-muted-foreground font-normal">Min SAT</th>
                          <th className="text-center py-2 text-muted-foreground font-normal">Min ACT</th>
                          <th className="text-center py-2 text-muted-foreground font-normal">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(DIVISION_GPA).map(([div, minGpa]) => {
                          const meetsGpa = gpa >= minGpa;
                          const meetsSat = DIVISION_SAT[div] === 0 || sat >= DIVISION_SAT[div];
                          const meetsAct = DIVISION_ACT[div] === 0 || act >= DIVISION_ACT[div];
                          const eligible = meetsGpa && (meetsSat || meetsAct);
                          return (
                            <tr key={div} className="border-b border-border/50">
                              <td className="py-2 font-display text-foreground">{div}</td>
                              <td className="py-2 text-center">
                                <span style={{ color: meetsGpa ? "hsl(var(--vault-longevity))" : "hsl(var(--vault-velocity))" }}>{minGpa.toFixed(1)}</span>
                              </td>
                              <td className="py-2 text-center">
                                <span style={{ color: meetsSat ? "hsl(var(--vault-longevity))" : "hsl(var(--vault-velocity))" }}>{DIVISION_SAT[div] || "—"}</span>
                              </td>
                              <td className="py-2 text-center">
                                <span style={{ color: meetsAct ? "hsl(var(--vault-longevity))" : "hsl(var(--vault-velocity))" }}>{DIVISION_ACT[div] || "—"}</span>
                              </td>
                              <td className="py-2 text-center">
                                {eligible ? (
                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5" style={{ background: "hsl(var(--vault-longevity)/.12)", color: "hsl(var(--vault-longevity))" }}>
                                    <CheckCircle2 className="w-3 h-3" /> Eligible
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5" style={{ background: "hsl(var(--vault-velocity)/.12)", color: "hsl(var(--vault-velocity))" }}>
                                    <XCircle className="w-3 h-3" /> Below Min
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Core Courses */}
                <div className="bg-card border border-border p-6 space-y-4">
                  <h3 className="text-lg font-display text-foreground flex items-center gap-2">
                    <Shield className="w-5 h-5" style={{ color: "hsl(var(--vault-utility))" }} />
                    NCAA Core Course Checklist
                  </h3>
                  <div className="space-y-2">
                    {CORE_COURSES.map((c) => (
                      <label key={c} className="flex items-center gap-3 bg-muted/30 p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                        <input type="checkbox" checked={coreChecks[c]} onChange={() => setCoreChecks((p) => ({ ...p, [c]: !p[c] }))}
                          className="w-4 h-4 accent-[hsl(var(--vault-utility))]"
                        />
                        <span className="text-sm text-foreground">{c}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    NCAA D1 requires 16 core courses. D2 requires 16. Verify with the NCAA Eligibility Center.
                  </p>
                </div>

                {/* Clearinghouse */}
                <div className="bg-card border border-border p-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={clearinghouseRegistered} onChange={() => setClearinghouseRegistered(!clearinghouseRegistered)}
                      className="w-5 h-5 accent-[hsl(var(--vault-utility))]"
                    />
                    <div>
                      <span className="text-sm font-display text-foreground">NCAA Eligibility Center Registration</span>
                      <p className="text-xs text-muted-foreground">Register at eligibilitycenter.org — required for D1 & D2</p>
                    </div>
                    {clearinghouseRegistered ? (
                      <CheckCircle2 className="w-5 h-5 ml-auto" style={{ color: "hsl(var(--vault-longevity))" }} />
                    ) : (
                      <AlertTriangle className="w-5 h-5 ml-auto" style={{ color: "hsl(var(--vault-velocity))" }} />
                    )}
                  </label>
                </div>
              </motion.div>
            </TabsContent>

            {/* ─── 3. VIDEO AUDIT ─── */}
            <TabsContent value="video">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {(Object.keys(VIDEO_CHECKLIST) as VideoType[]).map((type) => {
                  const v = VIDEO_CHECKLIST[type];
                  const isOpen = expandedVideo === type;
                  return (
                    <div key={type} className="bg-card border border-border">
                      <button onClick={() => setExpandedVideo(isOpen ? null : type)}
                        className="w-full flex items-center justify-between p-5 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center" style={{ background: videoChecks[type] ? "hsl(var(--vault-longevity)/.12)" : "hsl(var(--muted))" }}>
                            {videoChecks[type] ? <CheckCircle2 className="w-5 h-5" style={{ color: "hsl(var(--vault-longevity))" }} /> : <Video className="w-5 h-5 text-muted-foreground" />}
                          </div>
                          <div>
                            <p className="font-display text-foreground">{v.label}</p>
                            <p className="text-xs text-muted-foreground">Ideal: {v.idealLength}</p>
                          </div>
                        </div>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={videoChecks[type]} onChange={() => setVideoChecks((p) => ({ ...p, [type]: !p[type] }))}
                              className="w-4 h-4 accent-[hsl(var(--vault-utility))]"
                            />
                            <span className="text-sm text-foreground">I have a {v.label.toLowerCase()}</span>
                          </label>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Video Tips</p>
                            <ul className="space-y-1">
                              {v.tips.map((t, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "hsl(var(--vault-utility))" }} />
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">What Coaches Look For</p>
                            <div className="flex flex-wrap gap-2">
                              {v.coachLook.map((c, i) => (
                                <span key={i} className="text-xs px-2 py-1 border border-[hsl(var(--vault-utility)/.3)] text-foreground" style={{ background: "hsl(var(--vault-utility)/.08)" }}>
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            </TabsContent>

            {/* ─── 4. OUTREACH TRACKER ─── */}
            <TabsContent value="outreach">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-card border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-display text-foreground flex items-center gap-2">
                      <Mail className="w-5 h-5" style={{ color: "hsl(var(--vault-utility))" }} />
                      Outreach Tracker
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Response Rate: <span className="font-display text-foreground">{responseRate}%</span>
                      </span>
                      <span className="text-muted-foreground">
                        Offers: <span className="font-display" style={{ color: "hsl(var(--vault-utility))" }}>
                          {outreach.filter((o) => o.offerReceived).length}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-muted-foreground font-normal">School</th>
                          <th className="text-center py-2 text-muted-foreground font-normal">Contacted</th>
                          <th className="text-center py-2 text-muted-foreground font-normal">Response</th>
                          <th className="text-center py-2 text-muted-foreground font-normal">Camp</th>
                          <th className="text-center py-2 text-muted-foreground font-normal hidden sm:table-cell">Unofficial</th>
                          <th className="text-center py-2 text-muted-foreground font-normal hidden sm:table-cell">Official</th>
                          <th className="text-center py-2 text-muted-foreground font-normal">Offer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {outreach.map((row, idx) => (
                          <tr key={idx} className="border-b border-border/50">
                            <td className="py-2 pr-2">
                              <input type="text" value={row.school} placeholder="School name…"
                                onChange={(e) => { const n = [...outreach]; n[idx].school = e.target.value; setOutreach(n); }}
                                className="w-full bg-transparent text-foreground text-sm focus:outline-none border-b border-border/50 focus:border-[hsl(var(--vault-utility))] pb-0.5"
                              />
                            </td>
                            {(["contacted", "responded", "campVisit", "unofficialVisit", "officialVisit", "offerReceived"] as const).map((field, fi) => (
                              <td key={field} className={`py-2 text-center ${fi >= 3 && fi <= 4 ? "hidden sm:table-cell" : ""}`}>
                                <input type="checkbox" checked={row[field]}
                                  onChange={() => { const n = [...outreach]; (n[idx] as any)[field] = !row[field]; setOutreach(n); }}
                                  className="w-4 h-4 accent-[hsl(var(--vault-utility))]"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3"
                    onClick={() => setOutreach([...outreach, { school: "", contacted: false, responded: false, campVisit: false, officialVisit: false, unofficialVisit: false, offerReceived: false }])}
                  >
                    + Add School
                  </Button>
                </div>
              </motion.div>
            </TabsContent>

            {/* ─── 5. TIMELINE BY GRADE ─── */}
            <TabsContent value="timeline">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {(Object.keys(TIMELINE) as Grade[]).map((grade) => {
                  const t = TIMELINE[grade];
                  const isCritical = grade === "junior";
                  return (
                    <div key={grade} className="bg-card border border-border p-6"
                      style={{ borderLeftWidth: 4, borderLeftColor: t.color }}
                    >
                      <h3 className="text-lg font-display text-foreground mb-3 flex items-center gap-2">
                        {isCritical && <AlertTriangle className="w-4 h-4" style={{ color: t.color }} />}
                        {t.title}
                      </h3>
                      <ul className="space-y-2">
                        {t.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: t.color }} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </motion.div>
            </TabsContent>

            {/* ─── 6. DIVISION FIT ANALYSIS ─── */}
            <TabsContent value="division">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* OFP & Scholarship */}
                <div className="bg-card border border-border p-6">
                  <h3 className="text-xl font-display text-foreground mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" style={{ color: "hsl(var(--vault-utility))" }} />
                    Your 20-80 Tool Grades & OFP
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">Adjust sliders to match your scouting grades from the Prospect Grader.</p>
                  <div className="space-y-4 mb-6">
                    {([
                      { key: "hit", label: "Hit" }, { key: "rawPower", label: "Raw Power" },
                      { key: "gamePower", label: "Game Power" }, { key: "run", label: "Run" },
                      { key: "arm", label: "Arm" }, { key: "field", label: "Field" },
                      { key: "baseballIQ", label: "Baseball IQ" },
                    ] as { key: keyof typeof toolGrades; label: string }[]).map((t) => (
                      <div key={t.key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-foreground">{t.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-1.5 py-0.5" style={{ background: `${gradeColor(toolGrades[t.key])}22`, color: gradeColor(toolGrades[t.key]) }}>
                              {gradeLabel(toolGrades[t.key])}
                            </span>
                            <span className="text-sm font-display text-foreground w-6 text-right">{toolGrades[t.key]}</span>
                          </div>
                        </div>
                        <div className="relative h-2 bg-muted">
                          <div className="absolute inset-y-0 left-0" style={{ width: `${pct(toolGrades[t.key], 80)}%`, background: gradeColor(toolGrades[t.key]) }} />
                        </div>
                        <input type="range" min={20} max={80} step={5} value={toolGrades[t.key]}
                          onChange={(e) => setToolGrades((g) => ({ ...g, [t.key]: Number(e.target.value) }))}
                          className="w-full mt-1 accent-[hsl(var(--vault-utility))]" style={{ height: 8 }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* OFP + Scholarship row */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-muted/40 p-4 text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Overall Future Potential</p>
                      <p className="text-4xl font-display" style={{ color: gradeColor(ofp) }}>{ofp}</p>
                      <p className="text-xs mt-1" style={{ color: gradeColor(ofp) }}>{gradeLabel(ofp)}</p>
                    </div>
                    <div className="bg-muted/40 p-4 text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">D1 Scholarship Probability</p>
                      <p className="text-4xl font-display" style={{ color: "hsl(var(--vault-utility))" }}>{scholarshipPct}%</p>
                      <div className="h-1.5 bg-muted mt-2"><div style={{ width: `${scholarshipPct}%`, background: "hsl(var(--vault-utility))" }} className="h-full" /></div>
                    </div>
                  </div>
                </div>

                {/* Division Benchmark */}
                <div className="bg-card border border-border p-6">
                  <h3 className="text-lg font-display text-foreground mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" style={{ color: "hsl(var(--vault-utility))" }} />
                    Division Benchmark
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(DIVISION_OFP).map(([div, info]) => {
                      const fits = ofp >= info.min;
                      return (
                        <div key={div} className="flex items-center gap-3">
                          <div className="w-28 text-sm text-foreground font-display">{div}</div>
                          <div className="flex-1 relative h-6 bg-muted">
                            <div className="absolute inset-y-0 left-0" style={{ width: `${(info.min / 80) * 100}%`, background: `${info.color}33` }} />
                            <div className="absolute top-0 h-full w-0.5" style={{ left: `${pct(ofp, 80)}%`, background: "hsl(var(--vault-utility))" }} />
                          </div>
                          <div className="w-20 text-right">
                            {fits ? (
                              <span className="text-xs px-2 py-0.5" style={{ background: "hsl(var(--vault-longevity)/.12)", color: "hsl(var(--vault-longevity))" }}>Fit ✓</span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground">Below</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* School List */}
                {schoolList.length > 0 && (
                  <div className="bg-card border border-border p-6">
                    <h3 className="text-lg font-display text-foreground mb-4 flex items-center gap-2">
                      <School className="w-5 h-5" style={{ color: "hsl(var(--vault-utility))" }} />
                      Target School Analysis
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {(["reach", "target", "safety"] as SchoolTier[]).map((tier) => {
                        const schools = schoolList.filter((s) => s.tier === tier);
                        if (!schools.length) return null;
                        return (
                          <div key={tier} className="space-y-2">
                            <p className="text-xs uppercase tracking-wider font-display" style={{ color: tierColors[tier] }}>
                              {tier === "reach" ? "🔴 Reach Schools" : tier === "target" ? "🟡 Target Schools" : "🟢 Safety Schools"}
                            </p>
                            {schools.map((s, i) => (
                              <div key={i} className="bg-muted/30 p-2 flex items-center justify-between">
                                <span className="text-sm text-foreground">{s.name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">{s.division}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>

          {/* ═══════ CTA ═══════ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mt-12 bg-card border border-[hsl(var(--vault-utility)/.3)] p-8 text-center"
          >
            <h3 className="text-2xl font-display text-foreground mb-2">GET YOUR FULL RECRUITMENT AUDIT</h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto text-sm">
              A VAULT coach will review your data, verify your grades, and deliver a personalized roadmap with clear next steps.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={() => checkout("recruitment_audit")} disabled={loading === "recruitment_audit"}
                className="bg-[hsl(var(--vault-utility))] hover:bg-[hsl(var(--vault-utility)/.85)] text-black font-display text-lg px-8 py-3 h-auto"
              >
                {loading === "recruitment_audit" ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Trophy className="w-5 h-5 mr-2" />}
                {formatPrice(product.price)} — Get Audit
              </Button>
              <Link to="/#pricing">
                <Button variant="outline" className="border-border">
                  View Elite Membership <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      <MobileConversionBar productName={product.name} price={product.price} productKey="recruitment_audit" onCheckout={checkout} loading={loading} ctaText="Get Audit" />
      <Footer />
    </main>
  );
};

export default RecruitmentAudit;
