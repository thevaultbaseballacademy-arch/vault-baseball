import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Shield, Check, ArrowRight } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TEAM_LEVELS, computePaymentPlan, formatUSD, getTeamLevel } from "@/lib/teamLevels";
import { openCheckout } from "@/lib/openCheckout";

const schema = z.object({
  team_level_id: z.string().min(1, "Select a team"),
  payment_plan: z.enum(["full", "installments"]),
  player_first_name: z.string().trim().min(1, "Required").max(80),
  player_last_name: z.string().trim().min(1, "Required").max(80),
  player_dob: z.string().optional().or(z.literal("")),
  player_position: z.string().max(60).optional().or(z.literal("")),
  parent_first_name: z.string().trim().min(1, "Required").max(80),
  parent_last_name: z.string().trim().min(1, "Required").max(80),
  parent_email: z.string().trim().email("Valid email required").max(255),
  parent_phone: z.string().trim().min(7, "Valid phone required").max(32),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

const TeamRegister = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const preselect = params.get("team") || TEAM_LEVELS[0].id;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      team_level_id: getTeamLevel(preselect)?.id ?? TEAM_LEVELS[0].id,
      payment_plan: "full",
      player_first_name: "",
      player_last_name: "",
      player_dob: "",
      player_position: "",
      parent_first_name: "",
      parent_last_name: "",
      parent_email: "",
      parent_phone: "",
      notes: "",
    },
  });

  const selectedId = watch("team_level_id");
  const plan = watch("payment_plan");
  const selected = useMemo(() => getTeamLevel(selectedId), [selectedId]);
  const planMath = useMemo(
    () => (selected ? computePaymentPlan(selected.annualTuitionCents) : null),
    [selected],
  );

  const chargeNow =
    selected && planMath
      ? plan === "full"
        ? selected.annualTuitionCents
        : planMath.depositCents
      : 0;

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      toast({ title: "Starting secure checkout…", description: "Redirecting to Stripe." });
      const { data, error } = await supabase.functions.invoke("create-team-registration", {
        body: values,
      });
      if (error) throw error;
      const url = (data as any)?.url;
      if (!url) throw new Error("Checkout did not return a URL");
      await openCheckout(url);
    } catch (e: any) {
      toast({
        title: "Registration failed",
        description: e?.message ?? "Please try again.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs uppercase tracking-[0.2em] font-semibold mb-4">
              <Shield className="w-3.5 h-3.5" /> Invitation Only
            </span>
            <h1 className="text-4xl md:text-6xl font-display tracking-wide text-foreground mb-3">
              VAULT TRAVEL TEAM REGISTRATION
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Lock in your roster spot. Submit your player details and tuition payment to
              confirm your offer.
            </p>
          </motion.div>

          {params.get("canceled") === "1" && (
            <Card className="mb-6 border-destructive/40 bg-destructive/5">
              <CardContent className="p-4 text-sm text-destructive">
                Checkout was canceled. No charge was made. You can resubmit below.
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-3 gap-6">
            {/* Form column */}
            <div className="md:col-span-2 space-y-6">
              {/* Team selection */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-lg font-display tracking-wide">1. Team</h2>
                  <div>
                    <Label>Team level</Label>
                    <Select
                      value={selectedId}
                      onValueChange={(v) => setValue("team_level_id", v, { shouldValidate: true })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEAM_LEVELS.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.label} — {formatUSD(t.annualTuitionCents)}/yr
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.team_level_id && (
                      <p className="text-xs text-destructive mt-1">{errors.team_level_id.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Player */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-lg font-display tracking-wide">2. Player</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>First name</Label>
                      <Input {...register("player_first_name")} />
                      {errors.player_first_name && (
                        <p className="text-xs text-destructive mt-1">{errors.player_first_name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label>Last name</Label>
                      <Input {...register("player_last_name")} />
                      {errors.player_last_name && (
                        <p className="text-xs text-destructive mt-1">{errors.player_last_name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label>Date of birth</Label>
                      <Input type="date" {...register("player_dob")} />
                    </div>
                    <div>
                      <Label>Primary position</Label>
                      <Input placeholder="e.g. SS / RHP" {...register("player_position")} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parent */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-lg font-display tracking-wide">3. Parent / Guardian</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>First name</Label>
                      <Input {...register("parent_first_name")} />
                      {errors.parent_first_name && (
                        <p className="text-xs text-destructive mt-1">{errors.parent_first_name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label>Last name</Label>
                      <Input {...register("parent_last_name")} />
                      {errors.parent_last_name && (
                        <p className="text-xs text-destructive mt-1">{errors.parent_last_name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" {...register("parent_email")} />
                      {errors.parent_email && (
                        <p className="text-xs text-destructive mt-1">{errors.parent_email.message}</p>
                      )}
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input type="tel" {...register("parent_phone")} />
                      {errors.parent_phone && (
                        <p className="text-xs text-destructive mt-1">{errors.parent_phone.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Notes (optional)</Label>
                    <Textarea rows={3} {...register("notes")} />
                  </div>
                </CardContent>
              </Card>

              {/* Payment plan */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-lg font-display tracking-wide">4. Payment</h2>
                  <RadioGroup
                    value={plan}
                    onValueChange={(v) => setValue("payment_plan", v as "full" | "installments")}
                    className="grid sm:grid-cols-2 gap-3"
                  >
                    <label
                      className={`border rounded-xl p-4 cursor-pointer transition ${
                        plan === "full" ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">Pay in full</span>
                        <RadioGroupItem value="full" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selected ? formatUSD(selected.annualTuitionCents) : "—"} today.
                      </p>
                    </label>
                    <label
                      className={`border rounded-xl p-4 cursor-pointer transition ${
                        plan === "installments" ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">Deposit + 6 months</span>
                        <RadioGroupItem value="installments" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {planMath ? formatUSD(planMath.depositCents) : "—"} today, then{" "}
                        {planMath ? formatUSD(planMath.installmentCents) : "—"} × 6 monthly.
                      </p>
                    </label>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Summary column */}
            <div>
              <div className="md:sticky md:top-24">
                <Card className="border-primary/30">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                      Order Summary
                    </h3>
                    <div>
                      <p className="text-2xl font-display tracking-wide">
                        {selected?.label ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">{selected?.tier} Tier</p>
                    </div>
                    <div className="border-t border-border pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Annual tuition</span>
                        <span>{selected ? formatUSD(selected.annualTuitionCents) : "—"}</span>
                      </div>
                      {plan === "installments" && planMath && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Deposit today</span>
                            <span>{formatUSD(planMath.depositCents)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Then 6× monthly</span>
                            <span>{formatUSD(planMath.installmentCents)}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="border-t border-border pt-4 flex justify-between items-baseline">
                      <span className="text-sm text-muted-foreground">Due today</span>
                      <span className="text-2xl font-display text-primary">
                        {formatUSD(chargeNow)}
                      </span>
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Continue to secure checkout
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center">
                      Powered by Stripe · 256-bit encryption
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeamRegister;
