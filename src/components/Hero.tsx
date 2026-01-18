import { motion } from "framer-motion";
import { Zap, Dumbbell, Shuffle, Heart, Target, ArrowRight, Activity, Shield, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  const pillars = [
    { letter: "V", name: "Velocity", icon: Zap, color: "from-red-500 to-orange-500", bgColor: "bg-red-500/10", textColor: "text-red-500" },
    { letter: "A", name: "Athleticism", icon: Dumbbell, color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-500/10", textColor: "text-blue-500" },
    { letter: "U", name: "Utility", icon: Shuffle, color: "from-green-500 to-emerald-500", bgColor: "bg-green-500/10", textColor: "text-green-500" },
    { letter: "L", name: "Longevity", icon: Heart, color: "from-amber-500 to-yellow-500", bgColor: "bg-amber-500/10", textColor: "text-amber-500" },
    { letter: "T", name: "Transfer", icon: Target, color: "from-purple-500 to-pink-500", bgColor: "bg-purple-500/10", textColor: "text-purple-500" },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Dashboard-style grid background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80" />
      </div>

      {/* Glowing orbs for depth */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-24 md:py-32">
        {/* Top System Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">System Status</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <span className="text-xs font-medium text-green-500">OPERATIONAL</span>
          </div>
        </motion.div>

        {/* Main OS Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border mb-6">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">THE STANDARDIZED OPERATING SYSTEM FOR BASEBALL</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-6xl md:text-8xl lg:text-9xl font-display leading-[0.85] mb-4"
        >
          <span className="metallic-text">VAULT</span>
          <span className="text-foreground/20">™</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center text-xl md:text-2xl font-display text-muted-foreground tracking-wide mb-4"
        >
          PERFORMANCE OPERATING SYSTEM
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-center text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-12"
        >
          A framework-based development system built on five interconnected performance pillars.
          Development should not depend on who is coaching that day.
        </motion.p>

        {/* 5 PILLARS Dashboard Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-accent" />
            <span className="text-sm uppercase tracking-widest text-muted-foreground font-medium">The 5 Pillars</span>
          </div>
          
          <div className="grid grid-cols-5 gap-2 md:gap-4 max-w-4xl mx-auto">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.letter}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.08 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group relative bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3 md:p-5 hover:border-accent/50 transition-all cursor-pointer overflow-hidden"
                >
                  {/* Gradient accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${pillar.color}`} />
                  
                  {/* Hover glow effect */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b ${pillar.bgColor}`} />
                  
                  <div className="relative flex flex-col items-center text-center">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${pillar.bgColor} flex items-center justify-center mb-2 md:mb-3`}>
                      <Icon className={`w-5 h-5 md:w-6 md:h-6 ${pillar.textColor}`} />
                    </div>
                    <span className={`text-2xl md:text-4xl font-display ${pillar.textColor} mb-1`}>{pillar.letter}</span>
                    <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">{pillar.name}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* One System Promise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center mb-10"
        >
          <div className="inline-block p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">The VAULT™ Standard</p>
            <p className="text-lg md:text-xl font-display text-foreground">
              "If it does not transfer to the game, it does not matter."
            </p>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/auth">
            <Button variant="vault" size="xl" className="w-full sm:w-auto">
              Access Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to="/products/org-starter-pack">
            <Button variant="vaultOutline" size="xl" className="w-full sm:w-auto">
              Get the Org Starter Pack
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex flex-wrap justify-center gap-4 mt-8"
        >
          <Link 
            to="/products/velocity-system" 
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Zap className="w-4 h-4 text-red-500" />
            12-Week Velocity System
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            to="/products/founders-access" 
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Shield className="w-4 h-4 text-amber-500" />
            Founder's Access
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            to="/wall-of-wins" 
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Target className="w-4 h-4 text-purple-500" />
            Wall of Wins
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default Hero;
