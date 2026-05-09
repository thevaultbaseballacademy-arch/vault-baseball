import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, CalendarDays, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const CampSuccess = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState<"checking" | "confirmed" | "pending">("checking");

  useEffect(() => {
    if (!sessionId) { setStatus("pending"); return; }
    let cancel = false;
    let tries = 0;
    const poll = async () => {
      tries++;
      const { data } = await (supabase.from("camp_registrations" as any) as any)
        .select("status")
        .eq("stripe_checkout_session_id", sessionId)
        .maybeSingle();
      if (cancel) return;
      const s = (data as any)?.status;
      if (s === "confirmed") { setStatus("confirmed"); return; }
      if (tries < 12) setTimeout(poll, 2000);
      else setStatus("pending");
    };
    poll();
    return () => { cancel = true; };
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-xl">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-primary/30">
              <CardContent className="p-8 text-center">
                {status === "checking" ? (
                  <>
                    <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
                    <h1 className="text-2xl font-display text-foreground mb-2">Confirming your spot…</h1>
                    <p className="text-sm text-muted-foreground">This usually takes a few seconds.</p>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-display text-foreground mb-2">
                      {status === "confirmed" ? "You're in." : "Payment received."}
                    </h1>
                    <p className="text-sm text-muted-foreground mb-6">
                      {status === "confirmed"
                        ? "Your camp spot is locked. A confirmation email is on its way."
                        : "We're finalizing your registration. You'll get an email confirmation shortly."}
                    </p>
                    <div className="text-left space-y-3 text-sm text-muted-foreground border-t border-border pt-5">
                      <div className="flex items-start gap-3"><Mail className="w-4 h-4 mt-0.5 text-primary" /><span>Check your inbox for the receipt and full venue details.</span></div>
                      <div className="flex items-start gap-3"><CalendarDays className="w-4 h-4 mt-0.5 text-primary" /><span>Add the camp dates to your calendar so you don't miss day one.</span></div>
                    </div>
                    <div className="mt-7 flex flex-col sm:flex-row gap-2">
                      <Link to="/camps" className="flex-1"><Button variant="outline" className="w-full">Back to camps</Button></Link>
                      <Link to="/" className="flex-1"><Button variant="vault" className="w-full">Explore VAULT</Button></Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CampSuccess;
