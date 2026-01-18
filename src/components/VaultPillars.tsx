import { motion } from "framer-motion";
import { Zap, Dumbbell, Shuffle, Heart, Target, ArrowRight, Activity, CheckCircle2, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const pillars: {
  letter: string;
  name: string;
  icon: typeof Zap;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  description: string;
  focus: string[];
  metrics: string[];
  badge?: string;
  preSale?: string;
  link?: string;
}[] = [
  {
    letter: "V",
    name: "Velocity",
    icon: Zap,
    color: "from-red-500 to-orange-500",
    bgColor: "bg-red-500/10",
    textColor: "text-red-500",
    borderColor: "border-red-500/30 hover:border-red-500/60",
    description: "Develop athletes capable of producing and transferring force efficiently to maximize performance output.",
    focus: ["Intent-based training", "Ground force utilization", "Rotational sequencing", "Efficient energy transfer"],
    metrics: ["Exit velocity", "Pitch velocity", "Rotational power", "Jump metrics"],
  },
  {
    letter: "A",
    name: "Athleticism",
    icon: Dumbbell,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-500",
    borderColor: "border-blue-500/30 hover:border-blue-500/60",
    description: "Build fast, strong, resilient athletes who move efficiently and stay durable throughout their career.",
    focus: ["Linear and lateral speed", "Strength development", "Movement efficiency", "Mobility and stability"],
    metrics: ["Sprint times", "Strength ratios", "Movement screens", "Change-of-direction"],
  },
  {
    letter: "U",
    name: "Utility",
    icon: Shuffle,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    textColor: "text-green-500",
    borderColor: "border-green-500/30 hover:border-green-500/60",
    description: "Develop adaptable athletes capable of transferring skills across roles and game situations.",
    focus: ["Positional versatility", "Skill transfer", "Baseball IQ", "Efficient practice habits"],
    metrics: ["Skill consistency", "Positional adaptability", "Variable execution"],
  },
  {
    letter: "L",
    name: "Longevity",
    icon: Heart,
    color: "from-amber-500 to-yellow-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-500",
    borderColor: "border-amber-500/30 hover:border-amber-500/60",
    description: "Keep athletes healthy, available, and progressing over time. Availability is the most overlooked performance metric.",
    focus: ["Arm care systems", "Workload management", "Recovery protocols", "Tissue resilience"],
    metrics: ["Throw volume", "Recovery indicators", "Availability rate", "Injury risk markers"],
    badge: "Founder's Pre-Sale Access",
    preSale: "Get Lifetime Access to the full V-A-U-L-T suite for $499 — Limited Time Founder's Window.",
    link: "/products/founders-access",
  },
  {
    letter: "T",
    name: "Transfer",
    icon: Target,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-500",
    borderColor: "border-purple-500/30 hover:border-purple-500/60",
    description: "Ensure training adaptations appear in competition. Training that does not show up in games fails its purpose.",
    focus: ["Practice design", "Decision-making under pressure", "Competitive execution", "Game realism"],
    metrics: ["Practice-to-game carryover", "Situational success", "Consistency under pressure"],
    badge: "Founder's Pre-Sale Access",
    preSale: "Get Lifetime Access to the full V-A-U-L-T suite for $499 — Limited Time Founder's Window.",
    link: "/products/founders-access",
  },
];

const VaultPillars = () => {
  return (
    <section id="pillars" className="py-24 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `
          linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px'
      }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header - Dashboard Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border mb-6">
            <Activity className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Operating System Framework</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-display text-foreground mb-4">
            THE 5 PILLARS
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            VAULT™ is a complete operating system built on five interconnected performance pillars. 
            <span className="block mt-2 font-medium text-foreground">Each pillar is required. None stand alone.</span>
          </p>
        </motion.div>

        {/* System Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-border max-w-4xl mx-auto"
        >
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Framework-Based</span>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Data-Driven</span>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-muted-foreground">Fully Integrated</span>
            </div>
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-muted-foreground">Game-Transfer Focus</span>
            </div>
          </div>
        </motion.div>

        {/* Pillars Grid - Dashboard Style */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            const isLarge = index < 2; // First two are larger
            
            return (
              <motion.div
                key={pillar.letter}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative bg-card/80 backdrop-blur-sm border rounded-2xl overflow-hidden transition-all hover:shadow-lg ${pillar.borderColor} ${
                  index === 2 ? 'lg:col-span-1' : ''
                } ${index >= 3 ? 'lg:col-span-1' : ''}`}
              >
                {/* Top gradient bar */}
                <div className={`h-1.5 bg-gradient-to-r ${pillar.color}`} />
                
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl ${pillar.bgColor} flex items-center justify-center`}>
                        <span className={`text-3xl font-display ${pillar.textColor}`}>{pillar.letter}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-display text-foreground">{pillar.name}</h3>
                          {pillar.badge && (
                            <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30 text-[10px]">
                              PRE-SALE
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Icon className={`w-3 h-3 ${pillar.textColor}`} />
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">Pillar {index + 1}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{pillar.description}</p>

                  {/* Focus Areas */}
                  <div className="mb-4">
                    <span className="text-xs font-medium text-foreground uppercase tracking-wide mb-2 block">Focus Areas</span>
                    <div className="flex flex-wrap gap-1.5">
                      {pillar.focus.slice(0, 3).map((item) => (
                        <span
                          key={item}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${pillar.bgColor} text-xs`}
                        >
                          <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${pillar.color}`} />
                          <span className="text-muted-foreground">{item}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="mb-4">
                    <span className="text-xs font-medium text-foreground uppercase tracking-wide mb-2 block">Key Metrics</span>
                    <div className="flex flex-wrap gap-1.5">
                      {pillar.metrics.slice(0, 3).map((metric) => (
                        <span
                          key={metric}
                          className="px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pre-sale CTA */}
                  {pillar.link && (
                    <Link to={pillar.link} className="block mt-4">
                      <Button variant="vault" size="sm" className="w-full group-hover:shadow-md transition-shadow">
                        Get Founder's Access
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* System Standard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-card via-card to-secondary/50 border border-border shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Operating System Active</span>
            </div>
            <p className="text-2xl md:text-4xl font-display text-foreground max-w-2xl">
              "VAULT™ is not a program.
              <span className="block metallic-text">VAULT™ is the standard."</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VaultPillars;
