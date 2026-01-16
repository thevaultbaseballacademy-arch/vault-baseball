import { motion } from "framer-motion";
import { Heart, Check, ShieldCheck, ArrowRight, Loader2, Clock, Activity, Shield, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const LongevityBeta = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.longevity_beta;

  const pillars = [
    {
      icon: Shield,
      title: "Arm Care Protocols",
      description: "Comprehensive pre-throw, post-throw, and recovery routines designed by professional performance coaches",
    },
    {
      icon: Activity,
      title: "Workload Management",
      description: "Track throwing volume, intensity, and cumulative stress to prevent overuse injuries before they happen",
    },
    {
      icon: TrendingUp,
      title: "Availability Tracking",
      description: "Monitor your readiness and availability rate—the most overlooked performance metric in baseball",
    },
    {
      icon: Zap,
      title: "Tissue Resilience",
      description: "Build durable tissues through progressive loading strategies that prepare your arm for game demands",
    },
  ];

  const included = [
    "12-week progressive arm care program with video demonstrations",
    "Daily readiness assessment framework (5-min check-in)",
    "Throw count & intensity tracking spreadsheet",
    "Recovery protocol library with 25+ routines",
    "Shoulder and elbow mobility program",
    "Sleep optimization guide for athletes",
    "Nutrition basics for arm health",
    "Monthly program updates during beta",
    "Access to private community for feedback",
  ];

  const futureFeatures = [
    "AI-powered workload recommendations",
    "Injury risk scoring algorithm",
    "Integration with wearable devices",
    "Personalized recovery protocols",
    "Coach dashboard for team management",
    "Video analysis for arm action",
    "Real-time availability alerts",
  ];

  const stats = [
    { value: "68%", label: "of arm injuries are preventable with proper management" },
    { value: "3x", label: "higher injury risk when workload spikes exceed 1.5 ACWR" },
    { value: "25%", label: "of pitchers miss time each season due to arm injuries" },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Beta Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium border border-amber-500/20">
                <Clock className="w-4 h-4" />
                Early Access — Limited Beta Pricing
              </span>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-16"
            >
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-amber-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                VAULT™ LONGEVITY SYSTEM
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                The best ability is availability. Build a resilient arm, manage workloads intelligently, 
                and stay on the field when it matters most. Because you can't perform if you're on the IL.
              </p>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
            >
              {stats.map((stat, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6 text-center">
                  <div className="text-4xl font-display text-amber-500 mb-2">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Pillars */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
            >
              {pillars.map((pillar, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                    <pillar.icon className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-display text-foreground mb-2">{pillar.title}</h3>
                  <p className="text-muted-foreground text-sm">{pillar.description}</p>
                </div>
              ))}
            </motion.div>

            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-br from-amber-500/5 to-amber-600/10 border border-amber-500/20 rounded-2xl p-8 mb-16"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-amber-600 font-medium mb-2">Beta Access Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-display text-foreground">{formatPrice(product.price)}</span>
                    <span className="text-muted-foreground line-through">$299</span>
                    <span className="text-muted-foreground">one-time</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Save 50% — Lock in beta pricing before full release at $299
                  </p>
                </div>
                <Button
                  variant="vault"
                  size="xl"
                  onClick={() => checkout('longevity_beta')}
                  disabled={loading === 'longevity_beta'}
                  className="whitespace-nowrap"
                >
                  {loading === 'longevity_beta' ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  Get Early Access
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid md:grid-cols-2 gap-8 mb-16"
            >
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-xl font-display text-foreground mb-6 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  What's Included Now
                </h3>
                <ul className="space-y-3">
                  {included.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-xl font-display text-foreground mb-6">
                  Coming in Full Release
                </h3>
                <ul className="space-y-3">
                  {futureFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-foreground/30 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                  Beta purchasers get all future updates at no additional cost
                </p>
              </div>
            </motion.div>

            {/* Who It's For */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-card border border-border rounded-2xl p-8 mb-16"
            >
              <h3 className="text-2xl font-display text-foreground mb-6 text-center">Who This Is For</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-3">🎯</div>
                  <h4 className="font-medium text-foreground mb-2">Pitchers</h4>
                  <p className="text-sm text-muted-foreground">Who want to stay healthy through a full season and build arm durability for the long haul</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">💪</div>
                  <h4 className="font-medium text-foreground mb-2">Position Players</h4>
                  <p className="text-sm text-muted-foreground">Who throw frequently and need to manage arm stress from practice and games</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">📋</div>
                  <h4 className="font-medium text-foreground mb-2">Coaches & Parents</h4>
                  <p className="text-sm text-muted-foreground">Who want a proven system to protect their athletes from preventable injuries</p>
                </div>
              </div>
            </motion.div>

            {/* Disclaimer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-secondary/50 rounded-2xl p-6 text-center"
            >
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Early Access Notice:</strong> This is the beta version of the VAULT™ Longevity System. 
                You'll receive immediate access to all current content plus free updates as we build out the full system. 
                Beta purchasers are grandfathered into the beta price permanently—even when we raise prices at full release.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default LongevityBeta;