// VAULT × 22M — Elite Summer Development Camp registration.
// Two location/age cohorts, weekly + full-pass options, early-bird pricing.

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import {
  CalendarDays, MapPin, Clock, Users, CheckCircle2, ShieldCheck, Trophy,
  Target, ArrowRight, Loader2, Mail, Phone, DollarSign, Flame, Zap,
  Activity, Brain, Dumbbell, AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { closePreparedCheckoutTarget, openCheckout, prepareCheckoutTarget } from "@/lib/openCheckout";
import { invokeCheckout } from "@/lib/checkoutInvoke";

// ─────────────────────────────────────────────────────────────────
// EDIT THIS BLOCK before publishing.
// ─────────────────────────────────────────────────────────────────
const STRIPE_PRICES = {
  week_regular:        "price_1TVZTFPhXS410TO5Mi4IcUTx", // $250
  week_earlybird:      "price_1TVZh9PhXS410TO5HP7ytMkO", // $225
  full_pass_regular:   "price_1TVZTGPhXS410TO5rM6oDJ8v", // $1000
  full_pass_earlybird: "price_1TVZhAPhXS410TO5EFYaacZ6", // $850
};

const EARLY_BIRD_DEADLINE = new Date("2026-05-01T23:59:59-04:00");

const PRICING = {
  week:      { regular: 250,  earlyBird: 225 },
  fullPass:  { regular: 1000, earlyBird: 850 },
};

type SessionDef = { value: string; label: string; short: string; dates: string };
const SESSIONS: SessionDef[] = [
  { value: "week-1", short: "Week 1", label: "Week 1 · June 29 – July 2",  dates: "Jun 29 – Jul 2" },
  { value: "week-2", short: "Week 2", label: "Week 2 · July 6 – July 9",   dates: "Jul 6 – Jul 9" },
  { value: "week-3", short: "Week 3", label: "Week 3 · July 13 – July 16", dates: "Jul 13 – Jul 16" },
  { value: "week-4", short: "Week 4", label: "Week 4 · July 20 – July 24", dates: "Jul 20 – Jul 24" },
];

type Cohort = {
  id: string;
  name: string;
  ageRange: string;
  ageMin: number;
  ageMax: number;
  venue: string;
  city: string;
  spotsPerWeek: number;
};
const COHORTS: Cohort[] = [
  {
    id: "ross-7-10",
    name: "Ages 7–10",
    ageRange: "Ages 7 – 10",
    ageMin: 7, ageMax: 10,
    venue: "Ross Field",
    city: "Keyport, NJ",
    spotsPerWeek: 24,
  },
  {
    id: "gravelly-11-15",
    name: "Ages 11–15",
    ageRange: "Ages 11 – 15",
    ageMin: 11, ageMax: 15,
    venue: "Gravelly Brook Park",
    city: "Matawan, NJ",
    spotsPerWeek: 24,
  },
];

const FOCUS_AREAS = [
  { icon: Flame,    title: "Hitting Mechanics & Bat Speed" },
  { icon: Zap,      title: "Pitching Velocity Development" },
  { icon: Activity, title: "Arm Care & Throwing Programs" },
  { icon: Target,   title: "Defensive Footwork & Glove Work" },
  { icon: Dumbbell, title: "Speed & Athletic Performance" },
  { icon: Brain,    title: "Game IQ & Situational Play" },
];

const PAYMENT_ENABLED = true;
// ─────────────────────────────────────────────────────────────────

const POSITIONS = [
  "Pitcher", "Catcher", "First Base", "Second Base", "Shortstop", "Third Base",
  "Left Field", "Center Field", "Right Field", "Utility", "Designated Hitter",
];
const TSHIRT_SIZES = [
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
  athlete_last_name:  z.string().trim().min(1, "Last name is required").max(60),
  athlete_age:        z.coerce.number().int().min(4, "Age must be 4 or older").max(25, "Age must be 25 or younger"),
  sport:              z.enum(["baseball", "softball"]),
  primary_position:   z.string().min(1, "Pick a position"),
  parent_name:        z.string().trim().min(1, "Parent name is required").max(120),
  parent_email:       z.string().trim().email("Enter a valid email").max(255),
  parent_phone:       z.string().trim().min(7, "Enter a valid phone number").max(30),
  emergency_contact:  z.string().trim().min(3, "Emergency contact is required").max(200),
  medical_notes:      z.string().max(1000).optional().or(z.literal("")),
  tshirt_size:        z.string().min(1, "Pick a size"),
  cohort_id:          z.string().min(1, "Pick a camp location / age group"),
  registration_type:  z.enum(["weekly", "full_pass"]),
  selected_sessions:  z.array(z.string()).min(1, "Select at least one week"),
});
type FormValues = z.infer<typeof FormSchema>;
type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  athlete_first_name: "",
  athlete_last_name: "",
  athlete_age: "" as unknown as number,
  sport: "baseball",
  primary_position: "",
  parent_name: "",
  parent_email: "",
  parent_phone: "",
  emergency_contact: "",
  medical_notes: "",
  tshirt_size: "",
  cohort_id: "",
  registration_type: "weekly",
  selected_sessions: [],
};

const FAQS = [
  {
    q: "What should my athlete bring each day?",
    a: "Glove, cleats + turf shoes, bat (if they have one), water bottle, hat, sunscreen, and athletic clothing. We provide the camp shirt and all training equipment.",
  },
  {
    q: "What if it rains?",
    a: "Light rain — camp runs as scheduled. Severe weather — sessions are rescheduled or moved indoors when possible. We notify all parents by text the morning of any change.",
  },
  {
    q: "Can my athlete attend multiple weeks?",
    a: "Yes — pick the Full Summer Pass for the best value (all 4 weeks), or check off any combination of individual weeks.",
  },
  {
    q: "Are siblings grouped together?",
    a: "Siblings of the same age cohort will be grouped together. If they fall in different age cohorts, they'll be at different locations — let us know in the medical notes and we'll coordinate drop-off windows where possible.",
  },
  {
    q: "What's the refund policy?",
    a: "Full refund up to 14 days before your week starts. 50% refund inside 14 days. No refunds once the week begins. The Full Summer Pass is non-transferable between athletes.",
  },
  {
    q: "What if a week sells out?",
    a: "Each week is capacity-locked. Once a week fills, registration for that week closes immediately — no exceptions. We recommend the Full Summer Pass to lock in all four.",
  },
];

const SummerCamp = () => {
  const { toast } = useToast();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    id: string;
    paid: boolean;
    parentEmail?: string;
    parentPhone?: string;
  } | null>(null);
  // Hard guard against duplicate submits (survives React state batching + double-clicks)
  const inFlightRef = useRef(false);
  const slowTimerRef = useRef<number | null>(null);

  const isEarlyBird = useMemo(() => Date.now() < EARLY_BIRD_DEADLINE.getTime(), []);
  const weeklyPrice = isEarlyBird ? PRICING.week.earlyBird : PRICING.week.regular;
  const fullPassPrice = isEarlyBird ? PRICING.fullPass.earlyBird : PRICING.fullPass.regular;

  // Handle return-from-Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paid = params.get("paid");
    const rid = params.get("rid");
    const canceled = params.get("canceled");
    const sessionId = params.get("session_id");
    const clearParams = () => {
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState({}, "", url.toString());
    };

    let cancelled = false;

    if (canceled) {
      toast({ title: "Checkout canceled", description: "Your spot wasn't reserved. Try again when you're ready." });
      clearParams();
      return;
    }

    if (paid === "1" && sessionId) {
      setSubmitStatus("Confirming your payment…");
      setSubmitting(true);

      void (async () => {
        try {
          const { data, error } = await supabase.functions.invoke("verify-summer-camp-payment", {
            body: { sessionId },
          });

          if (cancelled) return;
          if (error) throw error;

          const payload = (data ?? {}) as {
            status?: string;
            registrationId?: string;
            parentEmail?: string;
            parentPhone?: string;
            error?: string;
          };

          if (payload.status !== "confirmed") {
            throw new Error(payload.error ?? "We're still finalizing your registration.");
          }

          setConfirmation({
            id: payload.registrationId ?? rid ?? sessionId,
            paid: true,
            parentEmail: payload.parentEmail,
            parentPhone: payload.parentPhone,
          });
          setSubmitted(true);
          clearParams();
        } catch (err) {
          console.error("[SummerCamp] payment verification failed", err);
          toast({
            title: "Payment received",
            description: "We're confirming your registration now. If you don't receive a confirmation shortly, contact us and we'll finish it manually.",
          });
          setConfirmation({ id: rid ?? sessionId, paid: true });
          setSubmitted(true);
          clearParams();
        } finally {
          if (!cancelled) {
            setSubmitting(false);
            setSubmitStatus("");
          }
        }
      })();

      return () => {
        cancelled = true;
      };
    }

    if (paid === "1" && rid) {
      setConfirmation({ id: rid, paid: true });
      setSubmitted(true);
      clearParams();
    }

    // Pre-select cohort from ?cohort=ross-7-10
    const cohort = params.get("cohort");
    if (cohort && COHORTS.some((c) => c.id === cohort)) {
      setValues((p) => ({ ...p, cohort_id: cohort }));
    }

    return () => {
      cancelled = true;
    };
  }, [toast]);

  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) => {
    setValues((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const toggleSession = (sessionVal: string) => {
    setValues((p) => {
      const has = p.selected_sessions.includes(sessionVal);
      const next = has
        ? p.selected_sessions.filter((s) => s !== sessionVal)
        : [...p.selected_sessions, sessionVal];
      return { ...p, selected_sessions: next };
    });
    if (errors.selected_sessions) setErrors((p) => ({ ...p, selected_sessions: undefined }));
  };

  const setRegistrationType = (t: "weekly" | "full_pass") => {
    setValues((p) => ({
      ...p,
      registration_type: t,
      selected_sessions: t === "full_pass" ? SESSIONS.map((s) => s.value) : p.selected_sessions,
    }));
  };

  const cohort = COHORTS.find((c) => c.id === values.cohort_id);
  const totalAmount =
    values.registration_type === "full_pass"
      ? fullPassPrice
      : weeklyPrice * values.selected_sessions.length;

  const scrollToForm = () => {
    document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Race a promise against a timeout — never let the spinner spin forever.
  const withTimeout = async <T,>(p: Promise<T>, ms: number, label: string): Promise<T> => {
    let to: number | undefined;
    const timeout = new Promise<never>((_, reject) => {
      to = window.setTimeout(
        () => reject(new Error(`${label} is taking longer than expected. Please check your connection and try again.`)),
        ms,
      );
    });
    try {
      return await Promise.race([p, timeout]);
    } finally {
      if (to) window.clearTimeout(to);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Hard double-submit guard (refs aren't subject to React batching)
    if (inFlightRef.current) return;

    setSubmitError(null);

    const parsed = FormSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormValues;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      // Scroll to first error so the user sees what's wrong on mobile
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>("[data-error='true']")?.scrollIntoView({
          behavior: "smooth", block: "center",
        });
      });
      toast({ title: "Please review the form", description: "Some fields need attention.", variant: "destructive" });
      return;
    }
    // Cohort age guard
    const c = COHORTS.find((x) => x.id === parsed.data.cohort_id)!;
    const preparedCheckoutTarget = PAYMENT_ENABLED ? prepareCheckoutTarget() : null;

    if (parsed.data.athlete_age < c.ageMin || parsed.data.athlete_age > c.ageMax) {
      closePreparedCheckoutTarget(preparedCheckoutTarget);
      setErrors((p) => ({
        ...p,
        cohort_id: `${c.name} is for ages ${c.ageMin}–${c.ageMax}. Pick the matching age group.`,
      }));
      toast({ title: "Age doesn't match cohort", description: `${c.name} is for ages ${c.ageMin}–${c.ageMax}.`, variant: "destructive" });
      return;
    }

    inFlightRef.current = true;
    setSubmitting(true);
    setSubmitStatus("Submitting your registration…");

    // If overall flow takes >6s, surface a "still working" message so users don't think it's frozen.
    slowTimerRef.current = window.setTimeout(() => {
      setSubmitStatus("Still working — finalizing your spot. Don't refresh.");
    }, 6000);

    try {
      const isFull = parsed.data.registration_type === "full_pass";
      const sessions = isFull ? SESSIONS.map((s) => s.value) : parsed.data.selected_sessions;
      const amountCents =
        (isFull ? fullPassPrice : weeklyPrice * sessions.length) * 100;

      const priceId = isFull
        ? (isEarlyBird ? STRIPE_PRICES.full_pass_earlybird : STRIPE_PRICES.full_pass_regular)
        : (isEarlyBird ? STRIPE_PRICES.week_earlybird : STRIPE_PRICES.week_regular);
      const quantity = isFull ? 1 : sessions.length;

      const payload = {
        athlete_first_name: parsed.data.athlete_first_name,
        athlete_last_name:  parsed.data.athlete_last_name,
        athlete_age:        parsed.data.athlete_age,
        sport:              parsed.data.sport,
        primary_position:   parsed.data.primary_position,
        parent_name:        parsed.data.parent_name,
        parent_email:       parsed.data.parent_email,
        parent_phone:       parsed.data.parent_phone,
        emergency_contact:  parsed.data.emergency_contact,
        medical_notes:      parsed.data.medical_notes || null,
        tshirt_size:        parsed.data.tshirt_size,
        preferred_session:  isFull ? "full-pass" : sessions[0],
        selected_sessions:  sessions,
        camp_location:      `${c.name} · ${c.venue}, ${c.city}`,
        registration_type:  parsed.data.registration_type,
        pricing_tier:       isEarlyBird ? "early_bird" : "regular",
        amount_cents:       amountCents,
      };

      if (PAYMENT_ENABLED) {
        setSubmitStatus("Opening secure checkout…");
        const origin = window.location.origin;
        const successUrl = `${origin}/summer-camp?paid=1&session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl  = `${origin}/summer-camp?canceled=1`;

        const t1 = performance.now();
        const checkoutPromise = invokeCheckout(
          "register-summer-camp",
          {
            ...payload,
            priceId,
            quantity,
            successUrl,
            cancelUrl,
          },
          { timeoutMs: 20000 },
        );
        const { checkoutUrl, raw } = await withTimeout(
          checkoutPromise,
          20000,
          "Opening secure checkout",
        );
        console.info(`[SummerCamp] checkout session in ${Math.round(performance.now() - t1)}ms`);

        setSubmitStatus("Redirecting to checkout…");
        await openCheckout(checkoutUrl, preparedCheckoutTarget);
        // Leave inFlightRef true: page is navigating away. If for some reason it doesn't,
        // surface a manual link so the user isn't stuck.
        window.setTimeout(() => {
          if (!document.hidden) {
            setSubmitError(
              `If checkout didn't open, tap here: ${checkoutUrl}`,
            );
            setSubmitting(false);
            inFlightRef.current = false;
          }
        }, 4000);
        return;
      }

      closePreparedCheckoutTarget(preparedCheckoutTarget);

      // Non-payment fallback
      setConfirmation({
        id: crypto.randomUUID(),
        paid: false,
        parentEmail: values.parent_email,
        parentPhone: values.parent_phone,
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      closePreparedCheckoutTarget(preparedCheckoutTarget);
      console.error("[SummerCamp] submit failed", err);
      const msg = err?.message ?? "Please try again or contact us directly.";
      setSubmitError(msg);
      toast({
        title: "Couldn't submit registration",
        description: msg,
        variant: "destructive",
      });
    } finally {
      if (slowTimerRef.current) {
        window.clearTimeout(slowTimerRef.current);
        slowTimerRef.current = null;
      }
      // Redirect path returns early before this finally runs, so reaching here
      // means we either hit an error or we're in the non-payment fallback —
      // either way, free the form back up.
      {
        setSubmitting(false);
        setSubmitStatus("");
        inFlightRef.current = false;
      }
    }
  };

  if (submitted && confirmation) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-28 pb-24">
          <div className="container mx-auto px-4 max-w-xl">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="w-16 h-16 bg-foreground flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-background" />
              </div>
              <span className="text-[11px] font-display tracking-[0.3em] text-muted-foreground block mb-2">
                {confirmation.paid ? "PAYMENT CONFIRMED" : "REGISTRATION RECEIVED"}
              </span>
              <h1 className="text-3xl md:text-4xl font-display text-foreground mb-3">
                {confirmation.paid ? "YOU'RE LOCKED IN." : "YOU'RE ON THE LIST."}
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                {confirmation.paid
                  ? "Payment received. Your spot is reserved — we'll text and email full camp details shortly."
                  : "We've saved your spot. Final payment instructions are on the way to your email."}
              </p>

              <Card className="border-border text-left mb-6">
                <CardContent className="p-5 space-y-3 text-sm">
                  <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground">WHAT HAPPENS NEXT</p>
                  <div className="flex gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-muted-foreground">
                      Confirmation email sent{confirmation.parentEmail ? <> to <span className="text-foreground">{confirmation.parentEmail}</span></> : null}.
                    </p>
                  </div>
                  {confirmation.parentPhone && (
                    <div className="flex gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-muted-foreground">We'll text reminders + drop-off info to {confirmation.parentPhone}.</p>
                    </div>
                  )}
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
        <section className="container mx-auto px-4 max-w-5xl text-center mb-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[11px] font-display tracking-[0.3em] text-muted-foreground block mb-3">
              22M SUMMER DEVELOPMENT PROGRAM · 2026
            </span>
            <h1 className="text-4xl md:text-6xl font-display text-foreground mb-3 leading-tight">
              ELITE SUMMER<br className="hidden sm:block" /> DEVELOPMENT CAMP
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Four weeks. Two locations. Real coaching. Built by 22M Baseball, run on the VAULT system.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-[11px] font-display tracking-[0.2em] text-muted-foreground">
              <span className="px-3 py-1.5 border border-border">JUN 29 – JUL 24</span>
              <span className="px-3 py-1.5 border border-border">9 AM – 3 PM</span>
              <span className="px-3 py-1.5 border border-border">KEYPORT + MATAWAN, NJ</span>
            </div>

            <Button variant="vault" size="lg" onClick={scrollToForm} className="min-w-[240px]">
              REGISTER NOW
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground mt-3">
              LIMITED SPOTS · ONCE FULL, REGISTRATION CLOSES
            </p>
            {isEarlyBird && (
              <p className="text-[11px] font-display tracking-[0.2em] text-primary mt-2">
                EARLY BIRD PRICING ENDS MAY 1
              </p>
            )}
          </motion.div>
        </section>

        {/* COHORT / LOCATION CARDS */}
        <section className="container mx-auto px-4 max-w-5xl mb-12">
          <p className="text-[11px] font-display tracking-[0.3em] text-muted-foreground text-center mb-4">
            CHOOSE YOUR CAMP
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {COHORTS.map((c) => {
              const selected = values.cohort_id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { set("cohort_id", c.id); scrollToForm(); }}
                  className={`text-left rounded-md border-2 p-5 transition-all ${
                    selected ? "border-foreground bg-foreground/[0.03]" : "border-border hover:border-foreground/40"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[10px] font-display tracking-[0.25em] text-muted-foreground">
                      {c.ageRange.toUpperCase()}
                    </span>
                    {selected && <CheckCircle2 className="w-4 h-4 text-foreground" />}
                  </div>
                  <h3 className="text-xl font-display text-foreground mb-1">{c.venue}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-4">
                    <MapPin className="w-3.5 h-3.5" /> {c.city}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{c.spotsPerWeek} spots / week</span>
                    <span className="text-foreground font-display tracking-wider">SELECT →</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* PRICING */}
        <section className="container mx-auto px-4 max-w-5xl mb-14">
          <p className="text-[11px] font-display tracking-[0.3em] text-muted-foreground text-center mb-4">PRICING</p>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardContent className="p-6">
                <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground mb-2">WEEKLY</p>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-display text-foreground">${weeklyPrice}</span>
                  {isEarlyBird && (
                    <span className="text-base text-muted-foreground line-through">${PRICING.week.regular}</span>
                  )}
                  <span className="text-sm text-muted-foreground">/ week</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Pick any single week or mix and match. Mon–Thu (Wk 1–3) or Mon–Fri (Wk 4), 9 AM – 3 PM.
                </p>
                <Button variant="vaultOutline" className="w-full" onClick={() => { setRegistrationType("weekly"); scrollToForm(); }}>
                  REGISTER WEEKLY
                </Button>
              </CardContent>
            </Card>

            <Card className="border-foreground border-2 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-display tracking-[0.25em] px-3 py-1">
                BEST VALUE
              </div>
              <CardContent className="p-6">
                <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground mb-2">FULL SUMMER PASS</p>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-display text-foreground">${fullPassPrice}</span>
                  {isEarlyBird && (
                    <span className="text-base text-muted-foreground line-through">${PRICING.fullPass.regular}</span>
                  )}
                  <span className="text-sm text-muted-foreground">/ all 4 weeks</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  All four weeks locked in. Best per-week value, guaranteed spot before sessions sell out.
                  {isEarlyBird && <> Save <span className="text-foreground font-semibold">${PRICING.fullPass.regular - PRICING.fullPass.earlyBird}</span> with early bird.</>}
                </p>
                <Button variant="vault" className="w-full" onClick={() => { setRegistrationType("full_pass"); scrollToForm(); }}>
                  GET THE FULL PASS
                </Button>
              </CardContent>
            </Card>
          </div>
          <p className="text-[11px] text-muted-foreground text-center mt-3">
            {isEarlyBird
              ? "Early bird pricing ends May 1. Regular pricing applies after."
              : "Early bird ended May 1 — current pricing reflects regular rates."}
          </p>
        </section>

        {/* DEVELOPMENT FOCUS */}
        <section className="container mx-auto px-4 max-w-5xl mb-14">
          <div className="text-center mb-5">
            <p className="text-[11px] font-display tracking-[0.3em] text-muted-foreground mb-2">DEVELOPMENT FOCUS</p>
            <h2 className="text-2xl md:text-3xl font-display text-foreground">WHAT ATHLETES WILL WORK ON</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FOCUS_AREAS.map((f) => (
              <Card key={f.title} className="border-border">
                <CardContent className="p-4 flex items-start gap-3">
                  <f.icon className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <p className="text-sm text-foreground leading-snug">{f.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* WHO IT'S FOR + WHY 22M */}
        <section className="container mx-auto px-4 max-w-5xl mb-14">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardContent className="p-6">
                <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground mb-2">WHO THIS CAMP IS FOR</p>
                <h3 className="text-lg font-display text-foreground mb-2">Competitive ballplayers, 7–15.</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Athletes who want real coaching — measurable swings, throws, and reps — not field babysitting.
                  Open to all skill levels: travel-ball players sharpening tools, and rec players ready to take
                  it to the next level.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-6">
                <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground mb-2">WHY FAMILIES CHOOSE 22M</p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Coaches with college and pro playing backgrounds</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Capacity-locked groups — every athlete gets reps and feedback</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Daily skill blocks across hitting, pitching, defense, speed</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Built on the VAULT player development system</li>
                </ul>
              </CardContent>
            </Card>
          </div>
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
              <form onSubmit={onSubmit} className="space-y-6" noValidate>
                {/* COHORT */}
                <div>
                  <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground mb-3">CAMP LOCATION / AGE GROUP</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {COHORTS.map((c) => {
                      const selected = values.cohort_id === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => set("cohort_id", c.id)}
                          className={`text-left rounded-md border-2 p-3 transition ${
                            selected ? "border-foreground bg-foreground/[0.03]" : "border-border hover:border-foreground/40"
                          }`}
                        >
                          <p className="text-[10px] font-display tracking-[0.2em] text-muted-foreground">{c.ageRange.toUpperCase()}</p>
                          <p className="text-sm text-foreground font-semibold mt-1">{c.venue}</p>
                          <p className="text-xs text-muted-foreground">{c.city}</p>
                        </button>
                      );
                    })}
                  </div>
                  {errors.cohort_id && <p className="text-[11px] text-destructive mt-1">{errors.cohort_id}</p>}
                </div>

                {/* REG TYPE */}
                <div>
                  <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground mb-3">REGISTRATION TYPE</p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setRegistrationType("weekly")}
                      className={`rounded-md border-2 p-3 text-left transition ${
                        values.registration_type === "weekly" ? "border-foreground bg-foreground/[0.03]" : "border-border"
                      }`}
                    >
                      <p className="text-sm font-display text-foreground">WEEKLY</p>
                      <p className="text-xs text-muted-foreground">${weeklyPrice} per week</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegistrationType("full_pass")}
                      className={`rounded-md border-2 p-3 text-left transition ${
                        values.registration_type === "full_pass" ? "border-foreground bg-foreground/[0.03]" : "border-border"
                      }`}
                    >
                      <p className="text-sm font-display text-foreground">FULL SUMMER PASS</p>
                      <p className="text-xs text-muted-foreground">${fullPassPrice} · all 4 weeks</p>
                    </button>
                  </div>

                  <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground mb-2">
                    {values.registration_type === "full_pass" ? "ALL WEEKS INCLUDED" : "SELECT WEEK(S)"}
                  </p>
                  <div className="space-y-2">
                    {SESSIONS.map((s) => {
                      const checked = values.selected_sessions.includes(s.value);
                      const disabled = values.registration_type === "full_pass";
                      return (
                        <label
                          key={s.value}
                          className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition ${
                            checked ? "border-foreground bg-foreground/[0.03]" : "border-border"
                          } ${disabled ? "opacity-90 cursor-default" : ""}`}
                        >
                          <Checkbox
                            checked={checked}
                            disabled={disabled}
                            onCheckedChange={() => !disabled && toggleSession(s.value)}
                          />
                          <div className="flex-1">
                            <p className="text-sm text-foreground">{s.short}</p>
                            <p className="text-xs text-muted-foreground">{s.dates}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">${weeklyPrice}</span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.selected_sessions && <p className="text-[11px] text-destructive mt-1">{errors.selected_sessions}</p>}

                  {values.selected_sessions.length > 0 && (
                    <div className="flex items-center justify-between mt-3 p-3 bg-foreground/[0.03] rounded-md">
                      <span className="text-xs font-display tracking-wider text-muted-foreground">TOTAL</span>
                      <span className="text-lg font-display text-foreground">${totalAmount}</span>
                    </div>
                  )}
                </div>

                {/* ATHLETE */}
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
                      <Input
                        type="number" inputMode="numeric" min={4} max={25}
                        value={values.athlete_age as any}
                        onChange={(e) => set("athlete_age", e.target.value as any)}
                      />
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
                    <div className="sm:col-span-2">
                      <Field label="T-shirt size" error={errors.tshirt_size}>
                        <Select value={values.tshirt_size} onValueChange={(v) => set("tshirt_size", v)}>
                          <SelectTrigger><SelectValue placeholder="Select a size" /></SelectTrigger>
                          <SelectContent>
                            {TSHIRT_SIZES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </div>
                </div>

                {/* PARENT */}
                <div>
                  <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground mb-3">PARENT / GUARDIAN</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <Field label="Full name" error={errors.parent_name}>
                        <Input value={values.parent_name} onChange={(e) => set("parent_name", e.target.value)} autoComplete="name" />
                      </Field>
                    </div>
                    <Field label="Email" error={errors.parent_email}>
                      <Input type="email" inputMode="email" value={values.parent_email} onChange={(e) => set("parent_email", e.target.value)} autoComplete="email" />
                    </Field>
                    <Field label="Phone" error={errors.parent_phone}>
                      <Input type="tel" inputMode="tel" value={values.parent_phone} onChange={(e) => set("parent_phone", e.target.value)} autoComplete="tel" />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Emergency contact (name + phone)" error={errors.emergency_contact}>
                        <Input value={values.emergency_contact} onChange={(e) => set("emergency_contact", e.target.value)} placeholder="e.g. Jane Doe — 555-123-4567" />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Medical notes / allergies (optional)" error={errors.medical_notes}>
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

                {submitError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-foreground font-semibold">Couldn't complete your registration.</p>
                      <p className="text-muted-foreground mt-1 break-words">{submitError}</p>
                      <p className="text-muted-foreground mt-2">
                        Try again below. If it keeps failing, text us — we'll lock in your spot manually.
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="vault"
                  size="lg"
                  className="w-full"
                  disabled={submitting}
                  aria-busy={submitting}
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {submitStatus || "SUBMITTING…"}</>
                  ) : (
                    <>{submitError ? "TRY AGAIN" : (PAYMENT_ENABLED ? `REGISTER NOW · $${totalAmount || 0}` : "REGISTER NOW")}<ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>

                {submitting && submitStatus && (
                  <p className="text-[12px] text-muted-foreground text-center" aria-live="polite">
                    {submitStatus}
                  </p>
                )}

                <p className="text-[11px] text-muted-foreground text-center">
                  {PAYMENT_ENABLED
                    ? "You'll be redirected to a secure Stripe checkout to lock in your spot."
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
              { icon: ShieldCheck, label: "VAULT-Certified Coaches", body: "College and pro playing backgrounds. Trained on the 22M / VAULT system." },
              { icon: Users, label: "Capacity-Locked Groups", body: "Each week is capped — every athlete gets reps and feedback." },
              { icon: Trophy, label: "Built for Real Results", body: "Daily focus blocks across hitting, pitching, defense, and speed." },
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

        {/* REFUND POLICY */}
        <section className="container mx-auto px-4 max-w-3xl mb-14">
          <Card className="border-border">
            <CardContent className="p-5">
              <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground mb-2">REFUND POLICY</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Limited refunds. Full refund up to 14 days before your week's start date. 50% refund inside 14 days.
                <span className="text-foreground"> No refunds once the week begins.</span> The Full Summer Pass is non-transferable
                between athletes. Camp runs rain or shine; severe-weather cancellations are rescheduled, not refunded.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-display text-foreground mb-3">SPOTS GO FAST.</h2>
          <p className="text-sm text-muted-foreground mb-5">Lock your week in under 2 minutes.</p>
          <Button variant="vault" size="lg" onClick={scrollToForm} className="min-w-[240px]">
            REGISTER NOW
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </section>
      </main>

      <Footer />
    </div>
  );
};

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div data-error={error ? "true" : undefined}>
      <Label className="text-xs text-muted-foreground mb-1.5 block">{label}</Label>
      {children}
      {error ? <p className="text-[11px] text-destructive mt-1">{error}</p> : null}
    </div>
  );
}

export default SummerCamp;
