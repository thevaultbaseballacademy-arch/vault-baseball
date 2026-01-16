import { motion } from "framer-motion";
import { Video, Check, ArrowRight, Loader2, Clock, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const VeloCheck = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.velo_check;

  const steps = [
    {
      step: "1",
      title: "Purchase Analysis",
      description: "Complete your one-time purchase below",
    },
    {
      step: "2",
      title: "Upload Video",
      description: "Submit your throwing or hitting video after purchase",
    },
    {
      step: "3",
      title: "Get Your Fixes",
      description: "Receive 3 specific VAULT™ Fixes within 48 hours",
    },
  ];

  const includes = [
    "Professional video breakdown",
    "3 specific, actionable fixes",
    "VAULT™ framework-based analysis",
    "Priority processing (48-hour delivery)",
    "Written summary with timestamps",
    "Drill recommendations for each fix",
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
              <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
                <Video className="w-10 h-10 text-blue-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                VAULT VELO-CHECK ANALYSIS
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Professional video analysis with 3 specific VAULT™ Fixes. 
                Upload your video, get actionable feedback in 48 hours.
              </p>
            </motion.div>

            {/* Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid md:grid-cols-3 gap-6 mb-12"
            >
              {steps.map((step, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-lg font-display text-blue-500">{step.step}</span>
                  </div>
                  <h3 className="font-display text-lg text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-2">Per Session</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-display text-foreground">{formatPrice(product.price)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    48-hour turnaround
                  </div>
                </div>
                <Button
                  variant="vault"
                  size="xl"
                  onClick={() => checkout('velo_check')}
                  disabled={loading === 'velo_check'}
                >
                  {loading === 'velo_check' ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Upload className="w-5 h-5 mr-2" />
                  )}
                  Get My Analysis
                </Button>
              </div>
            </motion.div>

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-2xl p-8 mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6">What's Included</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {includes.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
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
                Ready to Apply Your Fixes?
              </h3>
              <p className="text-muted-foreground mb-4">
                Get the full VAULT™ Membership to access all training systems, 
                ongoing video analysis, and direct coach support.
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

export default VeloCheck;
