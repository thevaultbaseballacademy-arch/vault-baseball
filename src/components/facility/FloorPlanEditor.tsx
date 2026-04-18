import { useState } from "react";
import { Plus, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFacilitySpaces, FacilitySpace } from "@/hooks/useFacilitySchedule";
import { SpaceFormDialog } from "./SpaceFormDialog";

const GRID_COLS = 12;
const CELL = 48; // px per grid unit

export const FloorPlanEditor = () => {
  const { data: spaces = [] } = useFacilitySpaces();
  const [editing, setEditing] = useState<Partial<FacilitySpace> | null>(null);
  const [open, setOpen] = useState(false);

  const openEdit = (s: Partial<FacilitySpace> | null) => {
    setEditing(s);
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-display text-foreground">FLOOR PLAN</h2>
          <p className="text-xs text-muted-foreground">Click a space to edit. Add new spaces and arrange layout.</p>
        </div>
        <Button size="sm" onClick={() => openEdit(null)}>
          <Plus className="w-4 h-4 mr-1" /> Add Space
        </Button>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-auto p-4">
        <div
          className="relative bg-muted/30 rounded-lg"
          style={{
            width: GRID_COLS * CELL,
            minHeight: 8 * CELL,
            backgroundImage:
              `linear-gradient(to right, hsl(var(--border) / 0.5) 1px, transparent 1px),
               linear-gradient(to bottom, hsl(var(--border) / 0.5) 1px, transparent 1px)`,
            backgroundSize: `${CELL}px ${CELL}px`,
          }}
        >
          {spaces.map((s) => (
            <button
              key={s.id}
              onClick={() => openEdit(s)}
              className="absolute rounded-md p-2 text-left text-xs font-medium text-white shadow-md hover:ring-2 hover:ring-foreground transition-all overflow-hidden"
              style={{
                left: s.grid_x * CELL,
                top: s.grid_y * CELL,
                width: s.grid_w * CELL - 4,
                height: s.grid_h * CELL - 4,
                background: s.color,
                opacity: s.is_active ? 1 : 0.4,
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold truncate">{s.name}</div>
                  <div className="text-[10px] opacity-90">{s.space_type}</div>
                </div>
                <Edit3 className="w-3 h-3 opacity-70 shrink-0" />
              </div>
              <div className="text-[10px] opacity-90 mt-1">Cap {s.capacity}</div>
            </button>
          ))}
          {spaces.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              No spaces yet — click "Add Space" to start.
            </div>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">Tip: edit a space to change its grid position (X/Y) and size.</p>
      </div>

      <SpaceFormDialog open={open} onOpenChange={setOpen} space={editing} />
    </div>
  );
};
