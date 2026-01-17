import { motion } from "framer-motion";
import { ArrowRight, Building2, Users, Award, CheckCircle, Zap, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice } from "@/lib/productPricing";

const OrgStarterPack = () => {
  const { checkout, loading } = useProductCheckout();

  const features = [
    {
      icon: Users,
      title: "Up to 25 Athletes",
      description: "Full VAULT™ framework access for your entire roster"
    },
    {
      icon: Award,
      title: "1 Coach Certification",
      description: "Foundations certification included for your head coach"
    },
    {
      icon: Zap,
      title: "All 5 Pillars",
      description: "Velocity, Athleticism, Utility, Longevity, Transfer"
    },
    {
      icon: Shield,
      title: "Admin Dashboard",
      description: "Track athlete progress and manage your organization"
    },
  ];

  const included = [
    "Complete VAULT™ Framework Access",
    "25 Athlete Licenses",
    "Coach Certification (Foundations)",
    "Admin Analytics Dashboard",
    "Priority Support Channel",
    "Custom Training Schedules",
    "Weekly Progress Reports",
    "Athlete Performance Tracking",
    "Video Analysis Integration",
    "1-Year Platform Access",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
                <Building2 className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">For Teams & Organizations</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display leading-[0.9] mb-6">
                <span className="text-foreground">ORG STARTER</span>
                <span className="block metallic-text">PACK</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                Everything your organization needs to implement the VAULT™ system. 
                One price. No callbacks. Start today.
              </p>

              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-5xl font-display text-foreground">{formatPrice(250000)}</span>
                <span className="text-muted-foreground">one-time payment</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  variant="vault" 
                  size="xl"
                  onClick={() => checkout('org_starter_pack')}
                  disabled={loading === 'org_starter_pack'}
                >
                  {loading === 'org_starter_pack' ? 'Processing...' : 'Buy Now'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Instant access upon purchase - no waiting for callbacks</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {features.map((feature, index) => (
                <Card 
                  key={feature.title}
                  className="p-6 bg-card border-border hover:border-accent/50 transition-colors"
                >
                  <feature.icon className="w-8 h-8 text-accent mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </motion.div>
          </div>
        </section>

        {/* What's Included */}
        <section className="container mx-auto px-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display text-foreground mb-4">
              Everything Included
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              No hidden fees. No surprise charges. Everything you need to run a professional development program.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Card className="p-8 bg-card border-border">
              <div className="grid md:grid-cols-2 gap-4">
                {included.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-br from-accent/10 to-accent/5 rounded-3xl p-12 border border-accent/20"
          >
            <h2 className="text-3xl md:text-4xl font-display text-foreground mb-4">
              Ready to Transform Your Program?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Stop waiting for callbacks. Your athletes are ready to train now.
            </p>
            <Button 
              variant="vault" 
              size="xl"
              onClick={() => checkout('org_starter_pack')}
              disabled={loading === 'org_starter_pack'}
            >
              {loading === 'org_starter_pack' ? 'Processing...' : `Get Started - ${formatPrice(250000)}`}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default OrgStarterPack;
