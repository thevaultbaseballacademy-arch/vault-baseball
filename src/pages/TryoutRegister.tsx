import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2, ArrowLeft, CheckCircle2, MapPin, Calendar } from "lucide-react";
import { z } from "zod";
import { usePublicTryout, submitTryoutRegistration } from "@/hooks/useTryouts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "long", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });

const FormSchema = z.object({
  player_first_name: z.string().trim().min(1, "Required"),
  player_last_name: z.string().trim().min(1, "Required"),
  player_dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Required"),
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
  const { data: event, isLoading } = usePublicTryout(id);

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

  // Restore + persist progress
  useEffect(() => {
    if (!id) return;
    const saved = localStorage.getItem(STORAGE_KEY(id));
    if (saved) {
      try { setValues((v) => ({ ...v, ...JSON.parse(saved) })); } catch { /* ignore */ }
    }
  }, [id]);
  useEffect(() => {
    if (!id) return;
    localStorage.setItem(STORAGE_KEY(id), JSON.stringify(values));
  }, [id, values]);

  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const ageOnEvent = (() => {
    if (!event || !values.player_dob) return null;
    const dob = new Date(values.player_dob);
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
      toast.error("Please fix the errors and try again");
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const result = await submitTryoutRegistration({
        event_id: event.id,
        ...parsed.data,
      });
      localStorage.removeItem(STORAGE_KEY(event.id));
      setSuccess({ status: result.status, waitlist_position: result.waitlist_position });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err?.message || "Could not submit registration");
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
                  : `Your registration for ${event.name} is in. Payment and confirmation details will be sent to your email shortly.`}
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
            <div className="text-[11px] text-muted-foreground">Ages {event.age_group} · ${(event.price_cents / 100).toFixed(0)}</div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-sm text-muted-foreground mb-6 space-y-1">
          <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {formatDate(event.starts_at)}</div>
          <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {event.location_name}</div>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
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
              <Input type="date" value={values.player_dob} onChange={(e) => set("player_dob", e.target.value)} />
              {ageMismatch && (
                <p className="text-xs text-destructive mt-1">
                  This event is for ages {event.age_group}. Player appears to be {ageOnEvent}.
                </p>
              )}
            </Field>
            <Field label="Throwing hand *" error={errors.player_throwing_hand}>
              <RadioGroup
                value={values.player_throwing_hand}
                onValueChange={(v) => set("player_throwing_hand", v as "Right" | "Left")}
                className="flex gap-6"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="Right" /> Right
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="Left" /> Left
                </label>
              </RadioGroup>
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
              <Checkbox
                checked={values.waiver_accepted}
                onCheckedChange={(v) => set("waiver_accepted", !!v)}
                className="mt-0.5"
              />
              <span className="text-sm">I have read and agree to the waiver</span>
            </label>
            {errors.waiver_accepted && <p className="text-xs text-destructive">{errors.waiver_accepted}</p>}
            <Field label="Type your full name to sign *" error={errors.waiver_signature_name}>
              <Input value={values.waiver_signature_name} onChange={(e) => set("waiver_signature_name", e.target.value)} />
            </Field>
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={values.photo_release_consent}
                onCheckedChange={(v) => set("photo_release_consent", !!v)}
                className="mt-0.5"
              />
              <span className="text-sm">
                I consent to photos / video being used for promotional purposes (optional)
              </span>
            </label>
          </Section>

          <div className="border-t border-border pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-semibold">${(event.price_cents / 100).toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Payment will be collected after submission. You'll receive an email with details.
            </p>
            <Button type="submit" className="w-full" disabled={submitting || ageMismatch}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</> : "Submit registration"}
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
