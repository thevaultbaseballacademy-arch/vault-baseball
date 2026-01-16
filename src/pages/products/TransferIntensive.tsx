import { motion } from "framer-motion";
import { Users, Check, ArrowRight, Loader2, Calendar, Video, MessageSquare, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";
import BetaUrgencyBanner from "@/components/products/BetaUrgencyBanner";

const TransferIntensive = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.transfer_intensive;

  const weeklySchedule = [
    {
      week: "Week 1",
      title: "Assessment & Foundation",
      items: ["Live group session: Transfer gap analysis", "Individual video review", "Custom practice design template"],
    },
    {
      week: "Week 2", 
      title: "Decision Training",
      items: ["Live group session: Decision-making under pressure", "Drill implementation feedback", "Competitive scenario design"],
    },
    {
      week: "Week 3",
      title: "Game Simulation",
      items: ["Live group session: Practice-to-game bridging", "Mid-program progress review", "Pressure training protocols"],
    },
    {
      week: "Week 4",
      title: "Peak Performance",
      items: ["Live group session: Competition preparation", "Final video analysis", "Post-program action plan"],
    },
  ];

  const included = [
    "4 weekly 60-minute live group coaching sessions via Zoom",
    "Personalized practice design review each week",
    "Direct access to VAULT coaches in private Discord channel",
    "4 individual video analyses with detailed feedback",
    "Complete drill library for game-realistic training",
    "Weekly accountability check-ins",
    "Lifetime access to session recordings",
    "Certificate of completion",
  ];

  const features = [
    { icon: Video, title: "Live Coaching", description: "Weekly group sessions with real-time Q&A and personalized feedback" },
    { icon: MessageSquare, title: "Direct Access", description: "Private Discord channel for questions between sessions" },
    { icon: Target, title: "Video Analysis", description: "4 individual video reviews with specific action items" },
    { icon: Calendar, title: "Accountability", description: "Weekly check-ins to keep you on track and progressing" },
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
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium border border-blue-500/20">
                <Users className="w-4 h-4" />
                Limited to 20 Athletes Per Cohort
              </span>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-12"
            >
              <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-blue-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                TRANSFER INTENSIVE
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                4 weeks of live virtual coaching to bridge the gap between practice and game performance. 
                Stop training hard without results showing up on the field.
              </p>
            </motion.div>

            {/* Urgency Banner */}
            <BetaUrgencyBanner 
              accentColor="purple" 
              spotsTotal={20} 
              spotsClaimed={14}
              endDate={new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)}
            />

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
            >
              {features.map((feature, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                    <feature.icon className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3 className="font-medium text-foreground text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </motion.div>

            {/* Weekly Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6 text-center">4-Week Curriculum</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {weeklySchedule.map((week, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <span className="text-xs text-blue-500 font-medium">{week.week}</span>
                        <h4 className="font-display text-foreground">{week.title}</h4>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {week.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
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
              className="bg-gradient-to-br from-blue-500/5 to-blue-600/10 border border-blue-500/20 rounded-2xl p-8 mb-12"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-2">4-Week Live Program</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-display text-foreground">{formatPrice(product.price)}</span>
                    <span className="text-muted-foreground">one-time</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Less than $75/week for personalized coaching
                  </p>
                </div>
                <Button
                  variant="vault"
                  size="xl"
                  onClick={() => checkout('transfer_intensive')}
                  disabled={loading === 'transfer_intensive'}
                  className="whitespace-nowrap"
                >
                  {loading === 'transfer_intensive' ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  Reserve Your Spot
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
                    <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-secondary/50 rounded-2xl p-6"
            >
              <h3 className="text-lg font-display text-foreground mb-4 text-center">Common Questions</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-foreground">When do sessions take place?</p>
                  <p className="text-muted-foreground">Live sessions are held weekly on Wednesday evenings at 7pm CT. All sessions are recorded if you can't make it live.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">What if I miss a session?</p>
                  <p className="text-muted-foreground">All sessions are recorded and available within 24 hours. You'll still get your individual video review and Discord access.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">When does the next cohort start?</p>
                  <p className="text-muted-foreground">New cohorts start every month. After purchase, you'll get an email with exact dates and onboarding instructions.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default TransferIntensive;