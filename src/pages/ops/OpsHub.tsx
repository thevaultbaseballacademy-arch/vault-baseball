import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarDays, Plus, Ban, Search } from "lucide-react";

type Reservation = {
  id: string;
  title: string | null;
  starts_at: string;
  ends_at: string;
  status: string;
  booking_type: string | null;
  coach_user_id: string | null;
  space_id: string | null;
  notes: string | null;
};

const STATUSES = ["pending", "confirmed", "completed", "no_show", "canceled"] as const;
const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  no_show: "No-show",
  canceled: "Canceled",
};

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const OpsHub = () => {
  const { isAdmin, isCoach, userId, isLoading: authLoading } = useStaffAccess();
  const [rows, setRows] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    let q = supabase
      .from("facility_reservations")
      .select("id, title, starts_at, ends_at, status, booking_type, coach_user_id, space_id, notes")
      .gte("starts_at", start.toISOString())
      .lt("starts_at", end.toISOString())
      .order("starts_at", { ascending: true });

    // Coaches see only their own bookings; admins see everything.
    if (!isAdmin && isCoach && userId) {
      q = q.eq("coach_user_id", userId);
    }

    q.then(({ data, error }) => {
      if (error) console.error("[OpsHub] load", error);
      setRows((data ?? []) as Reservation[]);
      setLoading(false);
    });

    // Realtime
    const channel = supabase
      .channel("ops-hub-reservations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "facility_reservations" },
        () => {
          // re-fetch on any change
          q.then(({ data }) => setRows((data ?? []) as Reservation[]));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authLoading, isAdmin, isCoach, userId]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    STATUSES.forEach((s) => (c[s] = 0));
    rows.forEach((r) => {
      const k = (r.status ?? "pending").toLowerCase();
      c[k] = (c[k] ?? 0) + 1;
    });
    return c;
  }, [rows]);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-display tracking-[0.3em] text-primary mb-1">SCHEDULING OS</p>
          <h1 className="text-2xl md:text-3xl font-display">Today</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin ? "All bookings across coaches & spaces." : "Your bookings for today."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/ops/calendar"><CalendarDays className="w-4 h-4 mr-1.5" /> Calendar</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/ops/bookings"><Search className="w-4 h-4 mr-1.5" /> Find booking</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/admin/facility"><Plus className="w-4 h-4 mr-1.5" /> New booking</Link>
          </Button>
          {isAdmin && (
            <Button asChild size="sm" variant="ghost">
              <Link to="/ops/coaches"><Ban className="w-4 h-4 mr-1.5" /> Block time</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Status strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
        {STATUSES.map((s) => (
          <Card key={s} className="bg-card/60">
            <CardContent className="p-3">
              <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground">
                {STATUS_LABEL[s].toUpperCase()}
              </p>
              <p className="text-2xl font-display mt-1">{counts[s]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No bookings today.{" "}
              <Link to="/ops/calendar" className="text-primary hover:underline">Open the calendar</Link>{" "}
              to add one.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((r) => (
                <li key={r.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-20 shrink-0 text-xs font-mono text-muted-foreground">
                    {fmtTime(r.starts_at)}–{fmtTime(r.ends_at)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {r.title || r.booking_type || "Booking"}
                    </p>
                    {r.notes && (
                      <p className="text-xs text-muted-foreground truncate">{r.notes}</p>
                    )}
                  </div>
                  <span className={`text-[10px] font-display tracking-[0.2em] px-2 py-1 rounded ${
                    r.status === "confirmed" ? "bg-primary/15 text-primary" :
                    r.status === "pending" ? "bg-yellow-500/15 text-yellow-500" :
                    r.status === "canceled" ? "bg-destructive/15 text-destructive" :
                    r.status === "no_show" ? "bg-destructive/15 text-destructive" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {(STATUS_LABEL[r.status] || r.status).toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OpsHub;
