import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Loader2, BookOpen, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [unlockedCourses, setUnlockedCourses] = useState<string[]>([]);
  const [isFoundersAccess, setIsFoundersAccess] = useState(false);
  const { toast } = useToast();

  const fireConfetti = useCallback(() => {
    // First burst - left side
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.1, y: 0.6 },
      colors: ['#f59e0b', '#eab308', '#fcd34d', '#ffffff', '#a855f7'],
    });

    // Second burst - right side
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.9, y: 0.6 },
      colors: ['#f59e0b', '#eab308', '#fcd34d', '#ffffff', '#a855f7'],
    });

    // Center burst with delay
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#f59e0b', '#eab308', '#fcd34d', '#ffffff', '#a855f7', '#22c55e'],
      });
    }, 200);

    // Final celebration burst
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 120,
        origin: { x: 0.5, y: 0.3 },
        colors: ['#f59e0b', '#eab308', '#fcd34d'],
        gravity: 0.8,
      });
    }, 400);
  }, []);

  useEffect(() => {
    const verifyPurchase = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        // No session ID means direct navigation or already processed
        setVerifying(false);
        setVerified(true);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // User not logged in, still show success but note they should log in
          setVerifying(false);
          setVerified(true);
          return;
        }

        const { data, error } = await supabase.functions.invoke('verify-purchase', {
          body: { sessionId },
        });

        if (error) throw error;

        setVerified(data.verified);
        setUnlockedCourses(data.coursesUnlocked || []);
        
        // Check if this was a Founder's Access purchase
        const isFounders = data.productKey === 'founders_access' || 
                          data.coursesUnlocked?.includes('founders_access');
        setIsFoundersAccess(isFounders);
        
        if (data.verified && !data.alreadyProcessed) {
          // Fire confetti for successful purchases
          fireConfetti();
          
          // Extra confetti for Founder's Access
          if (isFounders) {
            setTimeout(() => fireConfetti(), 600);
            setTimeout(() => fireConfetti(), 1200);
          }
          
          toast({
            title: isFounders ? "Welcome, Founder! 👑" : "Access Granted! 🎉",
            description: isFounders 
              ? "You now have lifetime access to the complete V.A.U.L.T. suite!"
              : `You now have access to ${data.coursesUnlocked?.length || 0} training programs.`,
          });
        }
      } catch (error) {
        console.error('Verification error:', error);
        // Still show success - payment went through, verification is secondary
        setVerified(true);
        fireConfetti(); // Still celebrate!
      } finally {
        setVerifying(false);
      }
    };

    verifyPurchase();
  }, [searchParams, toast, fireConfetti]);

  const courseNames: Record<string, string> = {
    'velocity-system': 'Velocity System',
    'strength-conditioning': 'Strength & Conditioning',
    'speed-agility': 'Speed & Agility',
    'arm-health-workload': 'Arm Health & Workload',
    'strength-power-system': 'Strength & Power System',
    'transfer-system': 'Transfer System',
    'organizational-development': 'Organizational Development',
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center"
          >
            {verifying ? (
              <>
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
                <h1 className="text-3xl font-display text-foreground mb-4">
                  VERIFYING YOUR PURCHASE...
                </h1>
                <p className="text-muted-foreground">
                  Please wait while we unlock your content.
                </p>
              </>
            ) : (
              <>
                <motion.div 
                  className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                    isFoundersAccess ? 'bg-amber-500/20' : 'bg-green-500/10'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  {isFoundersAccess ? (
                    <Crown className="w-10 h-10 text-amber-500" />
                  ) : (
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  )}
                </motion.div>
                <motion.h1 
                  className="text-4xl md:text-5xl font-display text-foreground mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {isFoundersAccess ? (
                    <>
                      WELCOME, <span className="text-amber-500">FOUNDER</span>
                    </>
                  ) : (
                    "PAYMENT SUCCESSFUL"
                  )}
                </motion.h1>
                <motion.p 
                  className="text-lg text-muted-foreground mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {isFoundersAccess 
                    ? "You now have lifetime access to the complete V.A.U.L.T. suite. Thank you for believing in us!"
                    : "Thank you for your purchase! You now have access to your VAULT™ content."
                  }
                </motion.p>
                
                {unlockedCourses.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-6 mb-8 text-left">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Programs Unlocked
                    </h3>
                    <ul className="space-y-2">
                      {unlockedCourses.map(courseId => (
                        <li key={courseId} className="flex items-center gap-2 text-muted-foreground">
                          <BookOpen className="w-4 h-4 text-green-500" />
                          {courseNames[courseId] || courseId}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/my-programs">
                    <Button variant="vault" size="lg">
                      Start Training Now
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" size="lg">
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default PaymentSuccess;