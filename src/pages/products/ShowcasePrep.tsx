import { motion } from "framer-motion";
import { Zap, Check, ArrowRight, Loader2, Calendar, Target, TrendingUp, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";
import BetaUrgencyBanner from "@/components/products/BetaUrgencyBanner";

const ShowcasePrep = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.showcase_prep;

  const phases = [
    {
      days: "Days 1-10",
      title: "Foundation & Assessment",
      items: [
        "Baseline metrics assessment (velo, movement quality)",
        "Mechanics video analysis",
        "Personalized focus areas identified",
        "Daily mobility & activation protocols",
      ],
    },
    {
      days: "Days 11-20",
      title: "Build & Intensify",
      items: [
        "High-intensity velocity work",
        "Showcase-specific skills training",
        "Simulated tryout scenarios",
        "Recovery optimization",
      ],
    },
    {
      days: "Days 21-30",
      title: "Peak & Perform",
      items: [
        "Velocity peaking protocol",
        "Pre-showcase taper strategy",
        "Mental preparation routines",
        "Game-day execution plan",
      ],
    },
  ];

  const included = [
    "Complete 30-day periodized training program",
    "Daily workout videos with demonstrations",
    "Pre and post assessment tracking",
    "2 video analyses with personalized feedback",
    "Showcase-specific skills checklist",
    "Nutrition timing guide for peak performance",
    "Sleep optimization protocol",
    "Pre-event mental prep routine",
    "Day-of showcase game plan",
    "Parent guide for showcase support",
  ];

  const idealFor = [
    { emoji: "🎯", title: "Spring Tryouts", description: "High school or travel ball team tryouts" },
    { emoji: "⭐", title: "Showcases", description: "PBR, PG, or college showcases" },
    { emoji: "🏫", title: "College Visits", description: "Unofficial visits or prospect camps" },
    { emoji: "📋", title: "Draft Prep", description: "Pre-draft workout preparation" },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-600 text-sm font-medium border border-orange-500/20">
                <Zap className="w-4 h-4" />
                Spring Season Ready
              </span>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-12"
            >
              <div className="w-20 h-20 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-orange-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                DRAFT/SHOWCASE PREP
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                30 days of high-intensity preparation to peak for your most important evaluation. 
                Walk in with confidence knowing you're at your absolute best.
              </p>
            </motion.div>

            {/* Urgency Banner */}
            <BetaUrgencyBanner 
              accentColor="amber" 
              spotsTotal={50} 
              spotsClaimed={31}
              endDate={new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)}
            />

            {/* Ideal For */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
            >
              {idealFor.map((item, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  <h3 className="font-medium text-foreground text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </motion.div>

            {/* 30-Day Phases */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6 text-center">30-Day Roadmap</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {phases.map((phase, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <span className="text-xs text-orange-500 font-medium">{phase.days}</span>
                        <h4 className="font-display text-foreground">{phase.title}</h4>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {phase.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-orange-500/5 to-orange-600/10 border border-orange-500/20 rounded-2xl p-8 mb-12"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-orange-600 font-medium mb-2">30-Day Intensive Program</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-display text-foreground">{formatPrice(product.price)}</span>
                    <span className="text-muted-foreground">one-time</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Less than $7/day for showcase-ready preparation
                  </p>
                </div>
                <Button
                  variant="vault"
                  size="xl"
                  onClick={() => checkout('showcase_prep')}
                  disabled={loading === 'showcase_prep'}
                  className="whitespace-nowrap"
                >
                  {loading === 'showcase_prep' ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  Start Prep Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-card border border-border rounded-2xl p-6 mb-12"
            >
              <h3 className="text-xl font-display text-foreground mb-6 text-center">Everything You Get</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {included.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Timing Note */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-secondary/50 rounded-2xl p-6 text-center"
            >
              <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-display text-foreground mb-2">Perfect Timing</h3>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Start this program 30-35 days before your target showcase or tryout. 
                The program is designed to have you peaking on your event day, not before or after.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default ShowcasePrep;