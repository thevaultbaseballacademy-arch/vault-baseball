import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpsertSpace, useDeleteSpace, FacilitySpace } from "@/hooks/useFacilitySchedule";

const SPACE_TYPES = ["Cage", "Mound", "Turf", "Bullpen", "Strength", "Field", "Classroom", "General"];
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

export const SpaceFormDialog = ({
  open,
  onOpenChange,
  space,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  space: Partial<FacilitySpace> | null;
}) => {
  const upsert = useUpsertSpace();
  const del = useDeleteSpace();
  const [form, setForm] = useState<Partial<FacilitySpace>>({});

  useEffect(() => {
    setForm(space ?? { name: "", space_type: "Cage", capacity: 1, color: COLORS[0], grid_w: 2, grid_h: 2, is_active: true });
  }, [space, open]);

  const save = async () => {
    if (!form.name) return;
    await upsert.mutateAsync(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit Space" : "New Space"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cage 1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={form.space_type} onValueChange={(v) => setForm({ ...form, space_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SPACE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Capacity</Label>
              <Input type="number" min={1} value={form.capacity ?? 1} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 1 })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Width (grid)</Label>
              <Input type="number" min={1} max={12} value={form.grid_w ?? 2} onChange={(e) => setForm({ ...form, grid_w: parseInt(e.target.value) || 2 })} />
            </div>
            <div>
              <Label>Height (grid)</Label>
              <Input type="number" min={1} max={12} value={form.grid_h ?? 2} onChange={(e) => setForm({ ...form, grid_h: parseInt(e.target.value) || 2 })} />
            </div>
          </div>
          <div>
            <Label>Color</Label>
            <div className="flex gap-2 mt-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full border-2 ${form.color === c ? "border-foreground" : "border-transparent"}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <Label>Zone (optional)</Label>
            <Input value={form.zone ?? ""} onChange={(e) => setForm({ ...form, zone: e.target.value })} placeholder="Hitting" />
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
