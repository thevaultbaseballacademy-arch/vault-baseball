import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { useSchedulingOps } from "@/hooks/useSchedulingOps";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { Loader2, Clock, MapPin, User, History } from "lucide-react";

type Row = {
  id: string;
  title: string | null;
  starts_at: string;
  ends_at: string;
  status: string;
  booking_type: string | null;
  coach_user_id: string | null;
  space_id: string | null;
  notes: string | null;
  internal_notes: string | null;
  created_by: string | null;
  cancellation_reason: string | null;
};

type AuditEntry = {
  id: string;
  action: string;
  actor_user_id: string | null;
  actor_role: string | null;
  reason: string | null;
  created_at: string;
};

const STATUSES = ["all", "pending", "confirmed", "completed", "no_show", "cancelled"] as const;

const fmt = (iso: string) =>
  new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

const statusTone = (s: string) =>
  s === "cancelled" ? "outline"
  : s === "completed" ? "secondary"
  : s === "no_show" ? "destructive"
  : "default";

const OpsBookings = () => {
  const { isAdmin, isCoach, userId, isLoading: authLoading } = useStaffAccess();
  const { cancel, pending: cancelling } = useSchedulingOps();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");

  const [selected, setSelected] = useState<Row | null>(null);
  const [spaces, setSpaces] = useState<Map<string, string>>(new Map());
  const [coaches, setCoaches] = useState<Map<string, string>>(new Map());
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const load = async () => {
    setLoading(true);
    let req = supabase
      .from("facility_reservations")
      .select("id, title, starts_at, ends_at, status, booking_type, coach_user_id, space_id, notes, internal_notes, created_by, cancellation_reason")
      .order("starts_at", { ascending: false })
      .limit(200);
    if (!isAdmin && isCoach && userId) req = req.eq("coach_user_id", userId);
    if (status !== "all") req = req.eq("status", status);
    const { data, error } = await req;
    if (error) console.error("[OpsBookings]", error);
    setRows((data ?? []) as Row[]);
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAdmin, isCoach, userId, status]);

  // Resolve space + coach names
  useEffect(() => {
    const spaceIds = Array.from(new Set(rows.map((r) => r.space_id).filter(Boolean) as string[]));
    const coachIds = Array.from(new Set(rows.map((r) => r.coach_user_id).filter(Boolean) as string[]));
    if (spaceIds.length) {
      supabase.from("facility_spaces").select("id, name").in("id", spaceIds).then(({ data }) => {
        setSpaces(new Map((data ?? []).map((s: any) => [s.id, s.name])));
      });
    }
    if (coachIds.length) {
      supabase.from("profiles").select("user_id, full_name").in("user_id", coachIds).then(({ data }) => {
        setCoaches(new Map((data ?? []).map((p: any) => [p.user_id, p.full_name])));
      });
    }
  }, [rows]);

  const openRow = async (r: Row) => {
    setSelected(r);
    setCancelReason("");
    if (!isAdmin) { setAudit([]); return; }
    setAuditLoading(true);
    const { data } = await supabase
      .from("scheduling_audit_log")
      .select("id, action, actor_user_id, actor_role, reason, created_at")
      .eq("reservation_id", r.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setAudit((data ?? []) as AuditEntry[]);
    setAuditLoading(false);
  };

  const onCancel = async () => {
    if (!selected) return;
    const res = await cancel(selected.id, cancelReason || undefined);
    if (res.ok) {
      setSelected(null);
      load();
    }
  };

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
        {isAdmin ? "All reservations across coaches and spaces." : "Your reservations."}
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
                <li
                  key={r.id}
                  onClick={() => openRow(r)}
                  className="px-4 py-3 grid grid-cols-12 gap-3 items-center cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <div className="col-span-4 md:col-span-3 text-xs font-mono text-muted-foreground">{fmt(r.starts_at)}</div>
                  <div className="col-span-5 md:col-span-6 min-w-0">
                    <div className="text-sm truncate">{r.title || r.booking_type || "Booking"}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {[
                        r.space_id ? spaces.get(r.space_id) : null,
                        r.coach_user_id ? coaches.get(r.coach_user_id) : null,
                      ].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </div>
                  <div className="col-span-3 text-right">
                    <Badge variant={statusTone(r.status) as any} className="capitalize text-[10px]">
                      {r.status.replace("_", " ")}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-left">{selected.title || "Booking"}</SheetTitle>
                <SheetDescription className="text-left">
                  <Badge variant={statusTone(selected.status) as any} className="capitalize text-[10px] mr-2">
                    {selected.status.replace("_", " ")}
                  </Badge>
                  {selected.booking_type && (
                    <span className="text-[10px] font-display tracking-[0.2em] text-muted-foreground uppercase">
                      {selected.booking_type.replace(/_/g, " ")}
                    </span>
                  )}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 mt-4 text-sm">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <div>{format(new Date(selected.starts_at), "PPP")}</div>
                    <div className="text-muted-foreground text-xs">
                      {format(new Date(selected.starts_at), "p")} – {format(new Date(selected.ends_at), "p")}
                    </div>
                  </div>
                </div>
                {selected.space_id && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {spaces.get(selected.space_id) || "Space"}
                  </div>
                )}
                {selected.coach_user_id && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {coaches.get(selected.coach_user_id) || "Coach"}
                  </div>
                )}
                {selected.notes && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Notes</Label>
                    <p className="whitespace-pre-wrap">{selected.notes}</p>
                  </div>
                )}
                {isAdmin && selected.internal_notes && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Internal notes</Label>
                    <p className="whitespace-pre-wrap text-muted-foreground">{selected.internal_notes}</p>
                  </div>
                )}
                {selected.cancellation_reason && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Cancellation reason</Label>
                    <p>{selected.cancellation_reason}</p>
                  </div>
                )}

                {selected.status !== "cancelled" && (
                  <div className="border-t border-border pt-4 space-y-2">
                    <Label className="text-xs">Cancel this booking</Label>
                    <Textarea
                      rows={2}
                      placeholder="Reason (optional)"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={cancelling}
                      onClick={onCancel}
                      className="w-full"
                    >
                      {cancelling && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                      Cancel booking
                    </Button>
                  </div>
                )}

                {isAdmin && (
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center gap-2 mb-2 text-xs font-display tracking-[0.2em] text-muted-foreground uppercase">
                      <History className="w-3.5 h-3.5" /> Audit history
                    </div>
                    {auditLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    ) : audit.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No audit entries.</p>
                    ) : (
                      <ul className="space-y-2">
                        {audit.map((a) => (
                          <li key={a.id} className="text-xs border-l-2 border-border pl-2">
                            <div className="capitalize">
                              <span className="font-medium">{a.action}</span>
                              {a.actor_role ? ` · ${a.actor_role}` : ""}
                            </div>
                            <div className="text-muted-foreground">
                              {format(new Date(a.created_at), "MMM d, p")}
                              {a.reason ? ` — ${a.reason}` : ""}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <SheetFooter className="mt-6">
                <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default OpsBookings;
