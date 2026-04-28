import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AGE_GROUPS = ["8U", "9U", "10U", "11U", "12U", "13U", "14U", "15U", "16U", "17U", "18U"];

const TryoutsInterest = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    parent_name: "",
    age_group: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("tryout_interest").insert({
      email: form.email.toLowerCase().trim(),
      parent_name: form.parent_name || null,
      age_group: form.age_group || null,
      notes: form.notes || null,
    });
    setLoading(false);

    if (error) {
      toast.error("Could not save your info. Please try again.");
      return;
    }
    setSubmitted(true);
  };

  useEffect(() => {
    document.title = "Tryouts — Coming Soon | The Vault Baseball Academy";
    const setMeta = (selector: string, attr: string, name: string, content: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta('meta[name="description"]', "name", "description",
      "Get notified when our next baseball & softball tryouts open for registration. Join the waitlist.");
    setMeta('meta[property="og:title"]', "property", "og:title", "Vault Tryouts — Get Notified");
    setMeta('meta[property="og:description"]', "property", "og:description",
      "Be first in line when our next tryout drops. Join the waitlist for spring & fall events.");
    setMeta('meta[property="og:type"]', "property", "og:type", "website");
  }, []);

  return (
    <>
      <main className="min-h-screen bg-background">
        <Navbar />

        <section className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
                <CalendarClock className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">
                Tryouts — Coming Soon
              </h1>
              <p className="text-lg text-muted-foreground">
                No tryouts are open right now. Drop your email and we'll notify you the moment
                registration opens for your athlete's age group.
              </p>
            </motion.div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-2xl p-10 text-center"
              >
                <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-display font-bold mb-2 text-foreground">
                  You're on the list
                </h2>
                <p className="text-muted-foreground">
                  We'll email you the second the next tryout opens. Keep an eye on your inbox.
                </p>
              </motion.div>
            ) : (
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-5"
              >
                <div>
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="parent@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="parent_name">Parent name (optional)</Label>
                  <Input
                    id="parent_name"
                    placeholder="Jane Smith"
                    value={form.parent_name}
                    onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="age_group">Athlete's age group (optional)</Label>
                  <Select
                    value={form.age_group}
                    onValueChange={(v) => setForm({ ...form, age_group: v })}
                  >
                    <SelectTrigger id="age_group" className="mt-1.5">
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGE_GROUPS.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Anything we should know? (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Position, prior team, questions…"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full" size="lg">
                  {loading ? "Saving…" : "Notify me when tryouts open"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  We'll only email you about tryouts. No spam, ever.
                </p>
              </motion.form>
            )}
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default TryoutsInterest;
