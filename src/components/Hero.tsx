import { motion } from "framer-motion";
import { TrendingUp, Target, Zap, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/vault-hero.jpg";

const Hero = () => {
  const pillars = [
    { letter: "V", name: "Velocity", color: "text-red-500" },
    { letter: "A", name: "Athleticism", color: "text-blue-500" },
    { letter: "U", name: "Utility", color: "text-green-500" },
    { letter: "L", name: "Longevity", color: "text-amber-500" },
    { letter: "T", name: "Transfer", color: "text-purple-500" },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Elite baseball athlete training"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-32 md:py-40">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-foreground text-sm font-medium border border-border">
              <Shield className="w-4 h-4 text-accent" />
              The Standardized Operating System for Baseball
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display leading-[0.9] mb-6"
          >
            <span className="text-foreground">ONE SYSTEM.</span>
            <span className="block metallic-text">EVERY ATHLETE.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed"
          >
            VAULT™ is a framework-based development system built on five performance pillars. 
            Development should not depend on who is coaching that day.
          </motion.p>

          {/* VAULT Pillars */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.letter}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border"
              >
                <span className={`text-2xl font-display ${pillar.color}`}>{pillar.letter}</span>
                <span className="text-sm text-muted-foreground">{pillar.name}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <Link to="/auth">
              <Button variant="vault" size="xl">
                Start Training
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/products/org-starter-pack">
              <Button variant="vaultOutline" size="xl">
                Get the Org Starter Pack
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>

          {/* Velocity Upsell CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mb-12"
          >
            <Link to="/products/velocity-system" className="group inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 hover:border-red-500/40 transition-all">
              <Zap className="w-5 h-5 text-red-500" />
              <span className="text-foreground font-medium">12-Week Velocity System</span>
              <span className="text-muted-foreground">$299 one-time</span>
              <ArrowRight className="w-4 h-4 text-red-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* The Promise */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border max-w-xl"
          >
            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">The VAULT™ Promise</p>
            <p className="text-xl font-display text-foreground">
              "If it does not transfer to the game, it does not matter."
            </p>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 z-[1] opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), 
                          linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
    </section>
  );
};

export default Hero;
