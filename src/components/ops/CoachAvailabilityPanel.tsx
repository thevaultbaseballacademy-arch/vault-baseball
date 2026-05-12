import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Plus, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Slot = {
  id: string;
  coach_user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};
type Coach = { user_id: string; full_name: string | null };

export const CoachAvailabilityPanel = () => {
  const { isAdmin, userId } = useStaffAccess();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [day, setDay] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const targetCoach = isAdmin ? selectedCoach : userId ?? "";

  useEffect(() => {
    const loadCoaches = async () => {
      if (!isAdmin) {
        setSelectedCoach(userId ?? "");
        return;
      }
      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "coach" as any);
      const ids = Array.from(new Set((roleRows ?? []).map((r: any) => r.user_id)));
      if (ids.length === 0) { setCoaches([]); return; }
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", ids);
      const byId = new Map((profs ?? []).map((p: any) => [p.user_id, p.full_name]));
      const list = ids.map((id) => ({ user_id: id, full_name: byId.get(id) ?? null }));
      setCoaches(list);
      if (!selectedCoach && list.length > 0) setSelectedCoach(list[0].user_id);
    };
    loadCoaches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, userId]);

  useEffect(() => {
    const load = async () => {
      if (!targetCoach) { setSlots([]); setLoading(false); return; }
      setLoading(true);
      const { data, error } = await supabase
        .from("coach_availability")
        .select("*")
        .eq("coach_user_id", targetCoach)
        .order("day_of_week")
        .order("start_time");
      if (error) toast.error("Couldn't load availability");
      setSlots((data ?? []) as Slot[]);
      setLoading(false);
    };
    load();
  }, [targetCoach]);

  const grouped = useMemo(() => {
    const m = new Map<number, Slot[]>();
    slots.forEach((s) => {
      const arr = m.get(s.day_of_week) ?? [];
      arr.push(s);
      m.set(s.day_of_week, arr);
    });
    return m;
  }, [slots]);

  const toggle = async (s: Slot, next: boolean) => {
    setSlots((arr) => arr.map((x) => (x.id === s.id ? { ...x, is_active: next } : x)));
    const { error } = await supabase.from("coach_availability").update({ is_active: next }).eq("id", s.id);
    if (error) {
      toast.error(error.message);
      setSlots((arr) => arr.map((x) => (x.id === s.id ? { ...x, is_active: !next } : x)));
    }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("coach_availability").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setSlots((arr) => arr.filter((s) => s.id !== id));
    toast.success("Slot removed");
  };

  const submit = async () => {
    if (!targetCoach) return;
    if (endTime <= startTime) { toast.error("End must be after start"); return; }
    setSaving(true);
    const { data, error } = await supabase
      .from("coach_availability")
      .insert({
        coach_user_id: targetCoach,
        day_of_week: Number(day),
        start_time: startTime,
        end_time: endTime,
        is_active: true,
      })
      .select()
      .single();
    setSaving(false);
    if (error) return toast.error(error.message);
    setSlots((arr) => [...arr, data as Slot]);
    setOpen(false);
    toast.success("Slot added");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="w-4 h-4" /> Weekly Availability
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Recurring weekly slots when this coach can be booked.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={!targetCoach}><Plus className="w-4 h-4 mr-1" /> Add slot</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New availability slot</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Day of week</Label>
                <Select value={day} onValueChange={setDay}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Start</Label>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div>
                  <Label>End</Label>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {isAdmin && coaches.length > 0 && (
          <div className="max-w-xs">
            <Label className="text-xs">Coach</Label>
            <Select value={selectedCoach} onValueChange={setSelectedCoach}>
              <SelectTrigger><SelectValue placeholder="Select coach" /></SelectTrigger>
              <SelectContent>
                {coaches.map((c) => (
                  <SelectItem key={c.user_id} value={c.user_id}>
                    {c.full_name || c.user_id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground py-4">Loading…</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No slots configured yet.</p>
        ) : (
          <div className="space-y-3">
            {DAYS.map((dayName, i) => {
              const daySlots = grouped.get(i) ?? [];
              if (daySlots.length === 0) return null;
              return (
                <div key={i}>
                  <p className="text-[11px] font-display tracking-[0.2em] text-muted-foreground mb-1">{dayName.toUpperCase()}</p>
                  <div className="divide-y divide-border border border-border rounded-md">
                    {daySlots.map((s) => (
                      <div key={s.id} className="px-3 py-2 flex items-center justify-between gap-3">
                        <div className="text-sm">
                          {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}
                          {!s.is_active && <span className="text-xs text-muted-foreground ml-2">(off)</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={s.is_active} onCheckedChange={(v) => toggle(s, v)} />
                          <Button size="icon" variant="ghost" onClick={() => remove(s.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
