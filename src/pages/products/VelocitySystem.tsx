import { motion } from "framer-motion";
import { Zap, Check, ArrowRight, Loader2, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const VelocitySystem = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.velocity_12week;

  const features = [
    "Complete 12-week velocity development program",
    "Intent-based training progressions",
    "Ground force utilization drills",
    "Rotational sequencing protocols",
    "Energy transfer optimization",
    "Weekly programming with video guides",
    "Exit velocity tracking templates",
    "Pitch velocity development",
    "Progress assessment checkpoints",
  ];

  const results = [
    { metric: "Avg. Velocity Gain", value: "+4-6 MPH" },
    { metric: "Program Duration", value: "12 Weeks" },
    { metric: "Sessions/Week", value: "4-5" },
    { metric: "Video Guides", value: "40+" },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-600 text-sm font-medium border border-red-500/20 mb-6">
                <TrendingUp className="w-4 h-4" />
                Stand-Alone Program - No Subscription Required
              </span>
              <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                12-WEEK VAULT VELOCITY SYSTEM
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The complete velocity development program for athletes who want results 
                without a subscription. One payment, full access, lifetime ownership.
              </p>
            </motion.div>

            {/* Results Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
            >
              {results.map((result, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
                  <p className="text-3xl font-display text-red-500 mb-1">{result.value}</p>
                  <p className="text-sm text-muted-foreground">{result.metric}</p>
                </div>
              ))}
            </motion.div>

            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-card to-secondary border border-border rounded-2xl p-8 mb-12"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <p className="text-sm text-red-600 font-medium mb-2">One-Time Purchase</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-display text-foreground">{formatPrice(product.price)}</span>
                    <span className="text-muted-foreground line-through">$499</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Lifetime access • No recurring fees • Instant access
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="vault"
                    size="xl"
                    onClick={() => checkout('velocity_12week')}
                    disabled={loading === 'velocity_12week'}
                  >
                    {loading === 'velocity_12week' ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : null}
                    Buy Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-2xl p-8 mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6">What's Included</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Upsell */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-secondary/50 rounded-2xl p-8 text-center"
            >
              <h3 className="text-xl font-display text-foreground mb-2">
                Want Ongoing Support?
              </h3>
              <p className="text-muted-foreground mb-4">
                Upgrade to a VAULT™ Membership for personalized coaching, video analysis, 
                and access to all five training systems.
              </p>
              <Link to="/#pricing">
                <Button variant="outline">
                  View Membership Options
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default VelocitySystem;
