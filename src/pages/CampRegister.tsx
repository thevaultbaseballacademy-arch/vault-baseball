import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck, MapPin, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { openCheckout } from "@/lib/openCheckout";
import { invokeCheckout } from "@/lib/checkoutInvoke";

type Cohort = {
  id: string; camp_id: string; age_label: string; age_min: number; age_max: number;
  venue_name: string; venue_address: string | null; venue_city: string | null;
  venue_state: string | null; venue_zip: string | null;
  daily_start_time: string | null; daily_end_time: string | null;
};
type Camp = { id: string; name: string; weekly_price_cents: number; full_pass_price_cents: number; full_pass_savings_cents: number; status: string };
type Sess = { id: string; cohort_id: string; session_number: number; starts_on: string; ends_on: string; capacity: number; status: string };
type Cap = { session_id: string; confirmed_count: number; pending_count: number; capacity: number };

const fmtMoney = (c: number) => `$${(c / 100).toFixed(0)}`;
const fmtDate = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

const CampRegister = () => {
  const { cohortId } = useParams<{ cohortId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [camp, setCamp] = useState<Camp | null>(null);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [sessions, setSessions] = useState<Sess[]>([]);
  const [capMap, setCapMap] = useState<Record<string, Cap>>({});

  // Selections
  const [type, setType] = useState<"weekly" | "full_pass">("full_pass");
  const [picked, setPicked] = useState<string[]>([]);

  // Form
  const [form, setForm] = useState({
    player_first_name: "", player_last_name: "", player_dob: "",
    parent_name: "", parent_email: "", parent_phone: "",
    emergency_contact_name: "", emergency_contact_phone: "", emergency_contact_relationship: "",
    medical_notes: "",
    photo_release_consent: false, waiver_accepted: false, waiver_signature_name: "",
  });

  useEffect(() => {
    if (!cohortId) return;
    let cancel = false;
    const safety = window.setTimeout(() => { if (!cancel) setLoading(false); }, 6000);
    (async () => {
      try {
        const { data: ch } = await (supabase.from("camp_cohorts" as any) as any).select("*").eq("id", cohortId).maybeSingle();
        if (cancel || !ch) return;
        setCohort(ch as Cohort);
        const { data: cp } = await (supabase.from("camps" as any) as any)
          .select("id, name, weekly_price_cents, full_pass_price_cents, full_pass_savings_cents, status")
          .eq("id", (ch as any).camp_id).maybeSingle();
        if (cancel || !cp) return;
        setCamp(cp as Camp);
        const { data: ss } = await (supabase.from("camp_sessions" as any) as any)
          .select("*").eq("cohort_id", cohortId).order("session_number");
        if (cancel) return;
        const list = (ss || []) as Sess[];
        setSessions(list);
        const { data: caps } = await supabase.rpc("get_camp_session_capacity" as any, { p_session_ids: list.map(s => s.id) });
        const m: Record<string, Cap> = {};
        ((caps as any[]) || []).forEach((r: any) => { m[r.session_id] = r; });
        if (!cancel) setCapMap(m);
        // Default: full pass with all available sessions
        if (!cancel) setPicked(list.filter(s => {
          const c = m[s.id]; return !c || c.confirmed_count + c.pending_count < s.capacity;
        }).map(s => s.id));
      } catch (e) { console.error(e); }
      finally { window.clearTimeout(safety); if (!cancel) setLoading(false); }
    })();
    return () => { cancel = true; window.clearTimeout(safety); };
  }, [cohortId]);

  const toggleSession = (id: string) => {
    if (type === "full_pass") return; // locked to all 4
    setPicked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  useEffect(() => {
    if (type === "full_pass") setPicked(sessions.map(s => s.id));
  }, [type, sessions]);

  const amountCents = useMemo(() => {
    if (!camp) return 0;
    if (type === "full_pass") return camp.full_pass_price_cents;
    return camp.weekly_price_cents * picked.length;
  }, [camp, type, picked]);

  const update = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));

  const validate = (): string | null => {
    if (type === "full_pass" && picked.length !== 4) return "Full Pass requires all 4 weeks.";
    if (type === "weekly" && picked.length === 0) return "Select at least one week.";
    if (!form.player_first_name || !form.player_last_name) return "Player name is required.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.player_dob)) return "Player date of birth is required (YYYY-MM-DD).";
    if (!form.parent_name) return "Parent name is required.";
    if (!/.+@.+\..+/.test(form.parent_email)) return "Valid parent email is required.";
    if (form.parent_phone.length < 7) return "Parent phone is required.";
    if (!form.emergency_contact_name || !form.emergency_contact_phone || !form.emergency_contact_relationship)
      return "Emergency contact is required.";
    if (!form.waiver_accepted) return "You must accept the waiver.";
    if (!form.waiver_signature_name) return "Type your name as waiver signature.";
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast({ title: "Check your form", description: err, variant: "destructive" });
      return;
    }
    if (!camp || !cohort) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("register-for-camp", {
        body: {
          camp_id: camp.id,
          cohort_id: cohort.id,
          session_ids: picked,
          registration_type: type,
          payment_method: "bank_transfer",
          player_first_name: form.player_first_name.trim(),
          player_last_name: form.player_last_name.trim(),
          player_dob: form.player_dob,
          parent_name: form.parent_name.trim(),
          parent_email: form.parent_email.trim().toLowerCase(),
          parent_phone: form.parent_phone.trim(),
          emergency_contact_name: form.emergency_contact_name.trim(),
          emergency_contact_phone: form.emergency_contact_phone.trim(),
          emergency_contact_relationship: form.emergency_contact_relationship.trim(),
          medical_notes: form.medical_notes?.trim() || null,
          photo_release_consent: form.photo_release_consent,
          waiver_accepted: true,
          waiver_signature_name: form.waiver_signature_name.trim(),
        },
      });

      const payload: any = data ?? (error as any)?.context?.body;
      if (error || !payload?.success) {
        const msg = payload?.error || error?.message || "Could not reserve your spot.";
        toast({ title: "Registration failed", description: msg, variant: "destructive" });
        setSubmitting(false);
        return;
      }

      toast({
        title: "Spot reserved",
        description: "Follow the bank transfer instructions to complete payment.",
      });
      const url = payload.instructions_url || `/payment/bank-instructions/${payload.order_id}`;
      navigate(url.replace(/^https?:\/\/[^/]+/, ""));
    } catch (e: any) {
      toast({ title: "Registration failed", description: e?.message ?? "Try again.", variant: "destructive" });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center pt-40"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!camp || !cohort) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 container mx-auto px-4 max-w-2xl">
          <Card><CardContent className="py-10 text-center text-muted-foreground">Cohort not found.</CardContent></Card>
          <div className="text-center mt-6"><Link to="/camps" className="text-primary text-sm">Back to camps</Link></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/camps" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to camps
          </Link>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <span className="text-[11px] font-display tracking-[0.3em] text-primary mb-2 block">REGISTER · {cohort.age_label.toUpperCase()}</span>
            <h1 className="text-2xl md:text-4xl font-display text-foreground">{camp.name}</h1>
            <div className="mt-3 text-sm text-muted-foreground space-y-1">
              <div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5" /><span>{cohort.venue_name} · {cohort.venue_city}, {cohort.venue_state}</span></div>
              {cohort.daily_start_time && <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /><span>Ages {cohort.age_min}–{cohort.age_max}</span></div>}
            </div>
          </motion.div>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Step 1: Plan */}
            <Card><CardContent className="p-5 space-y-4">
              <p className="text-xs font-display tracking-[0.25em] text-muted-foreground">1 · CHOOSE YOUR PLAN</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <button type="button" onClick={() => setType("full_pass")}
                  className={`text-left p-4 border rounded-md ${type === "full_pass" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <p className="text-[10px] font-display tracking-[0.25em] text-primary">FULL 4-WEEK PASS</p>
                  <p className="text-xl font-display text-foreground mt-1">{fmtMoney(camp.full_pass_price_cents)}</p>
                  <p className="text-xs text-primary mt-1">Save {fmtMoney(camp.full_pass_savings_cents)}</p>
                </button>
                <button type="button" onClick={() => setType("weekly")}
                  className={`text-left p-4 border rounded-md ${type === "weekly" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground">SINGLE WEEK</p>
                  <p className="text-xl font-display text-foreground mt-1">{fmtMoney(camp.weekly_price_cents)}<span className="text-sm text-muted-foreground"> /week</span></p>
                  <p className="text-xs text-muted-foreground mt-1">Pick the weeks you need</p>
                </button>
              </div>

              <div>
                <p className="text-[10px] font-display tracking-[0.2em] text-muted-foreground mb-2">
                  {type === "full_pass" ? "ALL 4 WEEKS INCLUDED" : "SELECT WEEKS"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {sessions.map(s => {
                    const c = capMap[s.id];
                    const taken = c ? c.confirmed_count + c.pending_count : 0;
                    const full = taken >= s.capacity;
                    const sel = picked.includes(s.id);
                    return (
                      <button key={s.id} type="button" disabled={full || type === "full_pass"} onClick={() => toggleSession(s.id)}
                        className={`text-left text-xs p-2.5 border rounded-md transition-colors ${
                          full ? "border-border text-muted-foreground line-through opacity-60 cursor-not-allowed"
                            : sel ? "border-primary bg-primary/10 text-foreground"
                            : "border-border text-foreground hover:border-primary/40"
                        }`}>
                        <span className="font-display tracking-wider">WEEK {s.session_number}</span>
                        <div>{fmtDate(s.starts_on)}–{fmtDate(s.ends_on)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent></Card>

            {/* Step 2: Player */}
            <Card><CardContent className="p-5 space-y-4">
              <p className="text-xs font-display tracking-[0.25em] text-muted-foreground">2 · PLAYER</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label htmlFor="pfn">First name</Label><Input id="pfn" value={form.player_first_name} onChange={e => update("player_first_name", e.target.value)} required /></div>
                <div><Label htmlFor="pln">Last name</Label><Input id="pln" value={form.player_last_name} onChange={e => update("player_last_name", e.target.value)} required /></div>
                <div className="sm:col-span-2"><Label htmlFor="pdob">Date of birth</Label><Input id="pdob" type="date" value={form.player_dob} onChange={e => update("player_dob", e.target.value)} required /></div>
              </div>
            </CardContent></Card>

            {/* Step 3: Parent + Emergency */}
            <Card><CardContent className="p-5 space-y-4">
              <p className="text-xs font-display tracking-[0.25em] text-muted-foreground">3 · PARENT & EMERGENCY CONTACT</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label htmlFor="pn">Parent name</Label><Input id="pn" value={form.parent_name} onChange={e => update("parent_name", e.target.value)} required /></div>
                <div><Label htmlFor="pe">Parent email</Label><Input id="pe" type="email" value={form.parent_email} onChange={e => update("parent_email", e.target.value)} required /></div>
                <div className="sm:col-span-2"><Label htmlFor="pp">Parent phone</Label><Input id="pp" type="tel" value={form.parent_phone} onChange={e => update("parent_phone", e.target.value)} required /></div>
                <div><Label htmlFor="ecn">Emergency contact name</Label><Input id="ecn" value={form.emergency_contact_name} onChange={e => update("emergency_contact_name", e.target.value)} required /></div>
                <div><Label htmlFor="ecp">Emergency phone</Label><Input id="ecp" type="tel" value={form.emergency_contact_phone} onChange={e => update("emergency_contact_phone", e.target.value)} required /></div>
                <div className="sm:col-span-2"><Label htmlFor="ecr">Relationship</Label><Input id="ecr" placeholder="e.g. Grandparent, Uncle" value={form.emergency_contact_relationship} onChange={e => update("emergency_contact_relationship", e.target.value)} required /></div>
                <div className="sm:col-span-2"><Label htmlFor="med">Medical notes / allergies (optional)</Label><Textarea id="med" rows={3} value={form.medical_notes} onChange={e => update("medical_notes", e.target.value)} /></div>
              </div>
            </CardContent></Card>

            {/* Step 4: Waiver */}
            <Card><CardContent className="p-5 space-y-4">
              <p className="text-xs font-display tracking-[0.25em] text-muted-foreground">4 · WAIVER & CONSENT</p>
              <div className="text-xs text-muted-foreground border border-border rounded-md p-3 max-h-32 overflow-y-auto leading-relaxed">
                I, the parent/guardian, acknowledge that participation in baseball training carries inherent risks of injury. I release VAULT Baseball, its coaches, and 22M Elite from liability for injuries sustained during normal participation, except those resulting from gross negligence. I confirm the player is medically cleared to participate.
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox checked={form.waiver_accepted} onCheckedChange={v => update("waiver_accepted", !!v)} />
                <span className="text-sm text-foreground">I have read and accept the waiver above.</span>
              </label>
              <div><Label htmlFor="sig">Type your full legal name to sign</Label><Input id="sig" value={form.waiver_signature_name} onChange={e => update("waiver_signature_name", e.target.value)} placeholder="Full legal name" /></div>
              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox checked={form.photo_release_consent} onCheckedChange={v => update("photo_release_consent", !!v)} />
                <span className="text-sm text-muted-foreground">I consent to photo/video for marketing use (optional).</span>
              </label>
            </CardContent></Card>

            {/* Total + submit */}
            <div className="border border-primary/30 bg-primary/5 rounded-md p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground">TOTAL</p>
                <p className="text-2xl font-display text-foreground">{fmtMoney(amountCents)}</p>
                <p className="text-xs text-muted-foreground">{type === "full_pass" ? "Full 4-week pass" : `${picked.length} week${picked.length === 1 ? "" : "s"}`}</p>
              </div>
              <Button type="submit" variant="vault" size="lg" disabled={submitting}>
                {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Reserving…</>) : (<>Reserve spot · Pay by bank transfer <ArrowRight className="w-4 h-4 ml-2" /></>)}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Spot held while you complete the bank transfer · Instructions shown next & emailed
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CampRegister;
