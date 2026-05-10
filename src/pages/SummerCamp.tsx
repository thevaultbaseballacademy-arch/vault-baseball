// VAULT — Summer Camp Registration (shareable landing + form).
// Edit CAMP_DETAILS below to update the page before publishing.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import {
  CalendarDays, MapPin, Clock, Users, DollarSign, CheckCircle2,
  ShieldCheck, Trophy, Target, ArrowRight, Loader2, Mail, Phone,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// ─────────────────────────────────────────────────────────────────
// EDIT THIS BLOCK before publishing — placeholder camp details.
// ─────────────────────────────────────────────────────────────────
const CAMP_DETAILS = {
  name: "VAULT SUMMER ELITE CAMP",
  tagline: "Four weeks. Measurable gains. One system.",
  dates: "June 22 – July 17, 2026",
  time: "9:00 AM – 12:00 PM daily (Mon–Fri)",
  location: "VAULT Performance Facility — 1245 Sportsplex Dr, Houston, TX 77024",
  ageGroups: "Ages 8–18 (grouped by skill + age)",
  price: "$295 / week  ·  $995 Full 4-Week Pass (save $185)",
  spotsAvailable: 24, // per session
  sessions: [
    { value: "week-1", label: "Week 1 · June 22–26, 2026" },
    { value: "week-2", label: "Week 2 · June 29 – July 3, 2026" },
    { value: "week-3", label: "Week 3 · July 6–10, 2026" },
    { value: "week-4", label: "Week 4 · July 13–17, 2026" },
    { value: "full-pass", label: "Full 4-Week Pass (all sessions)" },
  ],
  included: [
    "Daily baseline measurements (velo, exit velo, sprint, mobility)",
    "Pillar-based training blocks: Velocity · Mechanics · Mental · Recovery",
    "Position-specific skill work (hitting, pitching, fielding, catching)",
    "VAULT camp t-shirt + training journal",
    "Personalized exit report with next-step development plan",
    "Daily hydration, snacks, and recovery protocols",
  ],
  paymentEnabled: false, // set true once Stripe price/checkout is wired
};
// ─────────────────────────────────────────────────────────────────

const POSITIONS = [
  "Pitcher", "Catcher", "First Base", "Second Base", "Shortstop", "Third Base",
  "Left Field", "Center Field", "Right Field", "Utility", "Designated Hitter",
];

const TSHIRT_SIZES: { value: string; label: string }[] = [
  { value: "YS", label: "Youth Small" },
  { value: "YM", label: "Youth Medium" },
  { value: "YL", label: "Youth Large" },
  { value: "AS", label: "Adult Small" },
  { value: "AM", label: "Adult Medium" },
  { value: "AL", label: "Adult Large" },
  { value: "AXL", label: "Adult XL" },
  { value: "A2XL", label: "Adult 2XL" },
];

const FormSchema = z.object({
  athlete_first_name: z.string().trim().min(1, "First name is required").max(60),
  athlete_last_name: z.string().trim().min(1, "Last name is required").max(60),
  athlete_age: z.coerce.number().int().min(4, "Age must be 4 or older").max(25, "Age must be 25 or younger"),
  sport: z.enum(["baseball", "softball"], { required_error: "Pick a sport" }),
  primary_position: z.string().min(1, "Pick a position"),
  parent_name: z.string().trim().min(1, "Parent name is required").max(120),
  parent_email: z.string().trim().email("Enter a valid email").max(255),
  parent_phone: z.string().trim().min(7, "Enter a valid phone number").max(30),
  emergency_contact: z.string().trim().min(3, "Emergency contact is required").max(200),
  medical_notes: z.string().max(1000).optional().or(z.literal("")),
  tshirt_size: z.string().min(1, "Pick a size"),
  preferred_session: z.string().min(1, "Pick a session"),
});

type FormValues = z.infer<typeof FormSchema>;
type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  athlete_first_name: "",
  athlete_last_name: "",
  athlete_age: 12 as unknown as number,
  sport: "baseball",
  primary_position: "",
  parent_name: "",
  parent_email: "",
  parent_phone: "",
  emergency_contact: "",
  medical_notes: "",
  tshirt_size: "",
  preferred_session: "",
};

const FAQS = [
  {
    q: "What should my athlete bring each day?",
    a: "Glove, cleats + turf shoes, bat (if they have one), water bottle, hat, and athletic clothing. We provide everything else, including a camp t-shirt and training journal.",
  },
  {
    q: "What if it rains?",
    a: "We have full indoor turf and cages. Camp runs rain or shine — no cancellations.",
  },
  {
    q: "Are siblings grouped together?",
    a: "Yes — request it in the medical notes field and we'll keep siblings in the same age band where possible.",
  },
  {
    q: "Is there a refund policy?",
    a: "Full refund up to 14 days before your session start date. 50% refund inside 14 days. No refunds once the session begins.",
  },
  {
    q: "Can my athlete attend multiple weeks?",
    a: "Absolutely. Pick the Full 4-Week Pass for the best value, or register separately for individual weeks.",
  },
];

const SummerCamp = () => {
  const { toast } = useToast();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmation, setConfirmation] = useState<{ id: string; sessionLabel: string } | null>(null);

  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) => {
    setValues((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const sessionLabelFor = (val: string) =>
    CAMP_DETAILS.sessions.find((s) => s.value === val)?.label ?? val;

  const scrollToForm = () => {
    document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = FormSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormValues;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast({ title: "Please review the form", description: "Some fields need attention.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...parsed.data, medical_notes: parsed.data.medical_notes || null };
      const { data, error } = await (supabase
        .from("summer_camp_registrations" as any) as any)
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;
      setConfirmation({ id: (data as any).id, sessionLabel: sessionLabelFor(parsed.data.preferred_session) });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("[SummerCamp] submit failed", err);
      toast({
        title: "Couldn't submit registration",
        description: err?.message ?? "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const detailRows = useMemo(
    () => [
      { icon: CalendarDays, label: "Dates", value: CAMP_DETAILS.dates },
      { icon: Clock, label: "Time", value: CAMP_DETAILS.time },
      { icon: MapPin, label: "Location", value: CAMP_DETAILS.location },
      { icon: Users, label: "Age Groups", value: CAMP_DETAILS.ageGroups },
      { icon: DollarSign, label: "Price", value: CAMP_DETAILS.price },
      { icon: Trophy, label: "Spots / session", value: `${CAMP_DETAILS.spotsAvailable} max — capacity locked` },
    ],
    [],
  );

  if (submitted && confirmation) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-28 pb-24">
          <div className="container mx-auto px-4 max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-foreground flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-background" />
              </div>
              <span className="text-[11px] font-display tracking-[0.3em] text-muted-foreground block mb-2">
                REGISTRATION RECEIVED
              </span>
              <h1 className="text-3xl md:text-4xl font-display text-foreground mb-3">
                YOU'RE ON THE LIST.
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                We've saved a spot for <strong className="text-foreground">{values.athlete_first_name} {values.athlete_last_name}</strong> in <strong className="text-foreground">{confirmation.sessionLabel}</strong>.
              </p>

              <Card className="border-border text-left mb-6">
                <CardContent className="p-5 space-y-3 text-sm">
                  <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground">WHAT HAPPENS NEXT</p>
                  <div className="flex gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-muted-foreground">A confirmation email is on its way to <span className="text-foreground">{values.parent_email}</span>.</p>
                  </div>
                  {!CAMP_DETAILS.paymentEnabled && (
                    <div className="flex gap-3">
                      <DollarSign className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-muted-foreground">
                        <span className="text-foreground">Registration received — payment instructions coming soon.</span> We'll send a secure payment link within 24 hours to lock in your spot.
                      </p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-muted-foreground">Questions? Call or text us — we'll reach out at {values.parent_phone}.</p>
                  </div>
                </CardContent>
              </Card>

              <p className="text-[10px] font-display tracking-[0.2em] text-muted-foreground">
                CONFIRMATION ID · {confirmation.id.slice(0, 8).toUpperCase()}
              </p>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20">
        {/* HERO */}
        <section className="container mx-auto px-4 max-w-5xl text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[11px] font-display tracking-[0.3em] text-muted-foreground block mb-3">
              VAULT · SUMMER CAMP 2026
            </span>
            <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4 leading-tight">
              {CAMP_DETAILS.name}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-7">
              {CAMP_DETAILS.tagline}
            </p>
            <Button variant="vault" size="lg" onClick={scrollToForm} className="min-w-[220px]">
              SAVE MY SPOT
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground mt-3">
              {CAMP_DETAILS.spotsAvailable} SPOTS PER SESSION · CAPACITY LOCKED
            </p>
          </motion.div>
        </section>

        {/* DETAILS GRID */}
        <section className="container mx-auto px-4 max-w-5xl mb-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {detailRows.map((row) => (
              <Card key={row.label} className="border-border">
                <CardContent className="p-4 flex items-start gap-3">
                  <row.icon className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground">{row.label.toUpperCase()}</p>
                    <p className="text-sm text-foreground mt-0.5 leading-snug">{row.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* OVERVIEW + WHO + WHAT */}
        <section className="container mx-auto px-4 max-w-5xl mb-14">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-border md:col-span-1">
              <CardContent className="p-5">
                <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground mb-2">OVERVIEW</p>
                <h3 className="text-lg font-display text-foreground mb-2">The VAULT system, run live.</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Daily baselines. Pillar-based training. Real measurables. Athletes leave with data, an exit report, and a development plan that lives in their VAULT account.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border md:col-span-1">
              <CardContent className="p-5">
                <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground mb-2">WHO IT'S FOR</p>
                <h3 className="text-lg font-display text-foreground mb-2">Serious athletes 8–18.</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Baseball or softball players who want measurable improvement, structured programming, and feedback from VAULT-certified coaches — not generic field time.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border md:col-span-1">
              <CardContent className="p-5">
                <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground mb-2">WHAT YOU'LL WORK ON</p>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  {["Velocity & exit velocity", "Mechanics & efficiency", "Position-specific skills", "Mental performance", "Recovery & mobility"].map((x) => (
                    <li key={x} className="flex gap-2"><Target className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />{x}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* WHAT'S INCLUDED */}
        <section className="container mx-auto px-4 max-w-3xl mb-14">
          <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground mb-3 text-center">WHAT'S INCLUDED</p>
          <Card className="border-border">
            <CardContent className="p-6">
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {CAMP_DETAILS.included.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* REGISTRATION FORM */}
        <section id="register" className="container mx-auto px-4 max-w-2xl mb-14 scroll-mt-24">
          <div className="text-center mb-6">
            <span className="text-[11px] font-display tracking-[0.3em] text-muted-foreground block mb-2">
              REGISTRATION
            </span>
            <h2 className="text-2xl md:text-3xl font-display text-foreground mb-1">SAVE YOUR SPOT</h2>
            <p className="text-sm text-muted-foreground">Takes under 2 minutes. No account required.</p>
          </div>

          <Card className="border-border">
            <CardContent className="p-5 md:p-7">
              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                {/* Athlete */}
                <div>
                  <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground mb-3">ATHLETE</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="First name" error={errors.athlete_first_name}>
                      <Input value={values.athlete_first_name} onChange={(e) => set("athlete_first_name", e.target.value)} autoComplete="given-name" />
                    </Field>
                    <Field label="Last name" error={errors.athlete_last_name}>
                      <Input value={values.athlete_last_name} onChange={(e) => set("athlete_last_name", e.target.value)} autoComplete="family-name" />
                    </Field>
                    <Field label="Age" error={errors.athlete_age}>
                      <Input type="number" inputMode="numeric" min={4} max={25}
                        value={values.athlete_age as any}
                        onChange={(e) => set("athlete_age", e.target.value as any)} />
                    </Field>
                    <Field label="Sport" error={errors.sport}>
                      <Select value={values.sport} onValueChange={(v) => set("sport", v as FormValues["sport"])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baseball">Baseball</SelectItem>
                          <SelectItem value="softball">Softball</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Primary position" error={errors.primary_position}>
                        <Select value={values.primary_position} onValueChange={(v) => set("primary_position", v)}>
                          <SelectTrigger><SelectValue placeholder="Select a position" /></SelectTrigger>
                          <SelectContent>
                            {POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </div>
                </div>

                {/* Parent */}
                <div>
                  <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground mb-3">PARENT / GUARDIAN</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <Field label="Full name" error={errors.parent_name}>
                        <Input value={values.parent_name} onChange={(e) => set("parent_name", e.target.value)} autoComplete="name" />
                      </Field>
                    </div>
                    <Field label="Email" error={errors.parent_email}>
                      <Input type="email" inputMode="email" value={values.parent_email}
                        onChange={(e) => set("parent_email", e.target.value)} autoComplete="email" />
                    </Field>
                    <Field label="Phone" error={errors.parent_phone}>
                      <Input type="tel" inputMode="tel" value={values.parent_phone}
                        onChange={(e) => set("parent_phone", e.target.value)} autoComplete="tel" />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Emergency contact (name + phone)" error={errors.emergency_contact}>
                        <Input value={values.emergency_contact} onChange={(e) => set("emergency_contact", e.target.value)} placeholder="e.g. Jane Doe — 555-123-4567" />
                      </Field>
                    </div>
                  </div>
                </div>

                {/* Logistics */}
                <div>
                  <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground mb-3">CAMP LOGISTICS</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="T-shirt size" error={errors.tshirt_size}>
                      <Select value={values.tshirt_size} onValueChange={(v) => set("tshirt_size", v)}>
                        <SelectTrigger><SelectValue placeholder="Select a size" /></SelectTrigger>
                        <SelectContent>
                          {TSHIRT_SIZES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Preferred session" error={errors.preferred_session}>
                      <Select value={values.preferred_session} onValueChange={(v) => set("preferred_session", v)}>
                        <SelectTrigger><SelectValue placeholder="Pick a session" /></SelectTrigger>
                        <SelectContent>
                          {CAMP_DETAILS.sessions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Medical notes or allergies (optional)" error={errors.medical_notes}>
                        <Textarea
                          value={values.medical_notes ?? ""}
                          onChange={(e) => set("medical_notes", e.target.value)}
                          placeholder="Anything our coaches should know — allergies, asthma, recent injuries, etc."
                          rows={3}
                        />
                      </Field>
                    </div>
                  </div>
                </div>

                <Button type="submit" variant="vault" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> SUBMITTING…</>) : (<>{CAMP_DETAILS.paymentEnabled ? "CONTINUE TO PAYMENT" : "REGISTER NOW"}<ArrowRight className="w-4 h-4 ml-2" /></>)}
                </Button>

                <p className="text-[11px] text-muted-foreground text-center">
                  {CAMP_DETAILS.paymentEnabled
                    ? "You'll be redirected to a secure checkout to lock in your spot."
                    : "We'll email payment instructions within 24 hours to confirm your spot."}
                </p>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* TRUST */}
        <section className="container mx-auto px-4 max-w-4xl mb-14">
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: ShieldCheck, label: "VAULT-Certified Coaches", body: "Every coach trained on the VAULT 5-Pillar system." },
              { icon: Users, label: "Capacity-Locked Groups", body: "We cap each session so every athlete gets reps and feedback." },
              { icon: Trophy, label: "Measurable Outcomes", body: "Daily baselines + exit report. You see the gains." },
            ].map((t) => (
              <Card key={t.label} className="border-border">
                <CardContent className="p-4 flex items-start gap-3">
                  <t.icon className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{t.body}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 max-w-3xl mb-14">
          <div className="text-center mb-5">
            <span className="text-[11px] font-display tracking-[0.3em] text-muted-foreground block mb-2">FAQ</span>
            <h2 className="text-2xl md:text-3xl font-display text-foreground">QUESTIONS, ANSWERED</h2>
          </div>
          <Accordion type="single" collapsible className="border border-border rounded-md divide-y divide-border">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-0 px-4">
                <AccordionTrigger className="text-sm text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-display text-foreground mb-3">SPOTS GO FAST.</h2>
          <p className="text-sm text-muted-foreground mb-5">Lock your week in under 2 minutes.</p>
          <Button variant="vault" size="lg" onClick={scrollToForm} className="min-w-[220px]">
            REGISTER NOW
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </section>
      </main>

      <Footer />
    </div>
  );
};

// Tiny labeled-field wrapper with inline error.
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-1.5 block">{label}</Label>
      {children}
      {error ? <p className="text-[11px] text-destructive mt-1">{error}</p> : null}
    </div>
  );
}

export default SummerCamp;
