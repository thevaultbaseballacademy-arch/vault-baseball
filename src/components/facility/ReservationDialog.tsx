import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpsertReservation, useDeleteReservation, FacilityReservation, FacilitySpace } from "@/hooks/useFacilitySchedule";

const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
};

export const ReservationDialog = ({
  open,
  onOpenChange,
  reservation,
  spaces,
  defaultSpaceId,
  defaultStart,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  reservation: Partial<FacilityReservation> | null;
  spaces: FacilitySpace[];
  defaultSpaceId?: string;
  defaultStart?: Date;
}) => {
  const upsert = useUpsertReservation();
  const del = useDeleteReservation();
  const [form, setForm] = useState<Partial<FacilityReservation>>({});

  useEffect(() => {
    if (reservation?.id) {
      setForm(reservation);
    } else {
      const start = defaultStart ?? new Date();
      const end = new Date(start.getTime() + 60 * 60000);
      setForm({
        space_id: defaultSpaceId ?? spaces[0]?.id,
        title: "",
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        status: "confirmed",
        attendee_count: 1,
      });
    }
  }, [reservation, open, defaultSpaceId, defaultStart, spaces]);

  const save = async () => {
    if (!form.title || !form.space_id) return;
    await upsert.mutateAsync(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit Reservation" : "New Reservation"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Lesson with Eddie" />
          </div>
          <div>
            <Label>Space</Label>
            <Select value={form.space_id} onValueChange={(v) => setForm({ ...form, space_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select space" /></SelectTrigger>
              <SelectContent>
                {spaces.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Starts</Label>
              <Input
                type="datetime-local"
                value={form.starts_at ? toLocalInput(form.starts_at) : ""}
                onChange={(e) => setForm({ ...form, starts_at: new Date(e.target.value).toISOString() })}
              />
            </div>
            <div>
              <Label>Ends</Label>
              <Input
                type="datetime-local"
                value={form.ends_at ? toLocalInput(form.ends_at) : ""}
                onChange={(e) => setForm({ ...form, ends_at: new Date(e.target.value).toISOString() })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Reserved for</Label>
              <Input value={form.reserved_for ?? ""} onChange={(e) => setForm({ ...form, reserved_for: e.target.value })} placeholder="Athlete / Team" />
            </div>
            <div>
              <Label>Attendees</Label>
              <Input type="number" min={1} value={form.attendee_count ?? 1} onChange={(e) => setForm({ ...form, attendee_count: parseInt(e.target.value) || 1 })} />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          {form.id && (
            <Button variant="destructive" onClick={async () => { await del.mutateAsync(form.id!); onOpenChange(false); }}>
              Delete
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={save} disabled={upsert.isPending}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
