import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2, ArrowLeft, CheckCircle2, MapPin, Calendar } from "lucide-react";
import { z } from "zod";
import { usePublicTryout, submitTryoutRegistration } from "@/hooks/useTryouts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "long", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });

const isValidCalendarDate = (year: number, month: number, day: number) => {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const normalizeDateInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    return isValidCalendarDate(year, month, day) ? `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}` : null;
  }

  const usMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (usMatch) {
    const month = Number(usMatch[1]);
    const day = Number(usMatch[2]);
    const year = Number(usMatch[3]);
    if (!isValidCalendarDate(year, month, day)) return null;
    return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  return null;
};

const FormSchema = z.object({
  player_first_name: z.string().trim().min(1, "Required"),
  player_last_name: z.string().trim().min(1, "Required"),
  player_dob: z.string().trim().min(1, "Required").refine((value) => normalizeDateInput(value) !== null, {
    message: "Use MM/DD/YYYY",
  }),
  player_throwing_hand: z.enum(["Right", "Left"], { required_error: "Required" }),
  player_position: z.string().optional(),
  player_current_team: z.string().optional(),
  player_experience: z.string().max(200).optional(),
  parent_name: z.string().trim().min(1, "Required"),
  parent_email: z.string().trim().email("Invalid email"),
  parent_phone: z.string().trim().min(7, "Required"),
  emergency_contact_name: z.string().trim().min(1, "Required"),
  emergency_contact_phone: z.string().trim().min(7, "Required"),
  emergency_relationship: z.string().trim().min(1, "Required"),
  medical_notes: z.string().max(1000).optional(),
  photo_release_consent: z.boolean(),
  waiver_accepted: z.boolean().refine((v) => v, "You must accept the waiver"),
  waiver_signature_name: z.string().trim().min(1, "Type your name to sign"),
});

type FormValues = z.infer<typeof FormSchema>;

const STORAGE_KEY = (id: string) => `tryout-form:${id}`;

const POSITIONS = ["Pitcher", "Catcher", "Infield", "Outfield", "Utility"];

const TryoutRegister = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: event, isLoading, isError, error, refetch, isFetching } = usePublicTryout(id);
  const formRef = useRef<HTMLFormElement | null>(null);

  const [values, setValues] = useState<FormValues>({
    player_first_name: "",
    player_last_name: "",
    player_dob: "",
    player_throwing_hand: "Right",
    player_position: "",
    player_current_team: "",
    player_experience: "",
    parent_name: "",
    parent_email: "",
    parent_phone: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_relationship: "",
    medical_notes: "",
    photo_release_consent: false,
    waiver_accepted: false,
    waiver_signature_name: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ status: string; waitlist_position: number | null } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Restore + persist progress
  useEffect(() => {
    if (!id) return;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY(id));
      if (saved) {
        setValues((v) => ({ ...v, ...JSON.parse(saved) }));
      }
    } catch {
      // Ignore storage failures on restrictive mobile browsers.
    }
  }, [id]);
  useEffect(() => {
    if (!id) return;
    try {
      window.localStorage.setItem(STORAGE_KEY(id), JSON.stringify(values));
    } catch {
      // Ignore storage failures on restrictive mobile browsers.
    }
  }, [id, values]);

  // SEO / OG tags — dynamic per event
  useEffect(() => {
    if (!event) return;
    const title = `Register: ${event.name} | Vault Tryouts`;
    const desc = `Reserve your spot for ${event.name} on ${new Date(event.starts_at).toLocaleDateString()} at ${event.location_name}. Ages ${event.age_group}.`;
    document.title = title;
    const setMeta = (selector: string, attr: string, name: string, content: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta('meta[name="description"]', "name", "description", desc);
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", desc);
    setMeta('meta[property="og:type"]', "property", "og:type", "event");
    setMeta('meta[property="og:image"]', "property", "og:image", "https://vault-baseball.lovable.app/favicon.webp");
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
  }, [event]);

  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const normalizedDob = normalizeDateInput(values.player_dob);

  const ageOnEvent = (() => {
    if (!event || !normalizedDob) return null;
    const dob = new Date(`${normalizedDob}T12:00:00`);
    const ev = new Date(event.starts_at);
    let a = ev.getFullYear() - dob.getFullYear();
    const m = ev.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && ev.getDate() < dob.getDate())) a--;
    return a;
  })();

  const ageMismatch = (() => {
    if (!event || ageOnEvent === null) return false;
    const [min, max] = event.age_group.split("-").map((n) => parseInt(n, 10));
    return ageOnEvent < min || ageOnEvent > max;
  })();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    const parsed = FormSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (v?.[0]) errs[k] = v[0];
      }
      setErrors(errs);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      toast.error("Please fix the errors and try again");
      return;
    }

    const normalizedPlayerDob = normalizeDateInput(parsed.data.player_dob);
    if (!normalizedPlayerDob) {
      setErrors({ player_dob: "Use MM/DD/YYYY" });
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      toast.error("Please enter a valid date of birth");
      return;
    }

    setErrors({});
    setSubmitError(null);
    setSubmitting(true);
    try {
      const result = await submitTryoutRegistration({
        event_id: event.id,
        ...parsed.data,
        player_dob: normalizedPlayerDob,
      });
      try {
        window.localStorage.removeItem(STORAGE_KEY(event.id));
      } catch {
        // Ignore storage failures on restrictive mobile browsers.
      }
      setSuccess({ status: result.status, waitlist_position: result.waitlist_position });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      const message = err?.message || "Could not submit registration";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-10 text-center space-y-4">
            <h1 className="text-2xl font-display tracking-wide">Registration is loading slowly</h1>
            <p className="text-sm text-muted-foreground">
              {(error as Error | null)?.message || "Please try again."}
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => refetch()} disabled={isFetching}>
                {isFetching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Retry
              </Button>
              <Button asChild variant="outline"><Link to="/tryouts">Back to Tryouts</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardContent className="py-10 text-center space-y-4">
            <p className="text-sm text-muted-foreground">This tryout is not available.</p>
            <Button asChild variant="outline"><Link to="/tryouts">Back to Tryouts</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-2xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 mx-auto text-foreground" />
              <h1 className="text-2xl font-display tracking-wide">
                {success.status === "waitlisted" ? "You're on the waitlist" : "Registration received"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {success.status === "waitlisted"
                  ? `You're #${success.waitlist_position} on the waitlist for ${event.name}. We'll email you if a spot opens.`
                  : `Your spot for ${event.name} is reserved. A confirmation email is on the way with all the event details.`}
              </p>
              <div className="border border-border p-4 text-left text-sm space-y-1.5">
                <div className="font-medium">{event.name}</div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> {formatDate(event.starts_at)}
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> {event.location_name}
                </div>
                {event.what_to_bring && (
                  <div className="pt-2 mt-2 border-t border-border">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">What to bring</div>
                    <div>{event.what_to_bring}</div>
                  </div>
                )}
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link to="/tryouts">Back to Tryouts</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to="/tryouts"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{event.name}</div>
            <div className="text-[11px] text-muted-foreground">Ages {event.age_group} · Free</div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-sm text-muted-foreground mb-6 space-y-1">
          <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {formatDate(event.starts_at)}</div>
          <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {event.location_name}</div>
        </div>

        <form ref={formRef} onSubmit={onSubmit} className="space-y-8" noValidate>
          {Object.keys(errors).length > 0 && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
              Please review the highlighted fields before submitting.
            </div>
          )}

          <Section title="Player info">
            <Row>
              <Field label="First name *" error={errors.player_first_name}>
                <Input value={values.player_first_name} onChange={(e) => set("player_first_name", e.target.value)} />
              </Field>
              <Field label="Last name *" error={errors.player_last_name}>
                <Input value={values.player_last_name} onChange={(e) => set("player_last_name", e.target.value)} />
              </Field>
            </Row>
            <Field label="Date of birth *" error={errors.player_dob}>
              <Input
                type="text"
                autoComplete="bday"
                placeholder="MM/DD/YYYY"
                value={values.player_dob}
                onChange={(e) => set("player_dob", e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">Enter as MM/DD/YYYY</p>
              {ageMismatch && (
                <p className="text-xs text-destructive mt-1">
                  This event is for ages {event.age_group}. Player appears to be {ageOnEvent}.
                </p>
              )}
            </Field>
            <Field label="Throwing hand *" error={errors.player_throwing_hand}>
              <div className="flex flex-wrap gap-3">
                {(["Right", "Left"] as const).map((hand) => (
                  <label key={hand} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="player_throwing_hand"
                      value={hand}
                      checked={values.player_throwing_hand === hand}
                      onChange={() => set("player_throwing_hand", hand)}
                      className="h-4 w-4 accent-[hsl(var(--primary))]"
                    />
                    <span>{hand}</span>
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Primary position">
              <select
                value={values.player_position}
                onChange={(e) => set("player_position", e.target.value)}
                className="flex h-10 w-full border border-input bg-background px-3 text-base md:text-sm"
              >
                <option value="">Select…</option>
                {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Current team (optional)">
              <Input value={values.player_current_team} onChange={(e) => set("player_current_team", e.target.value)} />
            </Field>
            <Field label="Brief experience (optional)" hint="Up to 200 characters">
              <Textarea
                rows={3}
                maxLength={200}
                value={values.player_experience}
                onChange={(e) => set("player_experience", e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Parent / guardian">
            <Field label="Name *" error={errors.parent_name}>
              <Input value={values.parent_name} onChange={(e) => set("parent_name", e.target.value)} />
            </Field>
            <Row>
              <Field label="Email *" error={errors.parent_email}>
                <Input type="email" value={values.parent_email} onChange={(e) => set("parent_email", e.target.value)} />
              </Field>
              <Field label="Phone *" error={errors.parent_phone}>
                <Input type="tel" value={values.parent_phone} onChange={(e) => set("parent_phone", e.target.value)} />
              </Field>
            </Row>
          </Section>

          <Section title="Emergency contact">
            <Field label="Name *" error={errors.emergency_contact_name}>
              <Input value={values.emergency_contact_name} onChange={(e) => set("emergency_contact_name", e.target.value)} />
            </Field>
            <Row>
              <Field label="Phone *" error={errors.emergency_contact_phone}>
                <Input type="tel" value={values.emergency_contact_phone} onChange={(e) => set("emergency_contact_phone", e.target.value)} />
              </Field>
              <Field label="Relationship *" error={errors.emergency_relationship}>
                <Input value={values.emergency_relationship} onChange={(e) => set("emergency_relationship", e.target.value)} />
              </Field>
            </Row>
            <Field label="Allergies / medical notes (optional)">
              <Textarea
                rows={3}
                maxLength={1000}
                value={values.medical_notes}
                onChange={(e) => set("medical_notes", e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Waiver">
            <div className="border border-border bg-muted/30 p-3 max-h-40 overflow-y-auto text-xs text-muted-foreground whitespace-pre-line">
              {event.waiver_text}
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={values.waiver_accepted}
                onChange={(e) => set("waiver_accepted", e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]"
              />
              <span className="text-sm">I have read and agree to the waiver</span>
            </label>
            {errors.waiver_accepted && <p className="text-xs text-destructive">{errors.waiver_accepted}</p>}
            <Field label="Type your full name to sign *" error={errors.waiver_signature_name}>
              <Input value={values.waiver_signature_name} onChange={(e) => set("waiver_signature_name", e.target.value)} />
            </Field>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={values.photo_release_consent}
                onChange={(e) => set("photo_release_consent", e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]"
              />
              <span className="text-sm">
                I consent to photos / video being used for promotional purposes (optional)
              </span>
            </label>
          </Section>

          <div className="border-t border-border pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cost</span>
              <span className="text-2xl font-semibold">Free</span>
            </div>
            {submitError && (
              <p className="text-sm text-destructive" role="alert">
                {submitError}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Tryouts are free. You'll receive a confirmation email with event details.
            </p>
            <Button type="submit" className="w-full" disabled={submitting || ageMismatch}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</> : "Reserve my spot"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-4">
    <h2 className="text-xs uppercase tracking-widest text-muted-foreground border-b border-border pb-2">{title}</h2>
    {children}
  </section>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
);

const Field = ({
  label, hint, error, children,
}: { label: string; hint?: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-sm">{label}</Label>
    {children}
    {hint && !error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

export default TryoutRegister;
