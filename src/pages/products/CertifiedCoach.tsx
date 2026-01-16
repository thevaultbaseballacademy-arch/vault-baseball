import { motion } from "framer-motion";
import { Award, Check, ArrowRight, Loader2, BookOpen, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const CertifiedCoach = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.certified_coach;

  const benefits = [
    {
      icon: Award,
      title: "Official Certification",
      description: "Earn the VAULT™ Certified Coach badge and credentials",
    },
    {
      icon: BookOpen,
      title: "Drill Library Access",
      description: "Complete access to the VAULT™ drill library with 200+ exercises",
    },
    {
      icon: Globe,
      title: "Website Listing",
      description: "Get listed in the official VAULT™ Certified Coach directory",
    },
    {
      icon: Users,
      title: "Brand Usage Rights",
      description: "Permission to use VAULT™ branding in your coaching business",
    },
  ];

  const includes = [
    "VAULT™ Certified Coach digital badge",
    "Annual certification renewal",
    "Full drill library access (200+ drills)",
    "Programming templates",
    "Coach education modules",
    "Listing on Find a Coach directory",
    "VAULT™ brand usage license",
    "Exclusive coach community access",
    "Quarterly webinars & updates",
    "Priority support channel",
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
              <div className="w-20 h-20 rounded-2xl bg-foreground flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-background" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                VAULT™ CERTIFIED COACH PROGRAM
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join the network of certified VAULT™ coaches. Get the credentials, 
                resources, and recognition to grow your coaching business.
              </p>
            </motion.div>

            {/* Benefits Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <div key={i} className="bg-card border border-border rounded-xl p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-foreground" />
                    </div>
                    <h3 className="font-display text-lg text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                );
              })}
            </motion.div>

            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-foreground to-foreground/90 border border-border rounded-2xl p-8 mb-12 text-background"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-background/70 font-medium mb-2">Annual Certification</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-display">{formatPrice(product.price)}</span>
                    <span className="text-background/70">/year</span>
                  </div>
                  <p className="text-sm text-background/70">
                    Full access to all coach resources and certification
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="xl"
                  onClick={() => checkout('certified_coach')}
                  disabled={loading === 'certified_coach'}
                  className="bg-background text-foreground hover:bg-background/90"
                >
                  {loading === 'certified_coach' ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  Get Certified
                  <ArrowRight className="w-5 h-5 ml-2" />
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
              <h3 className="text-2xl font-display text-foreground mb-6">Everything Included</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {includes.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Directory Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-secondary/50 rounded-2xl p-8 text-center"
            >
              <h3 className="text-xl font-display text-foreground mb-2">
                Looking for a Certified Coach?
              </h3>
              <p className="text-muted-foreground mb-4">
                Browse our directory of VAULT™ Certified Coaches to find expert training in your area.
              </p>
              <Link to="/find-coach">
                <Button variant="outline">
                  Find a VAULT™ Coach
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

export default CertifiedCoach;
