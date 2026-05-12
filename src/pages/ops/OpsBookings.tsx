import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Row = {
  id: string;
  title: string | null;
  starts_at: string;
  ends_at: string;
  status: string;
  booking_type: string | null;
  coach_user_id: string | null;
  notes: string | null;
};

const STATUSES = ["all", "pending", "confirmed", "completed", "no_show", "canceled"] as const;

const fmt = (iso: string) =>
  new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

const OpsBookings = () => {
  const { isAdmin, isCoach, userId, isLoading: authLoading } = useStaffAccess();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");

  useEffect(() => {
    if (authLoading) return;
    let req = supabase
      .from("facility_reservations")
      .select("id, title, starts_at, ends_at, status, booking_type, coach_user_id, notes")
      .order("starts_at", { ascending: false })
      .limit(200);
    if (!isAdmin && isCoach && userId) req = req.eq("coach_user_id", userId);
    if (status !== "all") req = req.eq("status", status);
    req.then(({ data, error }) => {
      if (error) console.error("[OpsBookings]", error);
      setRows((data ?? []) as Row[]);
      setLoading(false);
    });
  }, [authLoading, isAdmin, isCoach, userId, status]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        (r.title ?? "").toLowerCase().includes(needle) ||
        (r.notes ?? "").toLowerCase().includes(needle) ||
        (r.booking_type ?? "").toLowerCase().includes(needle),
    );
  }, [rows, q]);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-6xl mx-auto">
      <p className="text-[11px] font-display tracking-[0.3em] text-primary mb-1">SCHEDULING OS</p>
      <h1 className="text-2xl md:text-3xl font-display mb-1">Bookings</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Search and filter all {isAdmin ? "" : "your "}reservations.
      </p>

      <div className="flex gap-2 mb-4 flex-wrap">
        <Input
          placeholder="Search title, notes, type…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={status === s ? "default" : "outline"}
              onClick={() => setStatus(s)}
              className="capitalize"
            >
              {s.replace("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">No bookings match.</div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((r) => (
                <li key={r.id} className="px-4 py-3 grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-4 md:col-span-3 text-xs font-mono text-muted-foreground">{fmt(r.starts_at)}</div>
                  <div className="col-span-5 md:col-span-6 text-sm truncate">{r.title || r.booking_type || "Booking"}</div>
                  <div className="col-span-3 text-right text-[10px] font-display tracking-[0.2em] text-muted-foreground uppercase">
                    {r.status}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OpsBookings;
