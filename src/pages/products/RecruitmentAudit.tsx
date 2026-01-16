import { motion } from "framer-motion";
import { GraduationCap, Check, ArrowRight, Loader2, Target, FileText, BarChart3, Map, Calendar, TrendingUp, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileConversionBar from "@/components/products/MobileConversionBar";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const RecruitmentAudit = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.recruitment_audit;

  const athleteSnapshot = [
    "Name, Position, Grad Year",
    "Current School/Organization",
    "Playing Experience Summary",
    "Training History",
  ];

  const currentMetrics = [
    "Exit Velocity / Bat Speed",
    "Throwing Velocity",
    "60-Yard Dash / Sprint Times",
    "Strength Markers (if available)",
  ];

  const positionalExpectations = [
    "D1 Standards by Position",
    "D2 Standards by Position", 
    "D3 Standards by Position",
    "JUCO Standards by Position",
  ];

  const divisionFitCategories = [
    { title: "D1 Ready Now", description: "Metrics meet or exceed D1 standards" },
    { title: "D1 Potential", description: "On track with development path" },
    { title: "D2/D3 Fit", description: "Strong fit for competitive programs" },
    { title: "JUCO Development", description: "Best path to maximize potential" },
  ];

  const deliverables = [
    {
      icon: TrendingUp,
      title: "Strengths Analysis",
      description: "What's already working and how to leverage it",
    },
    {
      icon: Target,
      title: "Gaps Identified", 
      description: "Specific areas holding you back from next level",
    },
    {
      icon: Map,
      title: "6–12 Month Development Plan",
      description: "Prioritized roadmap to close gaps and get recruited",
    },
    {
      icon: Route,
      title: "Recommended Vault Path",
      description: "Which Vault programs align with your goals",
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="w-20 h-20 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                KNOW EXACTLY WHERE YOU STAND
              </h1>
              <p className="text-2xl font-display text-green-500 mb-4">
                AND WHAT IT TAKES TO GET RECRUITED
              </p>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A deep dive into your metrics, position, and realistic recruiting targets. 
                Parents pay for clarity — we deliver it.
              </p>
            </motion.div>

            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-card to-secondary border border-border rounded-2xl p-8 mb-12"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-green-600 font-medium mb-2">One-Time Investment</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-display text-foreground">{formatPrice(product.price)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Complete recruiting roadmap • Clear next steps
                  </p>
                </div>
                <Button
                  variant="vault"
                  size="xl"
                  onClick={() => checkout('recruitment_audit')}
                  disabled={loading === 'recruitment_audit'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading === 'recruitment_audit' ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <FileText className="w-5 h-5 mr-2" />
                  )}
                  Get Your Recruitment Audit
                </Button>
              </div>
            </motion.div>

            {/* Athlete Snapshot & Current Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-2 gap-6 mb-12"
            >
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-500" />
                  Athlete Snapshot
                </h3>
                <ul className="space-y-2">
                  {athleteSnapshot.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-500" />
                  Current Metrics Reviewed
                </h3>
                <ul className="space-y-2">
                  {currentMetrics.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Positional Expectations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card border border-border rounded-2xl p-8 mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6 flex items-center gap-3">
                <Target className="w-6 h-6 text-green-500" />
                Positional Expectations Compared
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {positionalExpectations.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Division Fit Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-500/5 to-green-600/5 border border-green-500/20 rounded-2xl p-8 mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6 flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-green-500" />
                Division Fit Analysis
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {divisionFitCategories.map((cat, i) => (
                  <div key={i} className="bg-background/50 rounded-lg p-4">
                    <h4 className="font-display text-foreground mb-1">{cat.title}</h4>
                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* What You'll Receive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="grid md:grid-cols-2 gap-6 mb-12"
            >
              {deliverables.map((item, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="font-display text-lg text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </motion.div>

            {/* Bundle Hook */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-green-500/5 border border-green-500/20 rounded-2xl p-8 text-center"
            >
              <h3 className="text-xl font-display text-foreground mb-2">
                Included FREE in Vault Elite Membership
              </h3>
              <p className="text-muted-foreground mb-4">
                Elite members get the Recruitment Audit included along with 
                1-on-1 coaching and unlimited video analysis.
              </p>
              <Link to="/#pricing">
                <Button variant="outline">
                  View Elite Membership
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      <MobileConversionBar
        productName={product.name}
        price={product.price}
        productKey="recruitment_audit"
        onCheckout={checkout}
        loading={loading}
        ctaText="Get Audit"
      />
      <Footer />
    </main>
  );
};

export default RecruitmentAudit;
