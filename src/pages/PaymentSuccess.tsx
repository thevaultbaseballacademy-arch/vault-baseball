import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Loader2, BookOpen, Zap, Crown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

interface VerifyPurchaseResponse {
  verified: boolean;
  products?: string[];
  productKey?: string;
  coursesUnlocked?: string[];
  isFoundersAccess?: boolean;
  alreadyProcessed?: boolean;
  message?: string;
  warnings?: string[];
  error?: string;
  code?: string;
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [unlockedCourses, setUnlockedCourses] = useState<string[]>([]);
  const [isFoundersAccess, setIsFoundersAccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
        // No session ID means direct navigation - still show success
        setVerifying(false);
        setVerified(true);
        fireConfetti();
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // User not logged in - prompt them to log in
          setVerifying(false);
          setVerified(true);
          setErrorMessage("Please sign in to access your purchased content.");
          return;
        }

        const { data, error } = await supabase.functions.invoke<VerifyPurchaseResponse>('verify-purchase', {
          body: { sessionId },
        });

        if (error) {
          console.error('Verification function error:', error);
          // Still show success since payment went through
          setVerified(true);
          setErrorMessage("Your payment was successful, but we couldn't verify your access. Please contact support if you don't see your content.");
          fireConfetti();
          return;
        }

        if (data?.error) {
          console.error('Verification error:', data.error);
          setVerified(false);
          setErrorMessage(data.error);
          return;
        }

        setVerified(data?.verified ?? false);
        setUnlockedCourses(data?.coursesUnlocked || []);
        setIsFoundersAccess(data?.isFoundersAccess || false);
        
        if (data?.verified) {
          // Fire confetti for successful purchases
          fireConfetti();
          
          // Extra confetti for Founder's Access
          if (data.isFoundersAccess) {
            setTimeout(() => fireConfetti(), 600);
            setTimeout(() => fireConfetti(), 1200);
          }
          
          if (!data.alreadyProcessed) {
            toast({
              title: data.isFoundersAccess ? "Welcome, Founder! 👑" : "Access Granted! 🎉",
              description: data.isFoundersAccess 
                ? "You now have lifetime access to the complete V.A.U.L.T. suite!"
                : `You now have access to ${data.coursesUnlocked?.length || 0} training programs.`,
            });
          }
          
          // Show warnings if any
          if (data.warnings && data.warnings.length > 0) {
            toast({
              title: "Note",
              description: "Some items may require additional setup. Check your dashboard.",
              variant: "default",
            });
          }
        }
      } catch (error) {
        console.error('Verification error:', error);
        // Still show success - payment went through
        setVerified(true);
        fireConfetti();
        toast({
          title: "Payment Successful! 🎉",
          description: "Your access is being set up. Check your dashboard in a moment.",
        });
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
            ) : verified ? (
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
                
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-200">{errorMessage}</p>
                    </div>
                  </motion.div>
                )}
                
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
            ) : (
              <>
                <motion.div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-500/10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </motion.div>
                <motion.h1 
                  className="text-4xl md:text-5xl font-display text-foreground mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  VERIFICATION ISSUE
                </motion.h1>
                <motion.p 
                  className="text-lg text-muted-foreground mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {errorMessage || "We couldn't verify your purchase. Please contact support."}
                </motion.p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contact">
                    <Button variant="vault" size="lg">
                      Contact Support
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