import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AthleteOnboarding = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    athlete_goals: "",
    current_level: "",
    position: "",
    current_velocity: "",
    exit_velo: "",
    sixty_time: "",
    social_handle: "",
    email: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || "");
        setForm(f => ({ ...f, email: session.user.email || "" }));
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim()) {
      toast({ title: "Required", description: "Email is required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("athlete_onboarding").insert({
        user_id: userId,
        email: form.email.trim(),
        athlete_goals: form.athlete_goals.trim() || null,
        current_level: form.current_level || null,
        position: form.position || null,
        current_velocity: form.current_velocity.trim() || null,
        exit_velo: form.exit_velo.trim() || null,
        sixty_time: form.sixty_time.trim() || null,
        social_handle: form.social_handle.trim() || null,
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          {submitted ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
              <div className="w-20 h-20 bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-4xl font-display text-foreground mb-3">YOU'RE ALL SET</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Welcome to Vault. Your development journey starts now.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate("/courses")}>
                  Browse Training Courses
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-display text-foreground mb-2">ATHLETE ONBOARDING</h1>
                <p className="text-muted-foreground">
                  Tell us about yourself so we can personalize your development plan.
                </p>
              </div>

              <div className="bg-card border border-border p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="email">Best Email *</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@email.com" required maxLength={255} />
                  </div>

                  <div>
                    <Label htmlFor="goals">What are your top development goals?</Label>
                    <Textarea id="goals" value={form.athlete_goals} onChange={(e) => setForm(f => ({ ...f, athlete_goals: e.target.value }))} placeholder="E.g., Increase velocity by 5 mph, improve mechanics, get recruited..." maxLength={1000} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Current Level</Label>
                      <Select value={form.current_level} onValueChange={(v) => setForm(f => ({ ...f, current_level: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="youth">Youth (12U)</SelectItem>
                          <SelectItem value="middle_school">Middle School</SelectItem>
                          <SelectItem value="high_school_jv">High School JV</SelectItem>
                          <SelectItem value="high_school_varsity">High School Varsity</SelectItem>
                          <SelectItem value="travel">Travel Ball</SelectItem>
                          <SelectItem value="college">College</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Primary Position</Label>
                      <Select value={form.position} onValueChange={(v) => setForm(f => ({ ...f, position: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pitcher">Pitcher</SelectItem>
                          <SelectItem value="catcher">Catcher</SelectItem>
                          <SelectItem value="infielder">Infielder</SelectItem>
                          <SelectItem value="outfielder">Outfielder</SelectItem>
                          <SelectItem value="utility">Utility</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="velo">Throwing Velo (mph)</Label>
                      <Input id="velo" value={form.current_velocity} onChange={(e) => setForm(f => ({ ...f, current_velocity: e.target.value }))} placeholder="e.g., 78" maxLength={10} />
                    </div>
                    <div>
                      <Label htmlFor="exit">Exit Velo (mph)</Label>
                      <Input id="exit" value={form.exit_velo} onChange={(e) => setForm(f => ({ ...f, exit_velo: e.target.value }))} placeholder="e.g., 85" maxLength={10} />
                    </div>
                    <div>
                      <Label htmlFor="sixty">60-Yard Dash</Label>
                      <Input id="sixty" value={form.sixty_time} onChange={(e) => setForm(f => ({ ...f, sixty_time: e.target.value }))} placeholder="e.g., 7.2" maxLength={10} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="social">Social Handle (Instagram/Twitter)</Label>
                    <Input id="social" value={form.social_handle} onChange={(e) => setForm(f => ({ ...f, social_handle: e.target.value }))} placeholder="@yourhandle" maxLength={100} />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                    Complete Onboarding
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default AthleteOnboarding;
