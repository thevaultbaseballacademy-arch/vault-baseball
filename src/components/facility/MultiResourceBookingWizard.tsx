import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Loader2,
  MapPin,
  UserCog,
  AlertTriangle,
  CalendarX,
  Search,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

import { useFacilitySpaces, useFacilityHours } from "@/hooks/useFacilitySchedule";
import { useEssaCoaches } from "@/hooks/useEssaCoaches";
import {
  createReservationAtomic,
  type ReservationConflict,
} from "@/lib/facility/reservationClient";
import { findIntersectingSlots, type FreeSlot } from "@/lib/facility/timeIntersection";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type Step = "resources" | "time" | "customer" | "confirm";

type WizardState = {
  spaceId: string | null;
  coachUserId: string | null; // null = no coach
  durationMinutes: number;
  slot: FreeSlot | null;
  customerName: string;
  customerEmail: string;
  notes: string;
};

const EMPTY: WizardState = {
  spaceId: null,
  coachUserId: null,
  durationMinutes: 60,
  slot: null,
  customerName: "",
  customerEmail: "",
  notes: "",
};

const DURATION_OPTIONS = [30, 45, 60, 75, 90, 120];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const fmtTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const fmtDay = (d: Date) =>
  d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

/* -------------------------------------------------------------------------- */
/*  Stepper                                                                    */
/* -------------------------------------------------------------------------- */

const STEPS: { key: Step; label: string }[] = [
  { key: "resources", label: "Resources" },
  { key: "time", label: "Time" },
  { key: "customer", label: "Customer" },
  { key: "confirm", label: "Confirm" },
];

const Stepper = ({ current }: { current: Step }) => {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-2 mb-4">
      {STEPS.map((s, i) => {
        const active = i === idx;
        const done = i < idx;
        return (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-wider transition-colors ${
                active
                  ? "border-primary bg-primary/15 text-primary"
                  : done
                    ? "border-primary/40 bg-primary/5 text-primary/80"
                    : "border-border bg-card text-muted-foreground"
              }`}
            >
              <span className="font-display">{i + 1}</span>
              <span>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-4 h-px bg-border" />
            )}
          </div>
        );
      })}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Conflict banner                                                            */
/* -------------------------------------------------------------------------- */

const ConflictBanner = ({
  conflicts,
  spaceName,
  coachName,
  onBackToTime,
  onBackToResources,
}: {
  conflicts: ReservationConflict[];
  spaceName: string | null;
  coachName: string | null;
  onBackToTime: () => void;
  onBackToResources: () => void;
}) => {
  const lines = conflicts.map((c) => {
    const who =
      c.resource_type === "coach"
        ? coachName ?? "The selected coach"
        : c.resource_type === "space"
          ? spaceName ?? "The selected space"
          : "A resource";
    const when = `${fmtTime(new Date(c.conflicting_starts_at))}–${fmtTime(new Date(c.conflicting_ends_at))}`;
    const title = c.conflicting_title ? ` ("${c.conflicting_title}")` : "";
    return `${who} was just booked at this time${title} — ${when}.`;
  });

  return (
    <Card className="p-4 border-destructive/40 bg-destructive/5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="font-display text-sm uppercase tracking-wider text-destructive mb-1">
            Time no longer available
          </div>
          <ul className="text-sm text-foreground space-y-1">
            {lines.map((l, i) => (
              <li key={i}>• {l}</li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            Your selections are saved. Pick a different time or change resources.
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={onBackToTime}>
              Pick another time
            </Button>
            <Button size="sm" variant="ghost" onClick={onBackToResources}>
              Change resources
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

/* -------------------------------------------------------------------------- */
/*  Step: Resources                                                            */
/* -------------------------------------------------------------------------- */

const ResourceStep = ({
  state,
  setState,
  onContinue,
}: {
  state: WizardState;
  setState: (s: WizardState) => void;
  onContinue: () => void;
}) => {
  const { data: spaces = [] } = useFacilitySpaces();
  const { data: coaches = [] } = useEssaCoaches();
  const activeSpaces = spaces.filter((s) => s.is_active);

  const canContinue = !!state.spaceId;

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm uppercase tracking-wider text-foreground">
            Space
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {activeSpaces.map((s) => {
            const sel = state.spaceId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setState({ ...state, spaceId: s.id })}
                className={`text-left rounded-lg border p-3 transition-all ${
                  sel
                    ? "border-primary bg-primary/10 shadow-[0_0_0_1px_hsl(var(--primary)/0.4)]"
                    : "border-border bg-background hover:border-primary/40"
                }`}
              >
                <div className="font-display text-sm text-foreground">{s.name}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                  {s.space_type} · cap {s.capacity}
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">
          One space per booking. Equipment is grab-from-shelf and not tracked.
        </p>
      </Card>

      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <UserCog className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm uppercase tracking-wider text-foreground">
            Coach (optional)
          </h3>
        </div>
        <Select
          value={state.coachUserId ?? "none"}
          onValueChange={(v) =>
            setState({ ...state, coachUserId: v === "none" ? null : v })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="No specific coach" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No specific coach</SelectItem>
            {coaches.map((c) => (
              <SelectItem key={c.user_id} value={c.user_id}>
                {c.display_name}
                {c.position ? ` · ${c.position}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground mt-2">
          Selecting a coach blocks their schedule and intersects available times.
        </p>
      </Card>

      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <CalendarClock className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm uppercase tracking-wider text-foreground">
            Duration
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((m) => {
            const sel = state.durationMinutes === m;
            return (
              <button
                key={m}
                onClick={() => setState({ ...state, durationMinutes: m })}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  sel
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/40"
                }`}
              >
                {m} min
              </button>
            );
          })}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button disabled={!canContinue} onClick={onContinue}>
          Continue <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Step: Time intersection                                                    */
/* -------------------------------------------------------------------------- */

const TimeStep = ({
  state,
  setState,
  spaceName,
  coachName,
  onBack,
  onContinue,
}: {
  state: WizardState;
  setState: (s: WizardState) => void;
  spaceName: string | null;
  coachName: string | null;
  onBack: () => void;
  onContinue: () => void;
}) => {
  const { data: hours = [] } = useFacilityHours();
  const [slots, setSlots] = useState<FreeSlot[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!state.spaceId || hours.length === 0) return;
    setLoading(true);
    const t0 = performance.now();
    findIntersectingSlots({
      spaceId: state.spaceId,
      coachUserId: state.coachUserId,
      durationMinutes: state.durationMinutes,
      hours,
    })
      .then((result) => {
        if (cancelled) return;
        setSlots(result);
        setElapsedMs(Math.round(performance.now() - t0));
      })
      .catch((e) => toast.error(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [state.spaceId, state.coachUserId, state.durationMinutes, hours]);

  const grouped = useMemo(() => {
    const map = new Map<string, FreeSlot[]>();
    (slots ?? []).forEach((s) => {
      const key = s.start.toDateString();
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    });
    return Array.from(map.entries()).map(([day, list]) => ({
      day: new Date(day),
      list,
    }));
  }, [slots]);

  const restated = [
    spaceName ? `**${spaceName}**` : "the selected space",
    coachName ? `coach **${coachName}**` : null,
  ]
    .filter(Boolean)
    .join(" and ");

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-primary/5 border-primary/30">
        <div className="flex items-start gap-2">
          <Search className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-foreground">
            Looking for {state.durationMinutes}-minute windows in the next 14 days when{" "}
            <span dangerouslySetInnerHTML={{ __html: restated.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>") }} />{" "}
            {coachName ? "are" : "is"} free at the same time.
          </div>
        </div>
      </Card>

      {loading && (
        <Card className="p-8 text-center bg-card border-border">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
          <div className="text-xs text-muted-foreground mt-2">Computing availability…</div>
        </Card>
      )}

      {!loading && slots && slots.length === 0 && (
        <Card className="p-8 text-center bg-card border-border">
          <CalendarX className="w-8 h-8 mx-auto text-muted-foreground/60" />
          <div className="font-display text-sm uppercase tracking-wider text-foreground mt-3">
            No times in the next 14 days work
          </div>
          <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto">
            Try a shorter duration, drop the coach requirement, or pick a different space.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Change resources
          </Button>
        </Card>
      )}

      {!loading && slots && slots.length > 0 && (
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-primary" />
              <h3 className="font-display text-sm uppercase tracking-wider text-foreground">
                Available times
              </h3>
            </div>
            {elapsedMs !== null && (
              <Badge variant="outline" className="text-[10px]">
                {slots.length} slots · {elapsedMs}ms
              </Badge>
            )}
          </div>
          <ScrollArea className="max-h-[420px]">
            <div className="space-y-4 pr-2">
              {grouped.map(({ day, list }) => (
                <div key={day.toISOString()}>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                    {fmtDay(day)}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {list.map((s) => {
                      const sel =
                        state.slot &&
                        state.slot.start.getTime() === s.start.getTime();
                      return (
                        <button
                          key={s.start.toISOString()}
                          onClick={() => setState({ ...state, slot: s })}
                          className={`rounded-md border px-2 py-2 text-xs font-medium transition-all ${
                            sel
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-primary/30 bg-primary/5 text-foreground hover:bg-primary/15 hover:border-primary"
                          }`}
                        >
                          {fmtTime(s.start)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button disabled={!state.slot} onClick={onContinue}>
          Continue <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Step: Customer                                                             */
/* -------------------------------------------------------------------------- */

const CustomerStep = ({
  state,
  setState,
  onBack,
  onContinue,
}: {
  state: WizardState;
  setState: (s: WizardState) => void;
  onBack: () => void;
  onContinue: () => void;
}) => {
  const canContinue = state.customerName.trim().length > 0;
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-card border-border space-y-3">
        <div>
          <Label>Customer / Athlete name *</Label>
          <Input
            value={state.customerName}
            onChange={(e) => setState({ ...state, customerName: e.target.value })}
            placeholder="e.g. Eddie Mejia"
          />
        </div>
        <div>
          <Label>Email (optional)</Label>
          <Input
            type="email"
            value={state.customerEmail}
            onChange={(e) => setState({ ...state, customerEmail: e.target.value })}
            placeholder="parent@example.com"
          />
        </div>
        <div>
          <Label>Notes (optional)</Label>
          <Textarea
            rows={3}
            value={state.notes}
            onChange={(e) => setState({ ...state, notes: e.target.value })}
            placeholder="Lesson focus, equipment requests, etc."
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Existing customer? Type their name as it appears in your system. CRM linking ships with Day 8.
        </p>
      </Card>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button disabled={!canContinue} onClick={onContinue}>
          Continue <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Step: Confirm                                                              */
/* -------------------------------------------------------------------------- */

const ConfirmStep = ({
  state,
  spaceName,
  coachName,
  onBack,
  submitting,
  onSubmit,
}: {
  state: WizardState;
  spaceName: string | null;
  coachName: string | null;
  onBack: () => void;
  submitting: boolean;
  onSubmit: () => void;
}) => {
  return (
    <div className="space-y-4">
      <Card className="p-5 bg-card border-primary/40 shadow-[0_8px_24px_-16px_hsl(var(--primary)/0.5)]">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm uppercase tracking-wider text-foreground">
            Review & confirm
          </h3>
        </div>
        <div className="space-y-2 text-sm">
          <Row label="Customer" value={state.customerName} />
          <Row label="Space" value={spaceName ?? "—"} />
          <Row label="Coach" value={coachName ?? "Not assigned"} />
          <Row label="Date" value={state.slot ? fmtDay(state.slot.start) : "—"} />
          <Row
            label="Time"
            value={
              state.slot
                ? `${fmtTime(state.slot.start)} – ${fmtTime(state.slot.end)}`
                : "—"
            }
          />
          <Row label="Duration" value={`${state.durationMinutes} min`} />
          {state.notes && <Row label="Notes" value={state.notes} />}
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} disabled={submitting}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button onClick={onSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Booking…
            </>
          ) : (
            <>Confirm booking</>
          )}
        </Button>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground text-right">{value}</span>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Wizard wrapper                                                             */
/* -------------------------------------------------------------------------- */

export const MultiResourceBookingWizard = ({
  open,
  onOpenChange,
  onBooked,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onBooked?: (reservationId: string) => void;
}) => {
  const [step, setStep] = useState<Step>("resources");
  const [state, setState] = useState<WizardState>(EMPTY);
  const [conflicts, setConflicts] = useState<ReservationConflict[] | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: spaces = [] } = useFacilitySpaces();
  const { data: coaches = [] } = useEssaCoaches();

  const spaceName = useMemo(
    () => spaces.find((s) => s.id === state.spaceId)?.name ?? null,
    [spaces, state.spaceId],
  );
  const coachName = useMemo(
    () => coaches.find((c) => c.user_id === state.coachUserId)?.display_name ?? null,
    [coaches, state.coachUserId],
  );

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep("resources");
      setState(EMPTY);
      setConflicts(null);
      setSubmitting(false);
    }
  }, [open]);

  const submit = async () => {
    if (!state.spaceId || !state.slot) return;
    setSubmitting(true);
    setConflicts(null);
    try {
      const result = await createReservationAtomic({
        spaceId: state.spaceId,
        coachUserId: state.coachUserId,
        startsAt: state.slot.start,
        endsAt: state.slot.end,
        title: state.customerName,
        email: state.customerEmail || null,
        notes: state.notes || null,
        status: "confirmed",
      });

      if (result.success) {
        toast.success("Booking confirmed");
        onBooked?.(result.reservation_id);
        onOpenChange(false);
      } else {
        // Conflict — keep state, surface specific resources
        setConflicts(result.conflicts);
        // Drop the no-longer-valid slot so the user must repick
        setState((s) => ({ ...s, slot: null }));
      }
    } catch (e: any) {
      toast.error(e.message ?? "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wide">
            New Reservation
          </DialogTitle>
        </DialogHeader>

        <Stepper current={step} />

        {conflicts && (
          <div className="mb-4">
            <ConflictBanner
              conflicts={conflicts}
              spaceName={spaceName}
              coachName={coachName}
              onBackToTime={() => {
                setConflicts(null);
                setStep("time");
              }}
              onBackToResources={() => {
                setConflicts(null);
                setStep("resources");
              }}
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
          >
            {step === "resources" && (
              <ResourceStep
                state={state}
                setState={setState}
                onContinue={() => setStep("time")}
              />
            )}
            {step === "time" && (
              <TimeStep
                state={state}
                setState={setState}
                spaceName={spaceName}
                coachName={coachName}
                onBack={() => setStep("resources")}
                onContinue={() => setStep("customer")}
              />
            )}
            {step === "customer" && (
              <CustomerStep
                state={state}
                setState={setState}
                onBack={() => setStep("time")}
                onContinue={() => setStep("confirm")}
              />
            )}
            {step === "confirm" && (
              <ConfirmStep
                state={state}
                spaceName={spaceName}
                coachName={coachName}
                onBack={() => setStep("customer")}
                submitting={submitting}
                onSubmit={submit}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default MultiResourceBookingWizard;
