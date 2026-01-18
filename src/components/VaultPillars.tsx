import { motion } from "framer-motion";
import { Zap, Dumbbell, Shuffle, Heart, Target, ArrowRight } from "lucide-react";
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
    <section id="pillars" className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-medium uppercase tracking-widest mb-4 block">
            The Framework
          </span>
          <h2 className="text-4xl md:text-6xl font-display text-foreground mb-4">
            FIVE PILLARS. ONE SYSTEM.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            VAULT™ is built on five interconnected pillars. Each pillar is required. None stand alone.
          </p>
        </motion.div>

        <div className="space-y-6">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.letter}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left - Title */}
                    <div className="lg:w-1/3">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-16 h-16 rounded-2xl ${pillar.bgColor} flex items-center justify-center`}>
                          <span className={`text-4xl font-display ${pillar.textColor}`}>{pillar.letter}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-display text-foreground">{pillar.name}</h3>
                            {pillar.badge && (
                              <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                                {pillar.badge}
                              </Badge>
                            )}
                          </div>
                          <div className={`w-12 h-1 rounded-full bg-gradient-to-r ${pillar.color} mt-1`} />
                        </div>
                      </div>
                      <p className="text-muted-foreground">{pillar.description}</p>
                      {pillar.preSale && (
                        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20">
                          <p className="text-sm text-foreground font-medium">{pillar.preSale}</p>
                        </div>
                      )}
                      {pillar.link && (
                        <Link to={pillar.link} className="inline-block mt-4">
                          <Button variant="vault" size="sm">
                            Get Founder's Access
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      )}
                    </div>

                    {/* Right - Focus & Metrics */}
                    <div className="lg:w-2/3 grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className={`w-4 h-4 ${pillar.textColor}`} />
                          <span className="text-sm font-medium text-foreground uppercase tracking-wide">Focus Areas</span>
                        </div>
                        <ul className="space-y-2">
                          {pillar.focus.map((item) => (
                            <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${pillar.color}`} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Target className={`w-4 h-4 ${pillar.textColor}`} />
                          <span className="text-sm font-medium text-foreground uppercase tracking-wide">Key Metrics</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {pillar.metrics.map((metric) => (
                            <span
                              key={metric}
                              className="px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground"
                            >
                              {metric}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* VAULT Standard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-card to-secondary border border-border">
            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-3">The VAULT™ Standard</p>
            <p className="text-2xl md:text-3xl font-display text-foreground max-w-2xl">
              "VAULT™ is not a program. VAULT™ is the standard."
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VaultPillars;
