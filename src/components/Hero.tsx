import { motion } from "framer-motion";
import { Play, TrendingUp, Target, Zap, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/vault-hero.jpg";

const Hero = () => {
  const metrics = [
    { icon: TrendingUp, value: "+12 MPH", label: "Avg. Exit Velocity Gain" },
    { icon: Target, value: "-0.15s", label: "Pop Time Reduction" },
    { icon: Zap, value: "+8 MPH", label: "Velocity Increase" },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Elite baseball athlete in batting stance"
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
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Data-Driven Performance Systems
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display leading-[0.9] mb-6"
          >
            <span className="text-foreground">UNLOCK YOUR</span>
            <span className="block metallic-text">POTENTIAL</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed"
          >
            Develop elite baseball athletes through data-driven performance systems. 
            Master strength, speed, power, throwing, hitting, and mindset in one unified platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Button variant="vault" size="xl">
              Join Vault
            </Button>
            <Button variant="vaultOutline" size="xl">
              View Programs
            </Button>
            <Button variant="ghost" size="xl" className="text-muted-foreground">
              <Download className="w-5 h-5" />
              Free Resource
            </Button>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <metric.icon className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-display text-foreground">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              </motion.div>
            ))}
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
