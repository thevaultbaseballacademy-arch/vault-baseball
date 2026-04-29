import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpsertSpace, useDeleteSpace, FacilitySpace } from "@/hooks/useFacilitySchedule";
import { useSpaceTypes, type SpaceType } from "@/hooks/useSpaceTypes";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const FALLBACK_SPACE_TYPES = ["Cage", "Mound", "Turf", "Bullpen", "Strength", "Field", "Classroom", "General"];
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
  const { data: spaceTypes = [] } = useSpaceTypes();

  const isNew = !space?.id;
  const isTypeless = !!space?.id && !space?.type_id;
  // Phase 2: new spaces start at the type picker. Existing spaces skip straight
  // to the form (don't disturb anyone's pre-Phase 2 setup).
  const [step, setStep] = useState<"picker" | "form">(isNew ? "picker" : "form");
  const [form, setForm] = useState<Partial<FacilitySpace>>({});
  // Per-session dismiss for the typeless soft prompt — re-appears on next edit.
  const [typelessDismissed, setTypelessDismissed] = useState(false);

  useEffect(() => {
    setStep(space?.id ? "form" : "picker");
    setForm(space ?? { name: "", space_type: "Cage", capacity: 1, color: COLORS[0], grid_w: 2, grid_h: 2, is_active: true });
    setTypelessDismissed(false);
  }, [space, open]);


  const pickType = (t: SpaceType) => {
    setForm((f) => ({
      ...f,
      type_id: t.id,
      space_type: t.name,
      capacity: t.default_capacity,
      color: t.color,
      // Default a sensible footprint based on capacity, but let admin override.
      grid_w: f.grid_w ?? 2,
      grid_h: f.grid_h ?? 2,
      name: f.name || t.name,
      is_active: true,
    }));
    setStep("form");
  };

  const save = async () => {
    if (!form.name) return;
    await upsert.mutateAsync(form);
    onOpenChange(false);
  };

  const typeOptions = spaceTypes.length
    ? spaceTypes.map((t) => t.name)
    : FALLBACK_SPACE_TYPES;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "form" && isNew && (
              <button
                type="button"
                onClick={() => setStep("picker")}
                className="p-1 -ml-1 rounded hover:bg-muted"
                aria-label="Back to type picker"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {step === "picker" ? "Choose a space type" : form.id ? "Edit Space" : "New Space"}
          </DialogTitle>
        </DialogHeader>

        {step === "picker" ? (
          <div className="grid grid-cols-3 gap-2 py-2">
            {spaceTypes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => pickType(t)}
                className={cn(
                  "rounded-lg border border-border bg-card p-3 text-center hover:border-primary hover:bg-muted/50 transition-colors min-h-[88px] flex flex-col items-center justify-center gap-1",
                )}
                style={{ borderTopColor: t.color, borderTopWidth: 3 }}
              >
                <span className="text-2xl leading-none">{t.icon}</span>
                <span className="text-xs font-medium leading-tight">{t.name}</span>
              </button>
            ))}
            {spaceTypes.length === 0 && (
              <p className="col-span-3 text-xs text-muted-foreground text-center py-4">
                Loading templates…
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {isTypeless && !form.type_id && !typelessDismissed && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs space-y-2">
                  <p className="text-foreground">
                    This space doesn't have a type assigned. Want to pick one?
                    It helps with filtering, reports, and quick booking templates.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="default" onClick={() => setStep("picker")}>
                      Pick a Type
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setTypelessDismissed(true)}>
                      Not now
                    </Button>
                  </div>
                </div>
              )}

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
                      {typeOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
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
                <div className="flex gap-2 mt-1.5 flex-wrap">
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
