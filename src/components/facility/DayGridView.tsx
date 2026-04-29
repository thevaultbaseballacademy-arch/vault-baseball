import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFacilitySpaces, useFacilityReservations, useFacilitySettings, FacilityReservation } from "@/hooks/useFacilitySchedule";
import { useFacilityReservationsRealtime } from "@/hooks/useFacilityReservationsRealtime";
import { ReservationDialog } from "./ReservationDialog";

export const DayGridView = () => {
  useFacilityReservationsRealtime();
  const { data: spaces = [] } = useFacilitySpaces();
  const { data: settings } = useFacilitySettings();
  const slot = settings?.slot_size_minutes ?? 30;

  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const dayStart = new Date(date); dayStart.setHours(6, 0, 0, 0);
  const dayEnd = new Date(date); dayEnd.setHours(23, 0, 0, 0);

  const { data: reservations = [] } = useFacilityReservations(dayStart.toISOString(), dayEnd.toISOString());

  const slots = useMemo(() => {
    const arr: Date[] = [];
    let t = new Date(dayStart);
    while (t < dayEnd) {
      arr.push(new Date(t));
      t = new Date(t.getTime() + slot * 60000);
    }
    return arr;
  }, [date, slot]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<FacilityReservation> | null>(null);
  const [defaultSpace, setDefaultSpace] = useState<string | undefined>();
  const [defaultStart, setDefaultStart] = useState<Date | undefined>();

  const openCreate = (spaceId: string, start: Date) => {
    setEditing(null);
    setDefaultSpace(spaceId);
    setDefaultStart(start);
    setOpen(true);
  };

  const openEdit = (r: FacilityReservation) => {
    setEditing(r);
    setDefaultSpace(undefined);
    setDefaultStart(undefined);
    setOpen(true);
  };

  const dateLabel = date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" });

  const shift = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d);
  };

  const activeSpaces = spaces.filter((s) => s.is_active);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={() => shift(-1)}><ChevronLeft className="w-4 h-4" /></Button>
          <h2 className="text-lg font-display text-foreground min-w-[220px] text-center">{dateLabel}</h2>
          <Button size="icon" variant="outline" onClick={() => shift(1)}><ChevronRight className="w-4 h-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => { const d = new Date(); d.setHours(0,0,0,0); setDate(d); }}>Today</Button>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setDefaultSpace(activeSpaces[0]?.id); setDefaultStart(new Date()); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> New Booking
        </Button>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-auto">
        <div className="min-w-fit">
          {/* Header row */}
          <div className="flex sticky top-0 bg-card z-10 border-b border-border">
            <div className="w-20 shrink-0 border-r border-border px-2 py-2 text-[10px] uppercase font-display text-muted-foreground">Time</div>
            {activeSpaces.map((s) => (
              <div key={s.id} className="w-32 shrink-0 border-r border-border px-2 py-2 text-xs font-medium" style={{ borderTop: `3px solid ${s.color}` }}>
                <div className="truncate">{s.name}</div>
                <div className="text-[10px] text-muted-foreground">{s.space_type}</div>
              </div>
            ))}
          </div>

          {/* Slots */}
          {slots.map((slotStart) => {
            const slotEnd = new Date(slotStart.getTime() + slot * 60000);
            const label = slotStart.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
            return (
              <div key={slotStart.toISOString()} className="flex border-b border-border/50">
                <div className="w-20 shrink-0 border-r border-border px-2 py-1 text-[10px] text-muted-foreground">{label}</div>
                {activeSpaces.map((s) => {
                  const r = reservations.find((rv) =>
                    rv.space_id === s.id &&
                    new Date(rv.starts_at) < slotEnd &&
                    new Date(rv.ends_at) > slotStart
                  );
                  const isStart = r && new Date(r.starts_at).getTime() === slotStart.getTime();
                  return (
                    <div
                      key={s.id}
                      className="w-32 shrink-0 border-r border-border h-10 relative cursor-pointer hover:bg-muted/40"
                      onClick={() => r ? openEdit(r) : openCreate(s.id, slotStart)}
                    >
                      {r && isStart && (
                        <div
                          className="absolute inset-x-0.5 rounded-md p-1 text-[10px] text-white shadow-sm overflow-hidden"
                          style={{
                            top: 2,
                            height: ((new Date(r.ends_at).getTime() - new Date(r.starts_at).getTime()) / 60000 / slot) * 40 - 4,
                            background: r.color || s.color,
                          }}
                        >
                          <div className="font-semibold truncate">{r.title}</div>
                          {r.reserved_for && <div className="opacity-90 truncate">{r.reserved_for}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <ReservationDialog
        open={open}
        onOpenChange={setOpen}
        reservation={editing}
        spaces={activeSpaces}
        defaultSpaceId={defaultSpace}
        defaultStart={defaultStart}
      />
    </div>
  );
};
