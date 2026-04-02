import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, BookOpen, AlertTriangle, Clock, Shield,
  ChevronDown, ChevronUp, DollarSign, FileText, Users,
  CheckCircle2, Info, Star, Trophy
} from "lucide-react";
import { useSport } from "@/contexts/SportContext";

const RECRUITING_STEPS = [
  { title: "Build Your Athletic Profile", desc: "Create highlight videos, record verified stats, and maintain academic eligibility. This is your athlete's digital resume." },
  { title: "Research Programs", desc: "Identify 30-50 schools across all divisions. Look at roster sizes, graduation rates, and coaching staff stability." },
  { title: "Initiate Contact", desc: "Email coaches with a brief intro, stats, schedule, and video link. Follow NCAA contact rules for your sport." },
  { title: "Attend Camps & Showcases", desc: "Prioritize ID camps at target schools. College coaches evaluate talent in these controlled settings." },
  { title: "Campus Visits", desc: "Schedule unofficial visits first (free, unlimited). Official visits (5 max for D1/D2) come when there's mutual interest." },
  { title: "Evaluate Offers", desc: "Compare financial packages, academic fit, playing time projections, and program culture before committing." },
  { title: "Sign NLI / Commit", desc: "National Letter of Intent is a binding agreement. Verbal commits are non-binding. Understand the difference." },
];

const TIMELINE_DATA = [
  { year: "8th Grade", focus: "Early Development", items: ["Focus 100% on skill development and love of the game", "Begin tracking measurable stats (velocity, times, etc.)", "Maintain strong academic habits — GPA starts counting", "Attend local showcases for exposure and experience"] },
  { year: "Freshman (9th)", focus: "Foundation Building", items: ["Register with NCAA Eligibility Center", "Start core course tracking (16 required)", "Build initial highlight video", "Create target school spreadsheet", "Begin attending regional showcases"] },
  { year: "Sophomore (10th)", focus: "First Coach Contacts", items: ["NCAA rules allow coaches to send materials starting June 15 after sophomore year", "Send introductory emails to 30+ programs", "Attend college ID camps at target schools", "Take PSAT for academic scholarship positioning", "Update highlight video with varsity footage"] },
  { year: "Junior (11th)", focus: "Peak Recruiting Window", items: ["This is THE most critical recruiting year", "Coaches can call/text starting June 15 after junior year", "Schedule unofficial visits to top 5-10 schools", "Take SAT/ACT — aim for scores above D1 minimums", "Attend premier showcases (PBR, PG, NFCA, PGF)", "Begin narrowing school list to 10-15 serious targets", "Request official visits when offered"] },
  { year: "Senior (12th)", focus: "Final Opportunities", items: ["Early signing period: mid-November", "Regular signing period: mid-April", "Walk-on opportunities remain available", "Transfer portal is a growing option", "Finalize academic eligibility requirements", "Complete FAFSA for financial aid stacking"] },
];

const RED_FLAGS = [
  { flag: "Guaranteed scholarships for a fee", detail: "No legitimate recruiting service can guarantee scholarship offers. Coaches make those decisions independently." },
  { flag: "Pressure to sign immediately", detail: "Legitimate programs give families time to evaluate. High-pressure tactics indicate a scam or desperate program." },
  { flag: "No verifiable track record", detail: "Ask for specific athletes they've placed and contact those families. Real services have real results." },
  { flag: "Charges thousands upfront", detail: "Services charging $3,000-$10,000+ with vague promises are often predatory. Free platforms like NCSA offer basic profiles." },
  { flag: "Claims 'inside connections'", detail: "NCAA rules prohibit third-party involvement in recruiting decisions. No one has special influence over coaches." },
  { flag: "Won't let you talk to references", detail: "Any reputable service should freely provide references from families they've helped." },
];

const FERPA_NLI = [
  { q: "What is the NLI?", a: "The National Letter of Intent is a binding agreement between a prospective student-athlete and an NCAA Division I or II institution. Once signed, you agree to attend that school for one academic year in exchange for athletic financial aid." },
  { q: "Can I back out of an NLI?", a: "Only under specific release conditions: coaching change, medical reasons, or program elimination. Otherwise, transferring means sitting out one year and losing a year of eligibility." },
  { q: "What is FERPA?", a: "The Family Educational Rights and Privacy Act protects your student's educational records. Once they turn 18, YOU (the parent) no longer have automatic access to grades, transcripts, or disciplinary records without the student's written consent." },
  { q: "Verbal commit vs. NLI — what's the difference?", a: "A verbal commitment is non-binding — either party can walk away. The NLI is a legal contract. Never assume a verbal commit is final until the NLI is signed." },
];

const ParentRecruitingEducation = () => {
  const { sport } = useSport();
  const isSoftball = sport === "softball";
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [expandedTimeline, setExpandedTimeline] = useState<number | null>(2);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="p-6 lg:p-10 max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isSoftball ? "bg-purple-500/10" : "bg-primary/10"}`}>
          <BookOpen className={`w-6 h-6 ${isSoftball ? "text-purple-400" : "text-primary"}`} />
        </div>
        <div>
          <h1 className="text-2xl font-display text-foreground">RECRUITING EDUCATION</h1>
          <p className="text-sm text-muted-foreground">Everything parents need to know about college {isSoftball ? "softball" : "baseball"} recruiting</p>
        </div>
      </div>

      {/* How College Recruiting Works */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
          <GraduationCap className={`w-5 h-5 ${isSoftball ? "text-purple-400" : "text-primary"}`} />
          How College Recruiting Works
        </h3>
        <div className="space-y-2">
          {RECRUITING_STEPS.map((step, i) => (
            <button key={i} onClick={() => setExpandedStep(expandedStep === i ? null : i)}
              className="w-full text-left bg-secondary hover:bg-secondary/80 rounded-xl p-4 transition-all">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isSoftball ? "bg-purple-500/20 text-purple-400" : "bg-primary/20 text-primary"}`}>
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-foreground flex-1">{step.title}</span>
                {expandedStep === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
              {expandedStep === i && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  className="text-xs text-muted-foreground mt-3 ml-10">{step.desc}</motion.p>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Scholarship Differences */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
          <DollarSign className={`w-5 h-5 ${isSoftball ? "text-purple-400" : "text-primary"}`} />
          {isSoftball ? "Softball" : "Baseball"} vs {isSoftball ? "Baseball" : "Softball"} Scholarship Differences
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className={`rounded-xl p-4 border ${isSoftball ? "border-purple-500/20 bg-purple-500/5" : "border-primary/20 bg-primary/5"}`}>
            <p className="font-display text-foreground mb-2">⚾ Baseball (D1)</p>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>• <strong className="text-foreground">11.7 equivalency scholarships</strong> split among ~35 roster players</li>
              <li>• Average scholarship: 33% of full ride</li>
              <li>• Most players receive partial scholarships</li>
              <li>• Walk-on opportunities are common</li>
            </ul>
          </div>
          <div className={`rounded-xl p-4 border ${isSoftball ? "border-purple-500/20 bg-purple-500/5" : "border-primary/20 bg-primary/5"}`}>
            <p className="font-display text-foreground mb-2">🥎 Softball (D1)</p>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>• <strong className="text-foreground">12 equivalency scholarships</strong> split among ~20 roster players</li>
              <li>• Average scholarship: 60% of full ride</li>
              <li>• More money per athlete due to smaller rosters</li>
              <li>• Title IX creates more funding opportunities</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-4 bg-secondary rounded-xl">
          <p className="text-xs font-medium text-foreground flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-blue-400" /> Headcount vs Equivalency Explained
          </p>
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Headcount scholarships</strong> (Football, Basketball) are full rides — each counts as one scholarship regardless of amount.
            <strong className="text-foreground"> Equivalency scholarships</strong> ({isSoftball ? "Softball" : "Baseball"}, Track, etc.) can be divided among multiple athletes.
            A coach with 12 equivalencies could give 12 full rides or 24 half-scholarships.
            This is why understanding the "scholarship pie" matters — your athlete is competing for a slice, not the whole thing.
          </p>
        </div>
      </motion.div>

      {/* Timeline Guide */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
          <Clock className={`w-5 h-5 ${isSoftball ? "text-purple-400" : "text-primary"}`} />
          Recruiting Timeline by Grade Year
        </h3>
        <div className="space-y-2">
          {TIMELINE_DATA.map((t, i) => (
            <button key={i} onClick={() => setExpandedTimeline(expandedTimeline === i ? null : i)}
              className="w-full text-left bg-secondary hover:bg-secondary/80 rounded-xl p-4 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${i === 3 ? (isSoftball ? "bg-purple-500/20 text-purple-400" : "bg-primary/20 text-primary") : "bg-muted text-muted-foreground"}`}>
                    {t.year}
                  </span>
                  <span className="text-sm font-medium text-foreground">{t.focus}</span>
                  {i === 3 && <Star className="w-3.5 h-3.5 text-primary" />}
                </div>
                {expandedTimeline === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
              {expandedTimeline === i && (
                <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-3 ml-2 space-y-1.5">
                  {t.items.map((item, j) => (
                    <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 mt-0.5 text-green-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </motion.ul>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Red Flags */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Red Flags to Watch For
        </h3>
        <div className="space-y-3">
          {RED_FLAGS.map((rf, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">{rf.flag}</p>
                <p className="text-xs text-muted-foreground mt-1">{rf.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* How to Communicate with Coaches */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
          <Users className={`w-5 h-5 ${isSoftball ? "text-purple-400" : "text-primary"}`} />
          How to Communicate with College Coaches
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-xl">
            <p className="text-xs font-bold text-green-500 mb-2">✓ DO</p>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>• Have the <strong className="text-foreground">athlete</strong> initiate contact — coaches want to hear from the player</li>
              <li>• Keep emails brief: name, grad year, position, GPA, stats, video link, schedule</li>
              <li>• Follow up every 3-4 weeks with updates (new stats, schedule changes)</li>
              <li>• Ask specific questions about the program that show you've done research</li>
              <li>• Be honest about other schools being considered</li>
            </ul>
          </div>
          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
            <p className="text-xs font-bold text-red-400 mb-2">✗ DON'T</p>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>• Don't have parents do all the communicating — it's a red flag to coaches</li>
              <li>• Don't send mass emails with "Dear Coach" — personalize each one</li>
              <li>• Don't exaggerate stats or abilities — coaches verify everything</li>
              <li>• Don't ask about scholarships in the first email</li>
              <li>• Don't bad-mouth other programs or coaches</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* FERPA & NLI */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
          <Shield className={`w-5 h-5 ${isSoftball ? "text-purple-400" : "text-primary"}`} />
          FERPA Rights & Signing the NLI
        </h3>
        <div className="space-y-2">
          {FERPA_NLI.map((faq, i) => (
            <button key={i} onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
              className="w-full text-left bg-secondary hover:bg-secondary/80 rounded-xl p-4 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{faq.q}</span>
                {expandedFaq === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
              {expandedFaq === i && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-xs text-muted-foreground mt-3">{faq.a}</motion.p>
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ParentRecruitingEducation;
