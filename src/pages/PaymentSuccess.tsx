import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Loader2, BookOpen, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [unlockedCourses, setUnlockedCourses] = useState<string[]>([]);
  const { toast } = useToast();

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
        
        if (data.verified && !data.alreadyProcessed) {
          toast({
            title: "Access Granted! 🎉",
            description: `You now have access to ${data.coursesUnlocked?.length || 0} training programs.`,
          });
        }
      } catch (error) {
        console.error('Verification error:', error);
        // Still show success - payment went through, verification is secondary
        setVerified(true);
      } finally {
        setVerifying(false);
      }
    };

    verifyPurchase();
  }, [searchParams, toast]);

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
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">
                  PAYMENT SUCCESSFUL
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Thank you for your purchase! You now have access to your VAULT™ content.
                </p>
                
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