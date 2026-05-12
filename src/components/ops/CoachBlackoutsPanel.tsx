import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarOff, Plus, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Blackout = {
  id: string;
  coach_user_id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
};
type Coach = { user_id: string; full_name: string | null };

export const CoachBlackoutsPanel = () => {
  const { isAdmin, userId, isCoach } = useStaffAccess();
  const [rows, setRows] = useState<Blackout[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [coachId, setCoachId] = useState<string>("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [reason, setReason] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("coach_blackouts")
      .select("id, coach_user_id, starts_at, ends_at, reason")
      .order("starts_at", { ascending: false })
      .limit(100);
    if (error) toast.error("Couldn't load blackouts");
    setRows((data ?? []) as Blackout[]);
    setLoading(false);
  };

  const loadCoaches = async () => {
    if (!isAdmin) return;
    const { data } = await supabase
      .from("user_roles")
      .select("user_id, profiles:user_id(full_name)")
      .eq("role", "coach" as any);
    const list: Coach[] = (data ?? []).map((r: any) => ({
      user_id: r.user_id,
      full_name: r.profiles?.full_name ?? null,
    }));
    setCoaches(list);
  };

  useEffect(() => {
    load();
    loadCoaches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const coachLabel = (id: string) =>
    coaches.find((c) => c.user_id === id)?.full_name || (id === userId ? "You" : id.slice(0, 8));

  const submit = async () => {
    const targetCoach = isAdmin ? coachId : userId;
    if (!targetCoach || !startsAt || !endsAt) {
      toast.error("Coach, start, and end are required");
      return;
    }
    if (new Date(endsAt) <= new Date(startsAt)) {
      toast.error("End must be after start");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("coach_blackouts").insert({
      coach_user_id: targetCoach,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      reason: reason || null,
      created_by: userId,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Blackout added");
    setOpen(false);
    setStartsAt(""); setEndsAt(""); setReason(""); setCoachId("");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("coach_blackouts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    setRows((r) => r.filter((x) => x.id !== id));
  };

  if (!isAdmin && !isCoach) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarOff className="w-4 h-4" /> Coach Blackouts
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Time-off windows that block new bookings (enforced by the conflict check).
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New blackout window</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {isAdmin && (
                <div>
                  <Label>Coach</Label>
                  <Select value={coachId} onValueChange={setCoachId}>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Starts</Label>
                  <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
                </div>
                <div>
                  <Label>Ends</Label>
                  <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Reason (optional)</Label>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
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
      <CardContent className="pt-0">
        {loading ? (
          <p className="text-sm text-muted-foreground py-4">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No blackouts on file.</p>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((b) => (
              <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {isAdmin ? coachLabel(b.coach_user_id) : "You"}
                    {b.reason ? <span className="text-muted-foreground"> — {b.reason}</span> : null}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(b.starts_at), "MMM d, h:mm a")} → {format(new Date(b.ends_at), "MMM d, h:mm a")}
                  </div>
                </div>
                {(isAdmin || b.coach_user_id === userId) && (
                  <Button size="icon" variant="ghost" onClick={() => remove(b.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
