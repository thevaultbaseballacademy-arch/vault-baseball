import { motion } from "framer-motion";
import { Target, Check, ShieldCheck, ArrowRight, Loader2, Clock, Crosshair, Brain, Flame, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";
import BetaUrgencyBanner from "@/components/products/BetaUrgencyBanner";

const TransferBeta = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.transfer_beta;

  const pillars = [
    {
      icon: Brain,
      title: "Decision Training",
      description: "Train your brain to make better decisions faster under game-like pressure and time constraints",
    },
    {
      icon: Crosshair,
      title: "Game-Realistic Practice",
      description: "Design practices that mirror the chaos, timing, and demands of real competition",
    },
    {
      icon: Flame,
      title: "Competitive Execution",
      description: "Build the mental frameworks to perform under pressure when it matters most",
    },
    {
      icon: Trophy,
      title: "Performance Tracking",
      description: "Measure what matters—track practice-to-game transfer rates and identify gaps",
    },
  ];

  const included = [
    "12-week transfer-focused training plan with progressions",
    "60+ game-realistic drill library with video demos",
    "Practice design templates (daily, weekly, seasonal)",
    "Competitive scenario builder worksheet",
    "Decision training protocols for each position",
    "Pre-game mental preparation routine",
    "Post-game self-assessment framework",
    "Monthly program updates during beta",
    "Access to private community for feedback",
  ];

  const futureFeatures = [
    "AI-powered practice design recommendations",
    "Transfer rate analytics dashboard",
    "Video analysis with decision-point tagging",
    "Personalized focus areas based on data",
    "Coach dashboard for team-wide tracking",
    "Integration with game stats platforms",
    "Custom drill builder with randomization",
  ];

  const stats = [
    { value: "40%", label: "of practice gains typically don't transfer to games" },
    { value: "2.5x", label: "better transfer with game-realistic training design" },
    { value: "73%", label: "of coaches say practice-to-game gap is their biggest challenge" },
  ];

  const problems = [
    "You crush it in BP but can't replicate it in games",
    "Your mechanics look great in drills but fall apart under pressure",
    "You practice harder than anyone but game stats don't show it",
    "You feel like you're training hard but not getting better results",
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
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 text-sm font-medium border border-purple-500/20">
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
              <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-purple-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                VAULT™ TRANSFER SYSTEM
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Training that doesn't show up in games fails its purpose. Bridge the gap between 
                practice performance and game-day execution with competition-focused training design.
              </p>
            </motion.div>

            {/* Urgency Banner */}
            <BetaUrgencyBanner accentColor="purple" spotsTotal={100} spotsClaimed={61} />

            {/* Problem Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="bg-card border border-destructive/20 rounded-2xl p-8 mb-16"
            >
              <h3 className="text-xl font-display text-foreground mb-6 text-center">Sound Familiar?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {problems.map((problem, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-destructive text-lg">✗</span>
                    <p className="text-muted-foreground">{problem}</p>
                  </div>
                ))}
              </div>
              <p className="text-center text-foreground font-medium mt-6 pt-6 border-t border-border">
                This is the practice-to-game transfer problem—and it's solvable.
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
                  <div className="text-4xl font-display text-purple-500 mb-2">{stat.value}</div>
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
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                    <pillar.icon className="w-6 h-6 text-purple-500" />
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
              className="bg-gradient-to-br from-purple-500/5 to-purple-600/10 border border-purple-500/20 rounded-2xl p-8 mb-16"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-purple-600 font-medium mb-2">Beta Access Price</p>
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
                  onClick={() => checkout('transfer_beta')}
                  disabled={loading === 'transfer_beta'}
                  className="whitespace-nowrap"
                >
                  {loading === 'transfer_beta' ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  Get Early Access
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>

            {/* Comparison Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-16"
            >
              <h3 className="text-2xl font-display text-foreground mb-6 text-center">Beta vs Full Release</h3>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 text-foreground font-medium">Feature</th>
                        <th className="text-center p-4 min-w-[120px]">
                          <div className="flex flex-col items-center">
                            <span className="text-purple-500 font-display text-lg">Beta</span>
                            <span className="text-xs text-muted-foreground">{formatPrice(product.price)}</span>
                          </div>
                        </th>
                        <th className="text-center p-4 min-w-[120px]">
                          <div className="flex flex-col items-center">
                            <span className="text-foreground font-display text-lg">Full</span>
                            <span className="text-xs text-muted-foreground">$299</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr><td className="p-4 text-muted-foreground">12-Week Transfer Training Plan</td><td className="p-4 text-center"><Check className="w-5 h-5 text-purple-500 mx-auto" /></td><td className="p-4 text-center"><Check className="w-5 h-5 text-foreground/50 mx-auto" /></td></tr>
                      <tr><td className="p-4 text-muted-foreground">60+ Game-Realistic Drill Library</td><td className="p-4 text-center"><Check className="w-5 h-5 text-purple-500 mx-auto" /></td><td className="p-4 text-center"><Check className="w-5 h-5 text-foreground/50 mx-auto" /></td></tr>
                      <tr><td className="p-4 text-muted-foreground">Practice Design Templates</td><td className="p-4 text-center"><Check className="w-5 h-5 text-purple-500 mx-auto" /></td><td className="p-4 text-center"><Check className="w-5 h-5 text-foreground/50 mx-auto" /></td></tr>
                      <tr><td className="p-4 text-muted-foreground">Competitive Scenario Builder</td><td className="p-4 text-center"><Check className="w-5 h-5 text-purple-500 mx-auto" /></td><td className="p-4 text-center"><Check className="w-5 h-5 text-foreground/50 mx-auto" /></td></tr>
                      <tr><td className="p-4 text-muted-foreground">Decision Training Protocols</td><td className="p-4 text-center"><Check className="w-5 h-5 text-purple-500 mx-auto" /></td><td className="p-4 text-center"><Check className="w-5 h-5 text-foreground/50 mx-auto" /></td></tr>
                      <tr><td className="p-4 text-muted-foreground">Pre-Game & Post-Game Frameworks</td><td className="p-4 text-center"><Check className="w-5 h-5 text-purple-500 mx-auto" /></td><td className="p-4 text-center"><Check className="w-5 h-5 text-foreground/50 mx-auto" /></td></tr>
                      <tr><td className="p-4 text-muted-foreground">Private Community Access</td><td className="p-4 text-center"><Check className="w-5 h-5 text-purple-500 mx-auto" /></td><td className="p-4 text-center"><Check className="w-5 h-5 text-foreground/50 mx-auto" /></td></tr>
                      <tr className="bg-secondary/30"><td className="p-4 text-muted-foreground">AI-Powered Practice Design</td><td className="p-4 text-center"><span className="text-xs text-purple-500">Coming Soon</span></td><td className="p-4 text-center"><Check className="w-5 h-5 text-foreground/50 mx-auto" /></td></tr>
                      <tr className="bg-secondary/30"><td className="p-4 text-muted-foreground">Transfer Rate Analytics Dashboard</td><td className="p-4 text-center"><span className="text-xs text-purple-500">Coming Soon</span></td><td className="p-4 text-center"><Check className="w-5 h-5 text-foreground/50 mx-auto" /></td></tr>
                      <tr className="bg-secondary/30"><td className="p-4 text-muted-foreground">Video Analysis with Decision Tagging</td><td className="p-4 text-center"><span className="text-xs text-purple-500">Coming Soon</span></td><td className="p-4 text-center"><Check className="w-5 h-5 text-foreground/50 mx-auto" /></td></tr>
                      <tr className="bg-secondary/30"><td className="p-4 text-muted-foreground">Game Stats Platform Integration</td><td className="p-4 text-center"><span className="text-xs text-purple-500">Coming Soon</span></td><td className="p-4 text-center"><Check className="w-5 h-5 text-foreground/50 mx-auto" /></td></tr>
                      <tr className="bg-secondary/30"><td className="p-4 text-muted-foreground">Custom Drill Builder</td><td className="p-4 text-center"><span className="text-xs text-purple-500">Coming Soon</span></td><td className="p-4 text-center"><Check className="w-5 h-5 text-foreground/50 mx-auto" /></td></tr>
                      <tr className="border-t-2 border-purple-500/30 bg-purple-500/5">
                        <td className="p-4 text-foreground font-medium">Grandfathered Beta Pricing</td>
                        <td className="p-4 text-center"><Check className="w-5 h-5 text-purple-500 mx-auto" /></td>
                        <td className="p-4 text-center"><span className="text-muted-foreground">—</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-purple-500/5 border-t border-purple-500/20 text-center">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-purple-500">Beta purchasers get all future updates</strong> at no additional cost when full release launches
                  </p>
                </div>
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
                  <div className="text-3xl mb-3">⚾</div>
                  <h4 className="font-medium text-foreground mb-2">Hitters</h4>
                  <p className="text-sm text-muted-foreground">Who want their cage work to actually show up against live pitching in games</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">🧤</div>
                  <h4 className="font-medium text-foreground mb-2">Fielders</h4>
                  <p className="text-sm text-muted-foreground">Who need to make the routine play and the big play when pressure is highest</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">📋</div>
                  <h4 className="font-medium text-foreground mb-2">Coaches</h4>
                  <p className="text-sm text-muted-foreground">Who want to design practices that actually prepare their team for game situations</p>
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
                <strong className="text-foreground">Early Access Notice:</strong> This is the beta version of the VAULT™ Transfer System. 
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

export default TransferBeta;