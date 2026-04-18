import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldAlert,
  Sparkles,
  Star,
  Ticket,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PRIVATE_LESSONS,
  LESSON_PACKAGES,
  GROUP_LESSONS,
  CLINICS,
  PROGRAMS,
  RENTALS,
  formatPrice,
  type PrivateLesson,
  type LessonPackage,
} from "@/lib/essaPricing";
import { useEssaCheckout } from "@/hooks/useEssaCheckout";
import { useFacilityReservations, useFacilitySpaces } from "@/hooks/useFacilitySchedule";
import { useEssaCredits, useMyEssaBookings, useBookWithCredit } from "@/hooks/useEssaCredits";
import { useCoachEssaSlots } from "@/hooks/useEssaCoaches";
import EssaCoachPicker from "@/components/facility/EssaCoachPicker";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* -------------------------------------------------------------------------- */
/*  Calendar helpers                                                           */
/* -------------------------------------------------------------------------- */

const SLOT_MINUTES = 30;
const DAY_START_HOUR = 9;
const DAY_END_HOUR = 21;

const buildSlots = (date: Date): Date[] => {
  const start = new Date(date);
  start.setHours(DAY_START_HOUR, 0, 0, 0);
  const end = new Date(date);
  end.setHours(DAY_END_HOUR, 0, 0, 0);
  const out: Date[] = [];
  let t = new Date(start);
  while (t < end) {
    out.push(new Date(t));
    t = new Date(t.getTime() + SLOT_MINUTES * 60_000);
  }
  return out;
};

const formatTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const formatDayLabel = (d: Date) =>
  d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

/* -------------------------------------------------------------------------- */
/*  Header                                                                     */
/* -------------------------------------------------------------------------- */

const Header = () => (
  <div className="relative overflow-hidden border-b border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_60%)]" />
    <div className="container relative mx-auto px-4 py-12 md:py-16">
      <div className="flex flex-col items-start gap-3">
        <Badge className="bg-primary/15 text-primary border border-primary/30 uppercase tracking-[0.18em] text-[10px] px-3 py-1">
          ESSA — Edward's Sports Science Academy
        </Badge>
        <h1 className="font-display text-4xl md:text-6xl tracking-wide text-foreground">
          FACILITY SCHEDULING
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base md:text-lg">
          Book private lessons, packages, clinics, and team rentals. Same gold
          standard. Same coaches. Powered by VAULT OS.
        </p>
      </div>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Credits banner                                                             */
/* -------------------------------------------------------------------------- */

const CreditsBanner = () => {
  const { data: credits = [] } = useEssaCredits();
  const totalRemaining = credits.reduce((s, c) => s + c.remaining, 0);
  if (totalRemaining === 0) return null;

  const nextExpiry = credits
    .filter((c) => c.expires_at)
    .sort((a, b) => (a.expires_at! < b.expires_at! ? -1 : 1))[0];

  return (
    <Card className="p-4 bg-primary/10 border-primary/40 mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Ticket className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="font-display text-base text-foreground">
            {totalRemaining} lesson{totalRemaining === 1 ? "" : "s"} ready to book
          </div>
          {nextExpiry && (
            <div className="text-[11px] text-muted-foreground">
              Soonest expiry: {new Date(nextExpiry.expires_at!).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
      <Badge variant="outline" className="border-primary/40 text-primary text-[10px] uppercase tracking-wider">
        Pay-with-credit enabled
      </Badge>
    </Card>
  );
};

/* -------------------------------------------------------------------------- */
/*  Lesson card                                                                */
/* -------------------------------------------------------------------------- */

const LessonCard = ({
  lesson,
  isSelected,
  onSelect,
}: {
  lesson: PrivateLesson;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <motion.button
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onSelect}
    className={`w-full text-left rounded-xl border p-4 transition-all ${
      isSelected
        ? "border-primary bg-primary/10 shadow-[0_0_0_1px_hsl(var(--primary)/0.4),0_8px_24px_-12px_hsl(var(--primary)/0.5)]"
        : "border-border bg-card hover:border-primary/40"
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{lesson.icon}</div>
        <div>
          <div className="font-display text-base text-foreground tracking-wide">
            {lesson.shortName}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {lesson.durationMinutes} min · 1-on-1
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-display text-xl text-primary">{formatPrice(lesson.priceCents)}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          per session
        </div>
      </div>
    </div>
    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{lesson.description}</p>
  </motion.button>
);

/* -------------------------------------------------------------------------- */
/*  Package card                                                               */
/* -------------------------------------------------------------------------- */

const PackageCard = ({ pkg }: { pkg: LessonPackage }) => {
  const { startCheckout, isLoading } = useEssaCheckout();
  const isBest = pkg.savingsPercent === 20;
  const isPopular = pkg.savingsPercent === 15;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`relative rounded-2xl border p-5 bg-card transition-all ${
        isBest
          ? "border-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.5),0_12px_36px_-12px_hsl(var(--primary)/0.5)]"
          : "border-border hover:border-primary/40"
      }`}
    >
      {isBest && (
        <Badge className="absolute -top-2.5 left-4 bg-primary text-primary-foreground border-0 px-2.5 py-0.5 text-[10px] tracking-wider">
          BEST VALUE
        </Badge>
      )}
      {isPopular && (
        <Badge className="absolute -top-2.5 left-4 bg-primary/20 text-primary border border-primary/40 px-2.5 py-0.5 text-[10px] tracking-wider">
          MOST POPULAR
        </Badge>
      )}

      <div className="flex items-baseline justify-between mb-1">
        <div className="font-display text-lg tracking-wide text-foreground">
          {pkg.lessonCount} Lessons
        </div>
        <div className="text-primary font-display text-lg">Save {pkg.savingsPercent}%</div>
      </div>
      <div className="text-xs text-muted-foreground mb-4">{pkg.description}</div>

      <div className="flex items-baseline gap-2 mb-4">
        <div className="font-display text-3xl text-primary">
          {formatPrice(pkg.totalPriceCents)}
        </div>
        <div className="text-xs text-muted-foreground">
          ({formatPrice(pkg.perLessonPriceCents)}/session)
        </div>
      </div>

      <ul className="space-y-1.5 mb-5 text-xs text-muted-foreground">
        <li className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Credits added instantly after checkout
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> 6-month expiration
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Book any private lesson with credits
        </li>
      </ul>

      <Button
        className="w-full"
        variant={isBest ? "default" : "outline"}
        disabled={isLoading}
        onClick={() => startCheckout({ priceId: pkg.stripePriceId, metadata: { package_id: pkg.id } })}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Starting...
          </>
        ) : (
          <>
            Buy Package <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Slot picker                                                                */
/* -------------------------------------------------------------------------- */

const SlotPicker = ({
  selectedLesson,
  onSlotPick,
  selectedSlot,
  coachUserId,
}: {
  selectedLesson: PrivateLesson | null;
  selectedSlot: Date | null;
  onSlotPick: (d: Date) => void;
  coachUserId: string | null;
}) => {
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const slots = useMemo(() => buildSlots(date), [date]);
  const dayStart = new Date(date);
  dayStart.setHours(DAY_START_HOUR, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(DAY_END_HOUR, 0, 0, 0);

  const { data: spaces = [] } = useFacilitySpaces();
  const { data: reservations = [] } = useFacilityReservations(
    dayStart.toISOString(),
    dayEnd.toISOString(),
  );
  const { data: coachSlots = [], isLoading: loadingCoachSlots } = useCoachEssaSlots(
    coachUserId,
    date,
    selectedLesson?.durationMinutes ?? SLOT_MINUTES,
  );

  const activeSpaceCount = spaces.filter((s) => s.is_active).length || 1;

  const coachSlotSet = useMemo(() => {
    if (!coachUserId) return null;
    return new Set(coachSlots.map((s) => new Date(s.slot_start).getTime()));
  }, [coachUserId, coachSlots]);

  const isSlotBooked = (slotStart: Date) => {
    const slotEnd = new Date(slotStart.getTime() + SLOT_MINUTES * 60_000);
    const conflicting = reservations.filter(
      (r) =>
        r.status !== "cancelled" &&
        new Date(r.starts_at) < slotEnd &&
        new Date(r.ends_at) > slotStart,
    );
    return conflicting.length >= activeSpaceCount;
  };

  const isOutsideCoachAvail = (slot: Date) =>
    coachSlotSet !== null && !coachSlotSet.has(slot.getTime());

  const isPast = (slot: Date) => slot.getTime() < Date.now();

  const next7Days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  }, []);

  return (
    <Card className="p-4 md:p-5 bg-card border-border">
      <div className="flex items-center gap-2 mb-3">
        <CalendarIcon className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm tracking-wide text-foreground uppercase">
          Pick a Date & Time
        </h3>
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-3">
          {next7Days.map((d) => {
            const active = d.toDateString() === date.toDateString();
            return (
              <button
                key={d.toISOString()}
                onClick={() => setDate(d)}
                className={`shrink-0 rounded-lg border px-3 py-2 text-center transition-all ${
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider">
                  {d.toLocaleDateString(undefined, { weekday: "short" })}
                </div>
                <div className="font-display text-lg leading-tight">{d.getDate()}</div>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      <div className="text-xs text-muted-foreground mb-3">{formatDayLabel(date)}</div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[320px] overflow-y-auto">
        {slots.map((slot) => {
          const booked = isSlotBooked(slot);
          const past = isPast(slot);
          const outsideCoach = isOutsideCoachAvail(slot);
          const disabled = booked || past || outsideCoach;
          const selected = selectedSlot && selectedSlot.getTime() === slot.getTime();
          return (
            <button
              key={slot.toISOString()}
              disabled={disabled}
              onClick={() => onSlotPick(slot)}
              className={`rounded-md border px-2 py-2 text-xs font-medium transition-all ${
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : disabled
                    ? "border-border/40 bg-muted/30 text-muted-foreground/50 cursor-not-allowed line-through"
                    : "border-primary/30 bg-primary/5 text-foreground hover:bg-primary/15 hover:border-primary"
              }`}
            >
              {formatTime(slot)}
            </button>
          );
        })}
      </div>

      {coachUserId && loadingCoachSlots && (
        <p className="text-[11px] text-muted-foreground mt-2">Loading coach availability...</p>
      )}
      {coachUserId && !loadingCoachSlots && coachSlots.length === 0 && (
        <p className="text-[11px] text-amber-600 mt-2">
          This coach has no remaining slots on this day. Pick another day or coach.
        </p>
      )}

      {!selectedLesson && (
        <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5">
          <ShieldAlert className="w-3 h-3" /> Select a lesson type above to enable booking.
        </p>
      )}
    </Card>
  );
};

/* -------------------------------------------------------------------------- */
/*  Confirmation panel                                                         */
/* -------------------------------------------------------------------------- */

const ConfirmPanel = ({
  lesson,
  slot,
  onClear,
  onBooked,
}: {
  lesson: PrivateLesson | null;
  slot: Date | null;
  onClear: () => void;
  onBooked: () => void;
}) => {
  const { startCheckout, isLoading: checkoutLoading } = useEssaCheckout();
  const { data: credits = [] } = useEssaCredits();
  const bookWithCredit = useBookWithCredit();
  const totalCredits = credits.reduce((s, c) => s + c.remaining, 0);
  const canUseCredit = totalCredits > 0;

  if (!lesson || !slot) {
    return (
      <Card className="p-5 border-dashed border-border bg-card/40">
        <div className="text-center text-sm text-muted-foreground">
          <Sparkles className="w-5 h-5 mx-auto mb-2 text-primary/60" />
          Choose a lesson and a time slot to see your booking summary.
        </div>
      </Card>
    );
  }

  const handleBookWithCredit = async () => {
    try {
      await bookWithCredit.mutateAsync({
        lessonId: lesson.id,
        lessonName: lesson.shortName,
        durationMinutes: lesson.durationMinutes,
        slot,
      });
      onBooked();
    } catch {
      // toast handled in hook
    }
  };

  const handlePay = () =>
    startCheckout({
      priceId: lesson.stripePriceId,
      metadata: { lesson_id: lesson.id, requested_start: slot.toISOString() },
    });

  return (
    <Card className="p-5 bg-card border-primary/40 shadow-[0_8px_24px_-16px_hsl(var(--primary)/0.5)]">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm tracking-wide text-foreground uppercase">
          Confirm Booking
        </h3>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Lesson</span>
          <span className="text-foreground font-medium">{lesson.shortName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date</span>
          <span className="text-foreground">{formatDayLabel(slot)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Time</span>
          <span className="text-foreground">
            {formatTime(slot)} · {lesson.durationMinutes} min
          </span>
        </div>
        <div className="flex justify-between border-t border-border pt-2 mt-2">
          <span className="text-muted-foreground">Total</span>
          <span className="text-primary font-display text-lg">{formatPrice(lesson.priceCents)}</span>
        </div>
      </div>

      {canUseCredit && (
        <Button
          onClick={handleBookWithCredit}
          disabled={bookWithCredit.isPending}
          className="w-full mt-4"
        >
          {bookWithCredit.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Booking...
            </>
          ) : (
            <>
              <Ticket className="w-4 h-4 mr-2" />
              Book with credit ({totalCredits} left)
            </>
          )}
        </Button>
      )}

      <div className="mt-3 flex gap-2">
        <Button variant="outline" onClick={onClear} className="flex-1">
          Clear
        </Button>
        <Button
          onClick={handlePay}
          disabled={checkoutLoading}
          variant={canUseCredit ? "outline" : "default"}
          className="flex-1"
        >
          {checkoutLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...
            </>
          ) : (
            <>
              Pay & Book <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
        Free cancellation 24+ hours in advance. Within 24h: 50% charge. Same-day or no-show:
        full charge + $25 fee. Weather cancellations are fully refunded.
      </p>
    </Card>
  );
};

/* -------------------------------------------------------------------------- */
/*  My ESSA bookings                                                           */
/* -------------------------------------------------------------------------- */

const MyBookings = () => {
  const { data: bookings = [], isLoading } = useMyEssaBookings();

  const upcoming = bookings.filter((b) => new Date(b.starts_at) >= new Date());
  const past = bookings
    .filter((b) => new Date(b.starts_at) < new Date())
    .slice(-5)
    .reverse();

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground text-center py-10">
        <Loader2 className="w-4 h-4 inline animate-spin mr-2" /> Loading your bookings...
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed bg-card/40">
        <CalendarIcon className="w-6 h-6 mx-auto mb-2 text-primary/60" />
        <div className="text-sm text-muted-foreground">
          No ESSA bookings yet. Book a session above to get started.
        </div>
      </Card>
    );
  }

  const Row = ({ b }: { b: (typeof bookings)[number] }) => {
    const start = new Date(b.starts_at);
    const isUpcoming = start >= new Date();
    return (
      <div className="flex items-center justify-between gap-3 border-b border-border/50 last:border-0 py-3">
        <div className="min-w-0">
          <div className="text-sm text-foreground font-medium truncate">{b.title}</div>
          <div className="text-[11px] text-muted-foreground">
            {start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}{" "}
            · {formatTime(start)}
          </div>
        </div>
        <Badge
          variant="outline"
          className={
            isUpcoming
              ? "border-primary/40 text-primary text-[10px]"
              : "border-border text-muted-foreground text-[10px]"
          }
        >
          {isUpcoming ? "Upcoming" : "Past"}
        </Badge>
      </div>
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-5 bg-card border-border">
        <h3 className="font-display text-sm tracking-wide uppercase mb-2">Upcoming</h3>
        {upcoming.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">Nothing on the books.</p>
        ) : (
          upcoming.map((b) => <Row key={b.id} b={b} />)
        )}
      </Card>
      <Card className="p-5 bg-card border-border">
        <h3 className="font-display text-sm tracking-wide uppercase mb-2">Recent</h3>
        {past.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No completed sessions yet.</p>
        ) : (
          past.map((b) => <Row key={b.id} b={b} />)
        )}
      </Card>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Inquiry-only catalogs                                                      */
/* -------------------------------------------------------------------------- */

const InquiryGrid = () => (
  <div className="grid md:grid-cols-2 gap-6">
    <Card className="p-5 bg-card border-border">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm tracking-wide uppercase">Group Lessons (2-4)</h3>
      </div>
      <div className="space-y-2">
        {GROUP_LESSONS.map((g) => (
          <div key={g.id} className="flex justify-between items-baseline border-b border-border/40 pb-2 last:border-0">
            <div>
              <div className="text-sm text-foreground">{g.name}</div>
              <div className="text-[11px] text-muted-foreground">{g.description}</div>
            </div>
            <div className="text-primary font-display text-base whitespace-nowrap">
              {formatPrice(g.pricePerAthleteCents)}
            </div>
          </div>
        ))}
      </div>
    </Card>

    <Card className="p-5 bg-card border-border">
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm tracking-wide uppercase">Clinics (5-15)</h3>
      </div>
      <div className="space-y-2">
        {CLINICS.map((c) => (
          <div key={c.id} className="flex justify-between items-baseline border-b border-border/40 pb-2 last:border-0">
            <div>
              <div className="text-sm text-foreground">{c.name}</div>
              <div className="text-[11px] text-muted-foreground">{c.durationLabel} · {c.description}</div>
            </div>
            <div className="text-primary font-display text-base whitespace-nowrap">
              {formatPrice(c.pricePerAthleteCents)}
            </div>
          </div>
        ))}
      </div>
    </Card>

    <Card className="p-5 bg-card border-border">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm tracking-wide uppercase">Team & Facility Rentals</h3>
      </div>
      <div className="space-y-2">
        {RENTALS.map((r) => (
          <div key={r.id} className="flex justify-between items-baseline border-b border-border/40 pb-2 last:border-0">
            <div>
              <div className="text-sm text-foreground">{r.name}</div>
              <div className="text-[11px] text-muted-foreground">{r.description}</div>
            </div>
            <div className="text-primary font-display text-base whitespace-nowrap">
              {formatPrice(r.priceCents)} <span className="text-[10px] text-muted-foreground">{r.unitLabel}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>

    <Card className="p-5 bg-card border-border">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm tracking-wide uppercase">Recurring Programs</h3>
      </div>
      <div className="space-y-2">
        {PROGRAMS.map((p) => (
          <div key={p.id} className="flex justify-between items-baseline border-b border-border/40 pb-2 last:border-0">
            <div>
              <div className="text-sm text-foreground">{p.name}</div>
              <div className="text-[11px] text-muted-foreground">{p.description}</div>
            </div>
            <div className="text-primary font-display text-base whitespace-nowrap">
              {formatPrice(p.priceCents)}
            </div>
          </div>
        ))}
      </div>
    </Card>

    <Card className="md:col-span-2 p-5 bg-primary/5 border-primary/30 text-center">
      <div className="text-sm text-foreground mb-1 font-display tracking-wide uppercase">
        Group, Clinic, Rental, or Team Inquiries
      </div>
      <p className="text-xs text-muted-foreground mb-3 max-w-xl mx-auto">
        Reach out and we'll build a custom contract, set up monthly billing, and lock in your slots.
      </p>
      <Button variant="outline" asChild>
        <a href="/contact">Contact ESSA</a>
      </Button>
    </Card>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

const FacilityScheduling = () => {
  const [selectedLesson, setSelectedLesson] = useState<PrivateLesson | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  useEffect(() => {
    const prev = document.title;
    document.title = "ESSA Facility Scheduling | VAULT OS";
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute("content") ?? null;
    meta?.setAttribute(
      "content",
      "Book private lessons, packages, clinics and team rentals at Edward's Sports Science Academy. Real-time availability and instant checkout.",
    );
    return () => {
      document.title = prev;
      if (prevDesc !== null) meta?.setAttribute("content", prevDesc);
    };
  }, []);

  const clearSelection = () => {
    setSelectedLesson(null);
    setSelectedSlot(null);
  };

  return (
    <>
      <Navbar />
      <main className="bg-background min-h-[100dvh]">
        <Header />

        <div className="container mx-auto px-4 py-8 md:py-12">
          <CreditsBanner />

          <Tabs defaultValue="single">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="single">Single Lesson</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="bookings">My Bookings</TabsTrigger>
              <TabsTrigger value="more">Groups · Clinics · Teams</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-3">
                  <h2 className="font-display text-sm tracking-wide uppercase text-foreground/80 mb-2">
                    1 · Choose Lesson
                  </h2>
                  {PRIVATE_LESSONS.map((l) => (
                    <LessonCard
                      key={l.id}
                      lesson={l}
                      isSelected={selectedLesson?.id === l.id}
                      onSelect={() => {
                        setSelectedLesson(l);
                        setSelectedSlot(null);
                      }}
                    />
                  ))}
                </div>

                <div className="lg:col-span-1 space-y-3">
                  <h2 className="font-display text-sm tracking-wide uppercase text-foreground/80 mb-2">
                    2 · Pick Time
                  </h2>
                  <SlotPicker
                    selectedLesson={selectedLesson}
                    selectedSlot={selectedSlot}
                    onSlotPick={(d) => selectedLesson && setSelectedSlot(d)}
                  />
                </div>

                <div className="lg:col-span-1 space-y-3">
                  <h2 className="font-display text-sm tracking-wide uppercase text-foreground/80 mb-2">
                    3 · Confirm
                  </h2>
                  <ConfirmPanel
                    lesson={selectedLesson}
                    slot={selectedSlot}
                    onClear={clearSelection}
                    onBooked={clearSelection}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="packages" className="mt-6">
              <div className="mb-5">
                <h2 className="font-display text-2xl text-foreground tracking-wide">
                  LESSON PACKAGES
                </h2>
                <p className="text-sm text-muted-foreground">
                  Pre-buy sessions and save up to 20%. Credits are added to your account
                  immediately and consumed as you book.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {LESSON_PACKAGES.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="bookings" className="mt-6">
              <MyBookings />
            </TabsContent>

            <TabsContent value="more" className="mt-6">
              <InquiryGrid />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default FacilityScheduling;
