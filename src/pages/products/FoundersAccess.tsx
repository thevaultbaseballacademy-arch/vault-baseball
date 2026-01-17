import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, Lock, Users, CheckCircle, Zap, Crown, Clock, AlertTriangle, Timer, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const FoundersAccess = () => {
  const { checkout, loading } = useProductCheckout();
  const [spotsTaken, setSpotsTaken] = useState(0);
  const TOTAL_SPOTS = 50;
  const { toast } = useToast();
  const initialLoadRef = useRef(true);
  
  // Countdown timer state - set end date to 30 days from now for demo
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Calculate countdown end date (30 days from component mount for demo)
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  // Fetch initial count and subscribe to realtime updates
  useEffect(() => {
    // Check how many Founder's Access purchases have been made
    const checkSpots = async () => {
      const { count } = await supabase
        .from('user_purchases')
        .select('*', { count: 'exact', head: true })
        .eq('product_key', 'founders_access')
        .eq('status', 'completed');
      
      setSpotsTaken(count || 0);
      // Mark initial load as complete after fetching
      setTimeout(() => {
        initialLoadRef.current = false;
      }, 1000);
    };
    checkSpots();

    // Subscribe to realtime updates for new purchases
    const channel = supabase
      .channel('founders-access-purchases')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_purchases',
          filter: 'product_key=eq.founders_access',
        },
        (payload) => {
          // When a new founders_access purchase is inserted, refresh the count
          if (payload.new && (payload.new as any).status === 'completed') {
            setSpotsTaken((prev) => {
              const newCount = prev + 1;
              const remaining = TOTAL_SPOTS - newCount;
              
              // Only show toast after initial load
              if (!initialLoadRef.current) {
                toast({
                  title: "🔥 Spot Just Claimed!",
                  description: remaining > 0 
                    ? `Someone just became a Founder! Only ${remaining} spots remaining.`
                    : "That was the last spot! Founder's Access is now SOLD OUT.",
                  duration: 5000,
                });
              }
              
              return newCount;
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_purchases',
          filter: 'product_key=eq.founders_access',
        },
        (payload) => {
          // When a purchase status changes to completed, refresh the count
          const oldStatus = (payload.old as any)?.status;
          const newStatus = (payload.new as any)?.status;
          if (oldStatus !== 'completed' && newStatus === 'completed') {
            setSpotsTaken((prev) => {
              const newCount = prev + 1;
              const remaining = TOTAL_SPOTS - newCount;
              
              // Only show toast after initial load
              if (!initialLoadRef.current) {
                toast({
                  title: "🔥 Spot Just Claimed!",
                  description: remaining > 0 
                    ? `Someone just became a Founder! Only ${remaining} spots remaining.`
                    : "That was the last spot! Founder's Access is now SOLD OUT.",
                  duration: 5000,
                });
              }
              
              return newCount;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = endDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const spotsRemaining = TOTAL_SPOTS - spotsTaken;
  const isSoldOut = spotsRemaining <= 0;
  const isUrgent = spotsRemaining <= 10 && !isSoldOut;
  const spotsPercentage = (spotsTaken / TOTAL_SPOTS) * 100;

  const pillars = [
    { name: "Velocity", letter: "V", status: "Available Now", color: "text-red-500", bg: "bg-red-500/10", borderColor: "border-red-500/30" },
    { name: "Athleticism", letter: "A", status: "Available Now", color: "text-blue-500", bg: "bg-blue-500/10", borderColor: "border-blue-500/30" },
    { name: "Utility", letter: "U", status: "Available Now", color: "text-green-500", bg: "bg-green-500/10", borderColor: "border-green-500/30" },
    { name: "Longevity", letter: "L", status: "Coming Q2 2026", color: "text-amber-500", bg: "bg-amber-500/10", borderColor: "border-amber-500/30" },
    { name: "Transfer", letter: "T", status: "Coming Q3 2026", color: "text-purple-500", bg: "bg-purple-500/10", borderColor: "border-purple-500/30" },
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

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-500">Limited to {TOTAL_SPOTS} Athletes Only</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display leading-[0.9] mb-6">
                <span className="text-foreground">FOUNDER'S</span>
                <span className="block metallic-text">ACCESS</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
                Get <span className="text-foreground font-semibold">lifetime access</span> to the complete V.A.U.L.T. suite—including systems that haven't even launched yet.
              </p>
              <p className="text-lg text-amber-500 font-medium mb-8">
                One payment. Forever access. No recurring fees.
              </p>
            </motion.div>

            {/* Countdown Timer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 mb-4">
                <Timer className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pre-Sale Ends In</span>
              </div>
              <div className="flex items-center justify-center gap-3 md:gap-4">
                {[
                  { value: timeLeft.days, label: "Days" },
                  { value: timeLeft.hours, label: "Hours" },
                  { value: timeLeft.minutes, label: "Mins" },
                  { value: timeLeft.seconds, label: "Secs" },
                ].map((item, index) => (
                  <div key={item.label} className="flex items-center gap-3 md:gap-4">
                    <div className="text-center">
                      <div className="w-16 md:w-20 h-16 md:h-20 rounded-xl bg-card border border-border flex items-center justify-center">
                        <span className="text-2xl md:text-4xl font-display text-foreground">
                          {formatNumber(item.value)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 block">{item.label}</span>
                    </div>
                    {index < 3 && (
                      <span className="text-2xl md:text-3xl font-display text-muted-foreground mb-4">:</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Spots Counter & Pricing */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-10"
            >
              <motion.div
                animate={isUrgent ? {
                  boxShadow: [
                    "0 0 0 0 rgba(239, 68, 68, 0)",
                    "0 0 20px 4px rgba(239, 68, 68, 0.4)",
                    "0 0 0 0 rgba(239, 68, 68, 0)",
                  ],
                } : {}}
                transition={isUrgent ? {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                } : {}}
              >
                <Card className={`max-w-2xl mx-auto p-6 transition-all duration-300 ${
                  isSoldOut 
                    ? 'border-red-500/50 bg-red-500/5' 
                    : isUrgent 
                      ? 'border-red-500 bg-gradient-to-br from-red-500/10 to-red-500/5' 
                      : 'border-amber-500/50 bg-gradient-to-br from-amber-500/5 to-amber-500/10'
                }`}>
                  {/* Spots Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        <span className="text-foreground font-semibold">{spotsTaken}</span> of {TOTAL_SPOTS} spots claimed
                      </span>
                      <motion.span 
                        className={`text-sm font-semibold ${isUrgent ? 'text-red-500' : 'text-amber-500'}`}
                        animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
                        transition={isUrgent ? { duration: 0.8, repeat: Infinity } : {}}
                      >
                        {spotsRemaining} remaining
                      </motion.span>
                    </div>
                    <Progress 
                      value={spotsPercentage} 
                      className={`h-3 ${isUrgent ? 'bg-red-500/20' : 'bg-muted'}`}
                    />
                    {isUrgent && (
                      <motion.div 
                        className="flex items-center justify-center gap-2 mt-3 text-red-500 text-sm font-semibold"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          animate={{ rotate: [0, -10, 10, -10, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                        >
                          <AlertTriangle className="w-5 h-5" />
                        </motion.div>
                        <span>🔥 Almost sold out! Only {spotsRemaining} spots left!</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground line-through mb-1">$1,500+</div>
                      <motion.div 
                        className={`text-5xl font-display ${isUrgent ? 'text-red-500' : 'text-foreground'}`}
                        animate={isUrgent ? { scale: [1, 1.02, 1] } : {}}
                        transition={isUrgent ? { duration: 1, repeat: Infinity } : {}}
                      >
                        $499
                      </motion.div>
                      <div className="text-sm text-muted-foreground">Lifetime Access</div>
                    </div>
                    <div className="w-px h-16 bg-border" />
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">You Save</div>
                      <div className="text-3xl font-display text-green-500">$1,000+</div>
                      <div className="text-sm text-muted-foreground">vs. Individual</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.div
                animate={isUrgent ? { scale: [1, 1.03, 1] } : {}}
                transition={isUrgent ? { duration: 0.8, repeat: Infinity } : {}}
              >
                <Button 
                  variant="vault" 
                  size="xl"
                  onClick={() => checkout('founders_access')}
                  disabled={loading === 'founders_access' || isSoldOut}
                  className={`mb-4 px-12 ${isUrgent ? 'animate-pulse bg-red-600 hover:bg-red-700' : ''}`}
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
                      {isUrgent ? '🔥 ' : ''}Claim Your Founder's Spot - $499
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
              <p className="text-sm text-muted-foreground">
                Secure checkout • Instant access • No recurring fees
              </p>
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

          <div className="grid grid-cols-5 gap-2 md:gap-4 max-w-4xl mx-auto">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`p-3 md:p-6 text-center ${pillar.bg} ${pillar.borderColor} border-2 hover:scale-105 transition-transform`}>
                  <div className={`text-2xl md:text-4xl font-display ${pillar.color} mb-1 md:mb-2`}>
                    {pillar.letter}
                  </div>
                  <div className="font-semibold text-foreground text-xs md:text-base mb-1">{pillar.name}</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground hidden md:block">{pillar.status}</div>
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

        {/* Social Proof */}
        <section className="container mx-auto px-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <p className="text-foreground text-lg mb-4">
                "Getting Founder's Access was the best investment I've made for my baseball career. 
                The value keeps growing as new systems get released."
              </p>
              <p className="text-sm text-muted-foreground">— Early Access Athlete</p>
            </div>
          </motion.div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-br from-amber-500/10 to-purple-500/10 rounded-3xl p-12 border border-amber-500/20"
          >
            <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-display text-foreground mb-4">
              Be Part of the Foundation
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Only <span className="text-foreground font-semibold">{TOTAL_SPOTS}</span> athletes will ever get this offer. 
              Once they're gone, they're gone forever.
            </p>
            <div className="flex items-center justify-center gap-4 mb-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Lifetime Access
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                All 5 Pillars
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                No Recurring Fees
              </span>
            </div>
            <Button 
              variant="vault" 
              size="xl"
              onClick={() => checkout('founders_access')}
              disabled={loading === 'founders_access' || isSoldOut}
              className="px-12"
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
                  Lock In $499 Lifetime Access
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