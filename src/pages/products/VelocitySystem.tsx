import { motion } from "framer-motion";
import { Zap, Check, ArrowRight, Loader2, TrendingUp, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileConversionBar from "@/components/products/MobileConversionBar";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const VelocitySystem = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.velocity_12week;

  const features = [
    "12 weeks of structured programming",
    "Lower body → rotational → transfer phases",
    "Med ball & intent-based training",
    "Weekly progression model",
    "Built-in testing checkpoints",
    "Video demonstration library",
    "Exit velocity tracking templates",
    "Pitch velocity development protocols",
  ];

  const whoItsFor = [
    { icon: Target, text: "HS & college-bound hitters" },
    { icon: TrendingUp, text: "Players chasing real EV jumps" },
    { icon: Users, text: "Athletes who want results without ongoing membership" },
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
                INCREASE BAT SPEED. INCREASE EXIT VELOCITY.
              </h1>
              <p className="text-2xl font-display text-red-500 mb-4">
                DO IT THE RIGHT WAY.
              </p>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                A 12-week, phase-based velocity system built for serious baseball players 
                who want real, measurable power gains — without a subscription.
              </p>
            </motion.div>

            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
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
                    Buy the 12-Week Velocity System
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-2xl p-8 mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6">What's Included</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Who It's For */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-2xl p-8 mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6">Who It's For</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {whoItsFor.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-red-500" />
                      </div>
                      <span className="text-muted-foreground">{item.text}</span>
                    </div>
                  );
                })}
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
                Want Coaching Feedback, Metrics Tracking, and Ongoing Programming?
              </h3>
              <p className="text-muted-foreground mb-4">
                Upgrade to Vault Performance Membership for personalized coaching, 
                video analysis, and access to all five training systems.
              </p>
              <Link to="/#pricing">
                <Button variant="outline">
                  Upgrade to Vault Performance Membership
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
        productKey="velocity_12week"
        onCheckout={checkout}
        loading={loading}
        ctaText="Buy System"
      />
      <Footer />
    </main>
  );
};

export default VelocitySystem;
