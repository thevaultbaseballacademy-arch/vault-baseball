import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFacilitySpaces, useFacilityReservations, FacilityReservation } from "@/hooks/useFacilitySchedule";
import { RealtimeStatusBadge } from "./RealtimeStatusBadge";
import { ReservationDialog } from "./ReservationDialog";

export const WeekView = () => {

  const { data: spaces = [] } = useFacilitySpaces();
  const activeSpaces = spaces.filter((s) => s.is_active);
  const [spaceId, setSpaceId] = useState<string | undefined>();

  const selected = spaceId ?? activeSpaces[0]?.id;

  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
  });

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const rangeStart = days[0].toISOString();
  const rangeEnd = new Date(days[6].getTime() + 24 * 60 * 60000).toISOString();
  const { data: reservations = [] } = useFacilityReservations(rangeStart, rangeEnd);

  const filtered = reservations.filter((r) => !selected || r.space_id === selected);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<FacilityReservation> | null>(null);

  const shiftWeek = (n: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + n * 7);
    setWeekStart(d);
  };

  const weekLabel = `${days[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${days[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={() => shiftWeek(-1)}><ChevronLeft className="w-4 h-4" /></Button>
          <h2 className="text-lg font-display text-foreground min-w-[180px] text-center">{weekLabel}</h2>
          <Button size="icon" variant="outline" onClick={() => shiftWeek(1)}><ChevronRight className="w-4 h-4" /></Button>
        </div>
        <div className="flex items-center gap-2">
          <RealtimeStatusBadge />
          <Select value={selected} onValueChange={setSpaceId}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select space" /></SelectTrigger>
            <SelectContent>
              {activeSpaces.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const dayRes = filtered.filter((r) => {
            const rd = new Date(r.starts_at);
            return rd.toDateString() === d.toDateString();
          }).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
          const isToday = d.toDateString() === new Date().toDateString();
          return (
            <div key={d.toISOString()} className={`border border-border rounded-lg bg-card p-2 min-h-[180px] ${isToday ? "ring-1 ring-primary" : ""}`}>
              <div className="text-[10px] uppercase font-display text-muted-foreground">{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
              <div className="text-lg font-display text-foreground mb-2">{d.getDate()}</div>
              <div className="space-y-1">
                {dayRes.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setEditing(r); setOpen(true); }}
                    className="w-full text-left rounded-md p-1.5 text-[10px] text-white hover:opacity-90"
                    style={{ background: r.color || activeSpaces.find((s) => s.id === r.space_id)?.color || "hsl(var(--primary))" }}
                  >
                    <div className="font-semibold truncate">{r.title}</div>
                    <div className="opacity-90">{new Date(r.starts_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</div>
                  </button>
                ))}
                {dayRes.length === 0 && <div className="text-[10px] text-muted-foreground italic">Open</div>}
              </div>
            </div>
          );
        })}
      </div>

      <ReservationDialog open={open} onOpenChange={setOpen} reservation={editing} spaces={activeSpaces} />
    </div>
  );
};
