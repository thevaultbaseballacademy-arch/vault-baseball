import { motion } from "framer-motion";
import { Heart, Check, ShieldCheck, ArrowRight, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const LongevityBeta = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.longevity_beta;

  const features = [
    "Complete arm care protocol library",
    "Workload management dashboard",
    "Recovery tracking tools",
    "Tissue resilience programs",
    "Injury risk assessment templates",
    "Availability rate monitoring",
    "Early access to all future updates",
  ];

  const included = [
    "12-week progressive arm care program",
    "Daily readiness assessment framework",
    "Throw count & intensity tracking",
    "Recovery protocol library (20+ routines)",
    "Monthly program updates during beta",
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Beta Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium border border-amber-500/20">
                <Clock className="w-4 h-4" />
                Early Access Version
              </span>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-12"
            >
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-amber-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                VAULT™ LONGEVITY SYSTEM
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Keep athletes healthy, available, and progressing over time. 
                Availability is the most overlooked performance metric.
              </p>
            </motion.div>

            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-2xl p-8 mb-12"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-amber-600 font-medium mb-2">Beta Access Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-display text-foreground">{formatPrice(product.price)}</span>
                    <span className="text-muted-foreground">one-time</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Lock in beta pricing before full release
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
                  Buy Early Access
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid md:grid-cols-2 gap-8 mb-12"
            >
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-xl font-display text-foreground mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  What's Included Now
                </h3>
                <ul className="space-y-3">
                  {included.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-xl font-display text-foreground mb-4">
                  Full System Features
                </h3>
                <ul className="space-y-3">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-foreground/50 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
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
                <strong className="text-foreground">Early Access Notice:</strong> This is a beta version of the VAULT™ Longevity System. 
                You'll receive all current content plus free access to updates as we build out the full system. 
                Beta purchasers will be grandfathered into any future pricing changes.
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
