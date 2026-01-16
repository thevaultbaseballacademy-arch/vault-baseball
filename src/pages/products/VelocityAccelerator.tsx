import { motion } from "framer-motion";
import { Flame, Check, ArrowRight, Loader2, Timer, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const VelocityAccelerator = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.velocity_accelerator;

  const features = [
    "6-week focused velocity program",
    "Weekly structured training",
    "Intent & overload emphasis",
    "1 coach feedback video included",
    "High-intensity progression model",
    "Built for serious gains in short time",
  ];

  const bestFor = [
    { icon: Timer, text: "Off-season pushes" },
    { icon: Target, text: "Showcase prep" },
    { icon: TrendingUp, text: "Plateau breakers" },
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
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-600 text-sm font-medium border border-orange-500/20 mb-6">
                <Flame className="w-4 h-4" />
                Premium Short-Term Program
              </span>
              <div className="w-20 h-20 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-6">
                <Flame className="w-10 h-10 text-orange-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                6 WEEKS. MAXIMUM INTENT.
              </h1>
              <p className="text-2xl font-display text-orange-500 mb-4">
                SERIOUS VELOCITY GAINS.
              </p>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A high-intensity velocity sprint for athletes who want results fast. 
                Short timeline, maximum output, measurable gains.
              </p>
            </motion.div>

            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-orange-500/5 to-orange-600/10 border border-orange-500/20 rounded-2xl p-8 mb-12"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <p className="text-sm text-orange-600 font-medium mb-2">Premium Program</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-display text-foreground">{formatPrice(product.price)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    6 weeks • Includes coach feedback video • One-time purchase
                  </p>
                </div>
                <Button
                  variant="vault"
                  size="xl"
                  onClick={() => checkout('velocity_accelerator')}
                  disabled={loading === 'velocity_accelerator'}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {loading === 'velocity_accelerator' ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  Start the Velocity Accelerator
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-2xl p-8 mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6">Includes</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Best For */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-2xl p-8 mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6">Best For</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {bestFor.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-orange-500" />
                      </div>
                      <span className="text-muted-foreground">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Bundle Upsell */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-secondary/50 rounded-2xl p-8 text-center"
            >
              <h3 className="text-xl font-display text-foreground mb-2">
                Want the Complete Velocity Package?
              </h3>
              <p className="text-muted-foreground mb-4">
                Get the Velocity Max Pack — includes the 12-Week System, Velo-Check Analysis, 
                and Accelerator Lite for maximum gains.
              </p>
              <Link to="/products/bundles">
                <Button variant="outline">
                  View Bundles & Save
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

export default VelocityAccelerator;
