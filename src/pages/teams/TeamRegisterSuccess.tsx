import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TeamRegisterSuccess = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState<"checking" | "confirmed" | "pending">("checking");
  const [details, setDetails] = useState<{ teamLevel?: string; playerName?: string }>({});

  useEffect(() => {
    if (!sessionId) {
      setStatus("pending");
      return;
    }
    let canceled = false;

    (async () => {
      try {
        const { data } = await supabase.functions.invoke("verify-team-registration-payment", {
          body: { sessionId },
        });
        if (canceled) return;
        if ((data as any)?.status === "confirmed") {
          setStatus("confirmed");
          setDetails({
            teamLevel: (data as any).teamLevel,
            playerName: (data as any).playerName,
          });
        } else {
          setStatus("pending");
        }
      } catch {
        if (!canceled) setStatus("pending");
      }
    })();

    return () => {
      canceled = true;
    };
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
                    <h1 className="text-2xl font-display tracking-wide mb-2">
                      Confirming your spot…
                    </h1>
                    <p className="text-sm text-muted-foreground">Hang tight, this takes a few seconds.</p>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-display tracking-wide mb-2">
                      {status === "confirmed" ? "You're in." : "Payment received."}
                    </h1>
                    <p className="text-sm text-muted-foreground mb-2">
                      {details.playerName ? `${details.playerName} — ` : ""}
                      {details.teamLevel ?? "Vault Travel Team"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      {status === "confirmed"
                        ? "Your roster spot is locked. A confirmation email is on its way and our staff will be in touch with next steps."
                        : "We're finalizing your registration. You'll get an email shortly."}
                    </p>
                    <Button asChild>
                      <Link to="/">Return Home</Link>
                    </Button>
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

export default TeamRegisterSuccess;
