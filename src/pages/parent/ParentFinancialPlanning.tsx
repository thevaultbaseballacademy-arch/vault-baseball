import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, School, ExternalLink,
  ChevronDown, ChevronUp, Info, CheckCircle2, Star, Scale
} from "lucide-react";
import { useSport } from "@/contexts/SportContext";

const DIVISION_COSTS = [
  {
    division: "D1 (Power 5)",
    tuition: "$45,000 – $65,000",
    avgScholarship: "33% (Baseball) / 60% (Softball)",
    netCost: "$15,000 – $43,000/yr",
    notes: "Highest competition. Full rides rare in equivalency sports. Academic aid can stack.",
  },
  {
    division: "D1 (Mid-Major)",
    tuition: "$25,000 – $45,000",
    avgScholarship: "25-50%",
    netCost: "$12,500 – $33,750/yr",
    notes: "Strong competition with better scholarship-to-roster ratios at some programs.",
  },
  {
    division: "D2",
    tuition: "$15,000 – $35,000",
    avgScholarship: "30-60%",
    netCost: "$6,000 – $24,500/yr",
    notes: "9 equivalency scholarships (baseball), 7.2 (softball). Often excellent value.",
  },
  {
    division: "D3",
    tuition: "$35,000 – $60,000",
    avgScholarship: "0% athletic (academic only)",
    netCost: "$10,000 – $40,000/yr",
    notes: "No athletic scholarships. Strong academic and need-based aid available.",
  },
  {
    division: "NAIA",
    tuition: "$15,000 – $30,000",
    avgScholarship: "40-80%",
    netCost: "$3,000 – $18,000/yr",
    notes: "12 equivalency scholarships. Often the best value for mid-tier recruits.",
  },
  {
    division: "JUCO",
    tuition: "$3,000 – $12,000",
    avgScholarship: "50-100%",
    netCost: "$0 – $6,000/yr",
    notes: "24 equivalency scholarships (baseball). Excellent development pathway.",
  },
];

const WALKON_INFO = [
  {
    type: "Preferred Walk-On",
    desc: "The coach has recruited you and wants you on the roster. You're guaranteed a spot but receive no athletic scholarship initially. Many earn scholarships after freshman year.",
    pros: ["Guaranteed roster spot", "Full access to facilities/training", "Can earn scholarship later", "Counts toward recruiting class"],
    cons: ["No initial athletic financial aid", "Must pay full tuition Year 1", "No NLI protection"],
  },
  {
    type: "Regular Walk-On",
    desc: "You try out for the team with no guarantee. Open tryouts are competitive — most D1 programs cut 80-90% of walk-on candidates.",
    pros: ["No commitment required beforehand", "Can try out at dream school", "Low pressure"],
    cons: ["No guaranteed spot", "High cut rate", "May never see playing time", "No scholarship path in many programs"],
  },
];

const STACKING_TIPS = [
  { title: "FAFSA First", desc: "Complete the Free Application for Federal Student Aid (FAFSA) as early as October 1. This unlocks Pell Grants, federal loans, and institutional aid." },
  { title: "Academic Merit Scholarships", desc: "Many schools offer $5,000-$25,000/yr in academic scholarships. These stack ON TOP of athletic aid at D1 and D2 (D3 has no athletic aid to stack with, but academic aid is often generous)." },
  { title: "Department Scholarships", desc: "Apply for scholarships within your intended major's department. These are often overlooked and can add $1,000-$5,000/yr." },
  { title: "State Grants", desc: "Many states offer need-based and merit-based grants for in-state students. Research your state's higher education agency." },
  { title: "Outside Scholarships", desc: "Apply to 20+ external scholarships. Even $500-$1,000 awards add up. Use platforms like Fastweb, Scholarships.com, and local community foundations." },
  { title: "Negotiate the Package", desc: "Athletic scholarships are negotiable. If you have offers from comparable programs, respectfully share that. Coaches have flexibility to adjust packages." },
];

const ParentFinancialPlanning = () => {
  const { sport } = useSport();
  const isSoftball = sport === "softball";
  const [expandedDiv, setExpandedDiv] = useState<number | null>(null);
  const accent = isSoftball ? "text-purple-400" : "text-primary";
  const accentBg = isSoftball ? "bg-purple-500/10" : "bg-primary/10";
  const accentBorder = isSoftball ? "border-purple-500/20" : "border-primary/20";

  return (
    <div className="p-6 lg:p-10 max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accentBg}`}>
          <DollarSign className={`w-6 h-6 ${accent}`} />
        </div>
        <div>
          <h1 className="text-2xl font-display text-foreground">FINANCIAL PLANNING</h1>
          <p className="text-sm text-muted-foreground">Understanding the true cost of college {isSoftball ? "softball" : "baseball"}</p>
        </div>
      </div>

      {/* Key Insight Banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-2xl border ${accentBorder} ${isSoftball ? "bg-purple-500/5" : "bg-primary/5"}`}>
        <p className={`text-xs font-bold ${accent} flex items-center gap-2 mb-1`}>
          <Star className="w-3.5 h-3.5" /> KEY INSIGHT
        </p>
        <p className="text-sm text-foreground">
          {isSoftball
            ? "D1 softball has 12 equivalency scholarships for ~20 roster players — averaging 60% per athlete. This is significantly more generous than baseball's 11.7 for ~35 players (33% average)."
            : "D1 baseball has 11.7 equivalency scholarships for ~35 roster players — averaging 33% per athlete. Understanding this helps set realistic financial expectations."
          }
        </p>
      </motion.div>

      {/* Cost Comparison Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className={`w-5 h-5 ${accent}`} />
          Cost Comparison by Division
        </h3>
        <div className="space-y-2">
          {DIVISION_COSTS.map((d, i) => (
            <button key={i} onClick={() => setExpandedDiv(expandedDiv === i ? null : i)}
              className="w-full text-left bg-secondary hover:bg-secondary/80 rounded-xl p-4 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <School className={`w-4 h-4 ${accent} shrink-0`} />
                  <span className="text-sm font-medium text-foreground">{d.division}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground hidden sm:block">{d.netCost}</span>
                  {expandedDiv === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>
              {expandedDiv === i && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 ml-7 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Tuition Range:</span> <span className="text-foreground font-medium">{d.tuition}</span></div>
                    <div><span className="text-muted-foreground">Avg Scholarship:</span> <span className="text-foreground font-medium">{d.avgScholarship}</span></div>
                    <div><span className="text-muted-foreground">Net Annual Cost:</span> <span className={`font-medium ${accent}`}>{d.netCost}</span></div>
                  </div>
                  <p className="text-xs text-muted-foreground">{d.notes}</p>
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Walk-On Opportunities */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
          <Scale className={`w-5 h-5 ${accent}`} />
          Walk-On Opportunities Explained
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {WALKON_INFO.map((w, i) => (
            <div key={i} className={`rounded-xl p-4 border ${accentBorder} ${isSoftball ? "bg-purple-500/5" : "bg-primary/5"}`}>
              <p className="font-display text-foreground mb-2">{w.type}</p>
              <p className="text-xs text-muted-foreground mb-3">{w.desc}</p>
              <div className="space-y-1">
                {w.pros.map((p, j) => (
                  <p key={j} className="text-xs text-green-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 shrink-0" /> {p}
                  </p>
                ))}
                {w.cons.map((c, j) => (
                  <p key={j} className="text-xs text-red-400 flex items-center gap-1.5">
                    <Info className="w-3 h-3 shrink-0" /> {c}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* How to Stack Scholarships */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
          <DollarSign className={`w-5 h-5 ${accent}`} />
          How to Stack Academic + Athletic Scholarships
        </h3>
        <div className="space-y-3">
          {STACKING_TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-secondary rounded-xl">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${accentBg} ${accent}`}>
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{tip.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* EFC Link */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className={`p-4 rounded-2xl border ${accentBorder} ${isSoftball ? "bg-purple-500/5" : "bg-primary/5"}`}>
        <p className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
          <ExternalLink className={`w-4 h-4 ${accent}`} />
          Expected Family Contribution (EFC) Calculator
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          Before negotiating any financial package, calculate your family's Expected Family Contribution using the official FAFSA4caster tool.
          This number is what colleges use to determine your need-based aid eligibility.
        </p>
        <a href="https://studentaid.gov/aid-estimator/" target="_blank" rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg ${accentBg} ${accent} hover:opacity-80 transition-opacity`}>
          <ExternalLink className="w-3.5 h-3.5" />
          Open Federal Student Aid Estimator
        </a>
      </motion.div>
    </div>
  );
};

export default ParentFinancialPlanning;
