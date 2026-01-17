import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, Lock, Users, CheckCircle, Zap, Crown, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice } from "@/lib/productPricing";
import { supabase } from "@/integrations/supabase/client";

const FoundersAccess = () => {
  const { checkout, loading } = useProductCheckout();
  const [spotsTaken, setSpotsTaken] = useState(0);
  const TOTAL_SPOTS = 50;

  useEffect(() => {
    // Check how many Founder's Access purchases have been made
    const checkSpots = async () => {
      const { count } = await supabase
        .from('user_purchases')
        .select('*', { count: 'exact', head: true })
        .eq('product_key', 'founders_access')
        .eq('status', 'completed');
      
      setSpotsTaken(count || 0);
    };
    checkSpots();
  }, []);

  const spotsRemaining = TOTAL_SPOTS - spotsTaken;
  const isSoldOut = spotsRemaining <= 0;

  const pillars = [
    { name: "Velocity", status: "Available Now", color: "text-red-500", bg: "bg-red-500/10" },
    { name: "Athleticism", status: "Available Now", color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Utility", status: "Available Now", color: "text-green-500", bg: "bg-green-500/10" },
    { name: "Longevity", status: "Coming Q2 2026", color: "text-amber-500", bg: "bg-amber-500/10" },
    { name: "Transfer", status: "Coming Q3 2026", color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const benefits = [
    "Lifetime access to ALL five VAULT™ pillars",
    "Priority access to Longevity & Transfer systems",
    "Exclusive Founder's Discord channel",
    "Direct input on future features",
    "Founder's badge on profile",
    "All future course content included",
    "No recurring fees - ever",
    "Grandfathered pricing locked in",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-500">Limited to {TOTAL_SPOTS} Athletes</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display leading-[0.9] mb-6">
                <span className="text-foreground">FOUNDER'S</span>
                <span className="block metallic-text">ACCESS</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Lifetime access to the complete V.A.U.L.T. suite—including systems that haven't even launched yet.
                One payment. Forever access.
              </p>
            </motion.div>

            {/* Scarcity Counter */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12"
            >
              <Card className={`inline-flex items-center gap-6 px-8 py-6 ${isSoldOut ? 'border-red-500/50 bg-red-500/5' : 'border-amber-500/50 bg-amber-500/5'}`}>
                <div className="text-center">
                  <div className={`text-4xl font-display ${isSoldOut ? 'text-red-500' : 'text-amber-500'}`}>
                    {spotsRemaining}
                  </div>
                  <div className="text-sm text-muted-foreground">Spots Left</div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <div className="text-4xl font-display text-foreground">
                    {formatPrice(49900)}
                  </div>
                  <div className="text-sm text-muted-foreground">Lifetime</div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <div className="text-4xl font-display text-green-500">
                    {formatPrice(150000)}+
                  </div>
                  <div className="text-sm text-muted-foreground">Value</div>
                </div>
              </Card>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button 
                variant="vault" 
                size="xl"
                onClick={() => checkout('founders_access')}
                disabled={loading === 'founders_access' || isSoldOut}
                className="mb-4"
              >
                {isSoldOut ? (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Sold Out
                  </>
                ) : loading === 'founders_access' ? (
                  'Processing...'
                ) : (
                  <>
                    Claim Your Spot
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              
              {!isSoldOut && spotsRemaining <= 10 && (
                <div className="flex items-center justify-center gap-2 text-amber-500 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Only {spotsRemaining} spots remaining!</span>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Pillars Grid */}
        <section className="container mx-auto px-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display text-foreground mb-4">
              All Five Pillars. Lifetime Access.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Get immediate access to available systems and priority access to upcoming releases.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`p-6 text-center ${pillar.bg} border-border hover:border-${pillar.color.replace('text-', '')}/50 transition-colors`}>
                  <div className={`text-3xl font-display ${pillar.color} mb-2`}>
                    {pillar.name.charAt(0)}
                  </div>
                  <div className="font-semibold text-foreground mb-1">{pillar.name}</div>
                  <div className="text-xs text-muted-foreground">{pillar.status}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="container mx-auto px-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Card className="p-8 bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-6 h-6 text-amber-500" />
                <h3 className="text-2xl font-display text-foreground">Founder's Benefits</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-display text-foreground mb-4">
              Be Part of the Foundation
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Only {TOTAL_SPOTS} athletes will ever get this offer. Once they're gone, they're gone.
            </p>
            <Button 
              variant="vault" 
              size="xl"
              onClick={() => checkout('founders_access')}
              disabled={loading === 'founders_access' || isSoldOut}
            >
              {isSoldOut ? (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Sold Out
                </>
              ) : loading === 'founders_access' ? (
                'Processing...'
              ) : (
                <>
                  {`Lock In ${formatPrice(49900)} Lifetime Access`}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FoundersAccess;
