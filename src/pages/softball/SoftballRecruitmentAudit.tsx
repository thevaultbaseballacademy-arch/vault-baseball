import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, Check, Target, FileText, Video, Mail, School,
  BookOpen, Shield, Clock, AlertTriangle, CheckCircle2, XCircle,
  Star, Users, MapPin, Trophy, Calendar, TrendingUp, ChevronDown,
  ChevronUp, Zap, Award, Scale, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// ── Types ──────────────────────────────────────────────────────────
type SchoolTier = "reach" | "target" | "safety";

interface OutreachEntry {
  school: string;
  division: string;
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
  { label: "Position & measurables added", key: "position" },
] as const;

const DIVISION_GPA: Record<string, number> = { D1: 2.3, D2: 2.2, D3: 2.0, NAIA: 2.0, NJCAA: 1.75 };
const DIVISION_SAT: Record<string, number> = { D1: 900, D2: 820, D3: 0, NAIA: 860, NJCAA: 0 };
const DIVISION_ACT: Record<string, number> = { D1: 17, D2: 15, D3: 0, NAIA: 16, NJCAA: 0 };

const CORE_COURSES = [
  "English (4 years)", "Math — Algebra I or higher (3 years)",
  "Natural/Physical Science (2 years)", "Additional English/Math/Science (1 year)",
  "Social Science (2 years)", "Additional Core Courses (4 years)",
] as const;

const NCAA_CHECKLIST = [
  "Created NCAA ID (eligibility center account)",
  "Requested transcript sent to NCAA",
  "Listed as college-bound on high school transcript",
  "SAT/ACT scores sent to NCAA (code 9999)",
  "Registered with NAIA Eligibility Center (if applicable)",
  "Amateurism questionnaire completed",
] as const;

const PITCH_ARSENAL = [
  "Fastball", "Change-Up", "Drop Ball", "Rise Ball",
  "Curve Ball", "Screw Ball", "Drop Curve",
] as const;

const PITCHER_VELO: Record<string, { min: number; max: number }> = {
  "D1 Power 5": { min: 63, max: 70 },
  "D1 Mid-Major": { min: 60, max: 65 },
  D2: { min: 57, max: 62 },
  D3: { min: 54, max: 58 },
  NJCAA: { min: 52, max: 57 },
};

const PITCH_GRADES = ["Rise Ball", "Drop Ball", "Change-Up"] as const;

const SHOWCASE_ORGS = [
  { name: "NFCA Lead-Off Classic", org: "NFCA", region: "National", bestFor: "All divisions", when: "January" },
  { name: "PGF Nationals", org: "PGF", region: "National", bestFor: "D1/D2 exposure", when: "July" },
  { name: "TCS World Series", org: "TCS", region: "National", bestFor: "Club teams 14U-18U", when: "July-August" },
  { name: "USA Softball Nationals", org: "USA Softball", region: "National", bestFor: "Elite exposure", when: "July" },
  { name: "Alliance Fastpitch Championships", org: "Alliance", region: "National", bestFor: "14U-18U elite", when: "Summer" },
  { name: "NFCA Leadoff Classic", org: "NFCA", region: "Southeast", bestFor: "High school seniors", when: "February" },
];

const TIMELINE: Record<string, { title: string; color: string; items: string[] }> = {
  "8th": {
    title: "8th Grade — Early Development",
    color: "text-green-400",
    items: [
      "Focus on skill development and travel ball",
      "Begin building highlight video clips",
      "Research NCAA eligibility requirements",
      "Attend local ID camps to gain exposure",
      "Start tracking measurables (velo, times, etc.)",
    ],
  },
  freshman: {
    title: "Freshman — Foundation Building",
    color: "text-green-400",
    items: [
      "Register with NCAA Eligibility Center",
      "Begin academic planning for core courses",
      "Create initial recruiting profile online",
      "Attend college camps within driving distance",
      "Start emailing coaches at target schools",
    ],
  },
  sophomore: {
    title: "Sophomore — First Coach Contacts",
    color: "text-yellow-400",
    items: [
      "Update highlight video with varsity footage",
      "Send introductory emails to 20+ programs",
      "Attend 2-3 showcases/camps per summer",
      "Take SAT/ACT for the first time",
      "Schedule unofficial campus visits",
    ],
  },
  junior: {
    title: "Junior — Peak Recruiting Window",
    color: "text-orange-400",
    items: [
      "This is your MOST CRITICAL year for recruiting",
      "Follow up with every coach who showed interest",
      "Attend elite showcases (PGF, TCS, Alliance)",
      "Schedule official visits (max 5 for D1/D2)",
      "Commit timeline: most D1 commits happen now",
      "Retake SAT/ACT if needed for eligibility",
    ],
  },
  senior: {
    title: "Senior — Final Opportunities",
    color: "text-red-400",
    items: [
      "Sign NLI during early or late signing period",
      "Explore walk-on opportunities if uncommitted",
      "Contact NJCAA programs — many recruit late",
      "Ensure final transcript meets eligibility",
      "Apply for financial aid and academic scholarships",
    ],
  },
};

const TITLE_IX_FACTS = [
  { stat: "310+", label: "NCAA D1 softball programs", detail: "vs ~300 D1 baseball programs" },
  { stat: "11.7", label: "D1 scholarship equivalencies", detail: "Divided among roster — avg ~0.5 per player" },
  { stat: "7.2", label: "D2 scholarship equivalencies", detail: "Often paired with academic aid" },
  { stat: "36%", label: "More roster spots", detail: "Softball rosters are larger, creating more opportunities" },
];

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

const tierColor = (t: SchoolTier) =>
  t === "reach" ? "text-red-400" : t === "target" ? "text-yellow-400" : "text-green-400";

const tierBg = (t: SchoolTier) =>
  t === "reach" ? "bg-red-500/20 border-red-500/30" : t === "target" ? "bg-yellow-500/20 border-yellow-500/30" : "bg-green-500/20 border-green-500/30";

// ── Component ──────────────────────────────────────────────────────
const SoftballRecruitmentAudit = () => {
  // Profile checklist
  const [profileChecks, setProfileChecks] = useState<Record<string, boolean>>(
    Object.fromEntries(PROFILE_SECTIONS.map((s) => [s.key, false]))
  );

  // Academics
  const [gpa, setGpa] = useState(3.0);
  const [sat, setSat] = useState(1000);
  const [act, setAct] = useState(20);
  const [coreCourses, setCoreCourses] = useState<Record<string, boolean>>(
    Object.fromEntries(CORE_COURSES.map((c) => [c, false]))
  );
  const [ncaaChecks, setNcaaChecks] = useState<Record<string, boolean>>(
    Object.fromEntries(NCAA_CHECKLIST.map((c) => [c, false]))
  );

  // Videos
  const [videoChecks, setVideoChecks] = useState({ hitting: false, pitching: false, defensive: false, highlight: false });

  // Pitching
  const [isPitcher, setIsPitcher] = useState(false);
  const [pitchVelo, setPitchVelo] = useState(58);
  const [pitchArsenal, setPitchArsenal] = useState<Record<string, boolean>>(
    Object.fromEntries(PITCH_ARSENAL.map((p) => [p, false]))
  );
  const [pitchGrades, setPitchGrades] = useState<Record<string, number>>(
    Object.fromEntries(PITCH_GRADES.map((p) => [p, 50]))
  );
  const [mechanics, setMechanics] = useState({ stride: false, armCircle: false, hipClose: false, followThrough: false });

  // Outreach
  const [outreach, setOutreach] = useState<OutreachEntry[]>([]);
  const [newSchool, setNewSchool] = useState("");
  const [newDiv, setNewDiv] = useState("D1");

  // ── Computed scores ──────────────────────────────────────────────
  const profileScore = useMemo(() => {
    const checked = Object.values(profileChecks).filter(Boolean).length;
    return Math.round((checked / PROFILE_SECTIONS.length) * 100);
  }, [profileChecks]);

  const videoScore = useMemo(() => {
    const total = Object.values(videoChecks).filter(Boolean).length;
    return Math.round((total / 4) * 100);
  }, [videoChecks]);

  const academicScore = useMemo(() => {
    const gpaOk = gpa >= 2.3 ? 1 : gpa >= 2.0 ? 0.7 : 0.3;
    const satOk = sat >= 900 ? 1 : sat >= 820 ? 0.7 : 0.4;
    const coreOk = Object.values(coreCourses).filter(Boolean).length / CORE_COURSES.length;
    const ncaaOk = Object.values(ncaaChecks).filter(Boolean).length / NCAA_CHECKLIST.length;
    return Math.round(((gpaOk + satOk + coreOk + ncaaOk) / 4) * 100);
  }, [gpa, sat, coreCourses, ncaaChecks]);

  const outreachScore = useMemo(() => {
    if (outreach.length === 0) return 0;
    const contacted = outreach.filter((o) => o.contacted).length;
    const responded = outreach.filter((o) => o.responded).length;
    const visits = outreach.filter((o) => o.campVisit || o.officialVisit || o.unofficialVisit).length;
    return Math.min(100, Math.round(((contacted * 2 + responded * 3 + visits * 5) / (outreach.length * 10)) * 100));
  }, [outreach]);

  const overallScore = useMemo(() => {
    return Math.round((profileScore * 0.25 + videoScore * 0.2 + academicScore * 0.3 + outreachScore * 0.25));
  }, [profileScore, videoScore, academicScore, outreachScore]);

  const scoreColor = (s: number) => (s >= 75 ? "text-green-400" : s >= 50 ? "text-yellow-400" : s >= 25 ? "text-orange-400" : "text-red-400");

  const responseRate = useMemo(() => {
    const contacted = outreach.filter((o) => o.contacted).length;
    if (contacted === 0) return 0;
    return Math.round((outreach.filter((o) => o.responded).length / contacted) * 100);
  }, [outreach]);

  const addSchool = () => {
    if (!newSchool.trim()) return;
    setOutreach((prev) => [...prev, {
      school: newSchool.trim(), division: newDiv,
      contacted: false, responded: false, campVisit: false,
      officialVisit: false, unofficialVisit: false, offerReceived: false,
    }]);
    setNewSchool("");
  };

  const toggleOutreach = (idx: number, field: keyof OutreachEntry) => {
    setOutreach((prev) => prev.map((e, i) => i === idx ? { ...e, [field]: !e[field] } : e));
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-6">
              <Shield className="w-3.5 h-3.5" /> SOFTBALL RECRUITING AUDIT
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-primary">Softball</span> Recruitment Audit
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Complete audit of your recruiting readiness — profile, academics, video, outreach, and timeline.
            </p>
          </motion.div>

          {/* Overall Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="mt-8 inline-flex flex-col items-center"
          >
            <div className="relative w-32 h-32 rounded-full border-4 border-primary/30 flex items-center justify-center bg-card">
              <span className={`text-4xl font-bold ${scoreColor(overallScore)}`}>{overallScore}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Overall Readiness Score</p>
            <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
              <span>Profile: <strong className={scoreColor(profileScore)}>{profileScore}%</strong></span>
              <span>Video: <strong className={scoreColor(videoScore)}>{videoScore}%</strong></span>
              <span>Academic: <strong className={scoreColor(academicScore)}>{academicScore}%</strong></span>
              <span>Outreach: <strong className={scoreColor(outreachScore)}>{outreachScore}%</strong></span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Tabs */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full flex flex-wrap gap-1 bg-card/50 border border-border p-1 rounded-lg h-auto">
            {[
              { v: "profile", l: "Profile", i: FileText },
              { v: "academic", l: "Academics", i: GraduationCap },
              { v: "video", l: "Video", i: Video },
              { v: "pitching", l: "Pitching", i: Zap },
              { v: "outreach", l: "Outreach", i: Mail },
              { v: "showcases", l: "Showcases", i: Trophy },
              { v: "timeline", l: "Timeline", i: Calendar },
              { v: "titleix", l: "Title IX", i: Scale },
            ].map(({ v, l, i: Icon }) => (
              <TabsTrigger key={v} value={v} className="flex items-center gap-1.5 text-xs data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-300">
                <Icon className="w-3.5 h-3.5" /> {l}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Profile ─────────────────────────────────────────── */}
          <TabsContent value="profile">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Recruiting Profile Checklist
              </h2>
              <p className="text-sm text-muted-foreground mb-4">Complete each item to maximize your exposure to college coaches.</p>
              <div className="grid gap-3">
                {PROFILE_SECTIONS.map((s) => (
                  <label key={s.key} className="flex items-center gap-3 p-3 rounded-md bg-background/50 border border-border cursor-pointer hover:border-purple-500/30 transition-colors">
                    <Checkbox
                      checked={profileChecks[s.key]}
                      onCheckedChange={(c) => setProfileChecks((p) => ({ ...p, [s.key]: !!c }))}
                    />
                    <span className="text-sm">{s.label}</span>
                    {profileChecks[s.key] && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />}
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Completeness</span>
                  <span className={`font-bold ${scoreColor(profileScore)}`}>{profileScore}%</span>
                </div>
                <Progress value={profileScore} className="h-2 bg-muted [&>div]:bg-primary" />
              </div>
            </div>
          </TabsContent>

          {/* ── Academic ────────────────────────────────────────── */}
          <TabsContent value="academic">
            <div className="space-y-6">
              {/* GPA / SAT / ACT */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" /> Academic Tracker
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">GPA</label>
                    <input type="number" step="0.1" min="0" max="4" value={gpa}
                      onChange={(e) => setGpa(parseFloat(e.target.value) || 0)}
                      className="w-full bg-background border border-border rounded px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">SAT Score</label>
                    <input type="number" min="400" max="1600" value={sat}
                      onChange={(e) => setSat(parseInt(e.target.value) || 0)}
                      className="w-full bg-background border border-border rounded px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">ACT Score</label>
                    <input type="number" min="1" max="36" value={act}
                      onChange={(e) => setAct(parseInt(e.target.value) || 0)}
                      className="w-full bg-background border border-border rounded px-3 py-2 text-sm" />
                  </div>
                </div>

                {/* Division comparison */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-3">Division Eligibility</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="text-left py-2 pr-4">Division</th>
                          <th className="text-center py-2 px-2">Min GPA</th>
                          <th className="text-center py-2 px-2">Your GPA</th>
                          <th className="text-center py-2 px-2">Min SAT</th>
                          <th className="text-center py-2 px-2">Your SAT</th>
                          <th className="text-center py-2 px-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(DIVISION_GPA).map(([div, minGpa]) => {
                          const meetsGpa = gpa >= minGpa;
                          const meetsSat = DIVISION_SAT[div] === 0 || sat >= DIVISION_SAT[div];
                          const eligible = meetsGpa && meetsSat;
                          return (
                            <tr key={div} className="border-b border-border/50">
                              <td className="py-2 pr-4 font-medium">{div}</td>
                              <td className="text-center py-2 px-2">{minGpa}</td>
                              <td className={`text-center py-2 px-2 font-bold ${meetsGpa ? "text-green-400" : "text-red-400"}`}>{gpa.toFixed(1)}</td>
                              <td className="text-center py-2 px-2">{DIVISION_SAT[div] || "N/A"}</td>
                              <td className={`text-center py-2 px-2 font-bold ${meetsSat ? "text-green-400" : "text-red-400"}`}>{sat}</td>
                              <td className="text-center py-2 px-2">
                                {eligible ? <CheckCircle2 className="w-4 h-4 text-green-400 inline" /> : <XCircle className="w-4 h-4 text-red-400 inline" />}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Core Courses */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> NCAA Core Course Requirements (16 courses)
                </h3>
                <div className="grid gap-2">
                  {CORE_COURSES.map((c) => (
                    <label key={c} className="flex items-center gap-3 p-2 rounded bg-background/50 border border-border cursor-pointer text-xs">
                      <Checkbox checked={coreCourses[c]} onCheckedChange={(v) => setCoreCourses((p) => ({ ...p, [c]: !!v }))} />
                      {c}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {Object.values(coreCourses).filter(Boolean).length}/{CORE_COURSES.length} areas completed
                </p>
              </div>

              {/* NCAA / NAIA Checklist */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Clearinghouse Registration
                </h3>
                <div className="grid gap-2">
                  {NCAA_CHECKLIST.map((c) => (
                    <label key={c} className="flex items-center gap-3 p-2 rounded bg-background/50 border border-border cursor-pointer text-xs">
                      <Checkbox checked={ncaaChecks[c]} onCheckedChange={(v) => setNcaaChecks((p) => ({ ...p, [c]: !!v }))} />
                      {c}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Video ───────────────────────────────────────────── */}
          <TabsContent value="video">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
                <Video className="w-5 h-5" /> Video Portfolio Audit
              </h2>

              {/* Checklist */}
              <div className="grid gap-3">
                {([
                  { key: "hitting" as const, label: "Hitting Video", tips: "Front toss, live ABs, exit velo overlay. Show swing from multiple angles.", coachLook: "Bat speed, approach, power potential, pitch recognition." },
                  { key: "pitching" as const, label: "Pitching / Windmill Video", tips: "Show all pitches, include velocity readings, film from behind and side.", coachLook: "Arm circle mechanics, velocity, command, pitch mix variety." },
                  { key: "defensive" as const, label: "Defensive Video", tips: "Ground balls, pop flies, transfers, throws. Show first-step quickness.", coachLook: "Range, hands, arm accuracy, footwork, game awareness." },
                  { key: "highlight" as const, label: "Highlight Reel (90 sec max)", tips: "Best plays from games. Lead with your most impressive skill. Include name/grad year overlay.", coachLook: "Overall athleticism, competitiveness, coachability." },
                ]).map(({ key, label, tips, coachLook }) => (
                  <div key={key} className="p-4 rounded-md bg-background/50 border border-border">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox checked={videoChecks[key]} onCheckedChange={(v) => setVideoChecks((p) => ({ ...p, [key]: !!v }))} />
                      <span className="font-medium text-sm">{label}</span>
                      {videoChecks[key] && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />}
                    </label>
                    <div className="ml-7 mt-2 text-xs text-muted-foreground space-y-1">
                      <p><strong className="text-purple-300">Tips:</strong> {tips}</p>
                      <p><strong className="text-primary">Coaches look for:</strong> {coachLook}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200">
                <Info className="w-4 h-4 inline mr-1" />
                <strong>Pro tip:</strong> Keep your highlight reel under 90 seconds. College coaches watch hundreds — put your best plays first.
              </div>
            </div>
          </TabsContent>

          {/* ── Pitching ────────────────────────────────────────── */}
          <TabsContent value="pitching">
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                    <Zap className="w-5 h-5" /> Pitcher Profile
                  </h2>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Checkbox checked={isPitcher} onCheckedChange={(v) => setIsPitcher(!!v)} />
                    I am a pitcher
                  </label>
                </div>

                {!isPitcher ? (
                  <p className="text-sm text-muted-foreground">Check "I am a pitcher" above to unlock pitching-specific analysis.</p>
                ) : (
                  <div className="space-y-6">
                    {/* Velocity */}
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Fastball Velocity (mph)</label>
                      <input type="number" min="30" max="80" value={pitchVelo}
                        onChange={(e) => setPitchVelo(parseInt(e.target.value) || 0)}
                        className="w-32 bg-background border border-border rounded px-3 py-2 text-sm" />
                      <div className="mt-4 space-y-2">
                        {Object.entries(PITCHER_VELO).map(([div, { min, max }]) => {
                          const pct = Math.min(100, Math.max(0, ((pitchVelo - 45) / (72 - 45)) * 100));
                          const minPct = ((min - 45) / (72 - 45)) * 100;
                          const maxPct = ((max - 45) / (72 - 45)) * 100;
                          const inRange = pitchVelo >= min;
                          return (
                            <div key={div} className="flex items-center gap-3 text-xs">
                              <span className="w-24 text-muted-foreground">{div}</span>
                              <div className="flex-1 h-3 bg-muted rounded-full relative overflow-hidden">
                                <div className="absolute h-full bg-purple-500/20 rounded-full" style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }} />
                                <div className={`absolute h-full rounded-full ${inRange ? "bg-primary" : "bg-red-500/60"}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className={`w-16 text-right font-mono ${inRange ? "text-green-400" : "text-muted-foreground"}`}>{min}-{max}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Arsenal */}
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Pitch Arsenal</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {PITCH_ARSENAL.map((p) => (
                          <label key={p} className="flex items-center gap-2 p-2 bg-background/50 border border-border rounded text-xs cursor-pointer">
                            <Checkbox checked={pitchArsenal[p]} onCheckedChange={(v) => setPitchArsenal((prev) => ({ ...prev, [p]: !!v }))} />
                            {p}
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {Object.values(pitchArsenal).filter(Boolean).length} pitches — D1 pitchers typically throw 4-5 quality pitches.
                      </p>
                    </div>

                    {/* Pitch grades */}
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Key Pitch Grades (20-80)</h3>
                      {PITCH_GRADES.map((p) => (
                        <div key={p} className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{p}</span>
                            <span className="text-primary font-mono">{pitchGrades[p]} — {gradeLabel(pitchGrades[p])}</span>
                          </div>
                          <input type="range" min={20} max={80} step={5} value={pitchGrades[p]}
                            onChange={(e) => setPitchGrades((prev) => ({ ...prev, [p]: parseInt(e.target.value) }))}
                            className="w-full accent-primary" />
                        </div>
                      ))}
                    </div>

                    {/* Mechanics */}
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Mechanics Self-Assessment</h3>
                      {([
                        { key: "stride" as const, label: "Power stride — long, aggressive stride toward target" },
                        { key: "armCircle" as const, label: "Full arm circle — complete windmill motion" },
                        { key: "hipClose" as const, label: "Hip closure — hips snap closed at release" },
                        { key: "followThrough" as const, label: "Follow through — hand finishes past hip" },
                      ]).map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-3 p-2 bg-background/50 border border-border rounded text-xs mb-2 cursor-pointer">
                          <Checkbox checked={mechanics[key]} onCheckedChange={(v) => setMechanics((prev) => ({ ...prev, [key]: !!v }))} />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── Outreach ────────────────────────────────────────── */}
          <TabsContent value="outreach">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                <Mail className="w-5 h-5" /> Outreach Tracker
              </h2>

              {/* Add school */}
              <div className="flex gap-2 flex-wrap">
                <input placeholder="School name" value={newSchool} onChange={(e) => setNewSchool(e.target.value)}
                  className="flex-1 min-w-[180px] bg-background border border-border rounded px-3 py-2 text-sm" />
                <select value={newDiv} onChange={(e) => setNewDiv(e.target.value)}
                  className="bg-background border border-border rounded px-3 py-2 text-sm">
                  {["D1", "D2", "D3", "NAIA", "NJCAA"].map((d) => <option key={d}>{d}</option>)}
                </select>
                <Button onClick={addSchool} size="sm" className="bg-purple-600 hover:bg-purple-700">Add</Button>
              </div>

              {outreach.length > 0 && (
                <>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Schools: <strong className="text-foreground">{outreach.length}</strong></span>
                    <span>Contacted: <strong className="text-foreground">{outreach.filter((o) => o.contacted).length}</strong></span>
                    <span>Responded: <strong className="text-foreground">{outreach.filter((o) => o.responded).length}</strong></span>
                    <span>Response Rate: <strong className={scoreColor(responseRate)}>{responseRate}%</strong></span>
                    <span>Offers: <strong className="text-primary">{outreach.filter((o) => o.offerReceived).length}</strong></span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="text-left py-2">School</th>
                          <th className="text-center py-2">Div</th>
                          <th className="text-center py-2">Contacted</th>
                          <th className="text-center py-2">Response</th>
                          <th className="text-center py-2">Camp</th>
                          <th className="text-center py-2">Unofficial</th>
                          <th className="text-center py-2">Official</th>
                          <th className="text-center py-2">Offer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {outreach.map((entry, idx) => (
                          <tr key={idx} className="border-b border-border/50">
                            <td className="py-2 font-medium">{entry.school}</td>
                            <td className="text-center py-2 text-purple-300">{entry.division}</td>
                            {(["contacted", "responded", "campVisit", "unofficialVisit", "officialVisit", "offerReceived"] as const).map((f) => (
                              <td key={f} className="text-center py-2">
                                <Checkbox checked={entry[f] as boolean} onCheckedChange={() => toggleOutreach(idx, f)} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {outreach.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Add schools to begin tracking your outreach progress.</p>
              )}
            </div>
          </TabsContent>

          {/* ── Showcases ───────────────────────────────────────── */}
          <TabsContent value="showcases">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                <Trophy className="w-5 h-5" /> Softball Showcase Calendar
              </h2>
              <div className="grid gap-3">
                {SHOWCASE_ORGS.map((s) => (
                  <div key={s.name} className="p-4 bg-background/50 border border-border rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold">{s.name}</h3>
                        <p className="text-xs text-muted-foreground">{s.org} • {s.region}</p>
                      </div>
                      <span className="text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded px-2 py-0.5">{s.when}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1"><strong>Best for:</strong> {s.bestFor}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded text-xs text-purple-200">
                <Info className="w-4 h-4 inline mr-1" />
                Attend showcases where your target college coaches will be present. Check event websites for attending college lists.
              </div>

              {/* When to attend by grade */}
              <div className="mt-4">
                <h3 className="text-sm font-bold mb-3">When to Attend by Grade Year</h3>
                <div className="grid gap-2 text-xs">
                  {[
                    { grade: "8th–Freshman", tip: "Local ID camps, begin club team showcases" },
                    { grade: "Sophomore", tip: "Regional showcases, first national events" },
                    { grade: "Junior", tip: "All major national showcases — this is peak exposure year" },
                    { grade: "Senior", tip: "Targeted events only at schools still recruiting" },
                  ].map((s) => (
                    <div key={s.grade} className="flex gap-3 p-2 bg-background/50 border border-border rounded">
                      <span className="text-primary font-bold w-28 shrink-0">{s.grade}</span>
                      <span className="text-muted-foreground">{s.tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Timeline ────────────────────────────────────────── */}
          <TabsContent value="timeline">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Recruiting Timeline by Grade Year
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {Object.entries(TIMELINE).map(([key, { title, color, items }]) => (
                  <AccordionItem key={key} value={key} className="border border-border rounded-lg px-4 bg-background/30">
                    <AccordionTrigger className={`text-sm font-bold ${color}`}>{title}</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${color}`} /> {item}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>

          {/* ── Title IX ────────────────────────────────────────── */}
          <TabsContent value="titleix">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                <Scale className="w-5 h-5" /> Title IX Advantage
              </h2>
              <p className="text-sm text-muted-foreground">
                Title IX requires colleges to provide equal athletic opportunities for women. This creates significant advantages for softball players in the recruiting process.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TITLE_IX_FACTS.map((f) => (
                  <div key={f.label} className="text-center p-4 bg-background/50 border border-purple-500/20 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{f.stat}</div>
                    <div className="text-xs font-medium mt-1">{f.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{f.detail}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-background/50 border border-border rounded-lg">
                  <h3 className="text-sm font-bold text-purple-300 mb-2">Scholarship Equivalency vs Headcount</h3>
                  <p className="text-xs text-muted-foreground">
                    Softball is an <strong className="text-foreground">equivalency sport</strong> — coaches can split scholarships among multiple athletes.
                    D1 programs have 11.7 equivalencies to distribute across 20+ roster spots. This means most athletes receive partial scholarships (30-70% of costs),
                    often combined with academic aid to create full packages. Understanding this helps you negotiate better.
                  </p>
                </div>

                <div className="p-4 bg-background/50 border border-border rounded-lg">
                  <h3 className="text-sm font-bold text-purple-300 mb-2">More Programs = More Opportunities</h3>
                  <p className="text-xs text-muted-foreground">
                    There are over <strong className="text-foreground">310 NCAA D1 softball programs</strong> compared to ~300 D1 baseball programs.
                    Combined with D2 (300+), D3 (400+), NAIA (200+), and NJCAA (400+) programs, there are over <strong className="text-foreground">1,400 college softball programs</strong> in the U.S.
                    This creates far more roster spots and scholarship money available compared to many other women's sports.
                  </p>
                </div>

                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <h3 className="text-sm font-bold text-purple-300 mb-2">How to Leverage This in Conversations</h3>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" /> Ask coaches directly about available scholarship percentages</li>
                    <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" /> Inquire about academic aid stacking on top of athletic aid</li>
                    <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" /> Compare total cost of attendance across programs, not just scholarship %</li>
                    <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" /> Understand that walk-on spots can convert to scholarship positions</li>
                    <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" /> D2 and NAIA programs often have more per-player scholarship money than D1</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <Footer />
    </div>
  );
};

export default SoftballRecruitmentAudit;
