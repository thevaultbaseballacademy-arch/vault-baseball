import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  type DragEndEvent,
  type DragMoveEvent,
} from "@dnd-kit/core";
import { Plus, Edit3, Undo2, Redo2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useFacilitySpaces,
  useUpdateSpacePosition,
  type FacilitySpace,
} from "@/hooks/useFacilitySchedule";
import { SpaceFormDialog } from "./SpaceFormDialog";
import { cn } from "@/lib/utils";

const GRID_COLS = 12;
const GRID_ROWS = 12;
const CELL = 56;

type Rect = { x: number; y: number; w: number; h: number };

const rectsOverlap = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

const isInBounds = (r: Rect) =>
  r.x >= 0 && r.y >= 0 && r.x + r.w <= GRID_COLS && r.y + r.h <= GRID_ROWS;

const findFirstOpenCell = (
  spaces: FacilitySpace[],
  w: number,
  h: number,
): { x: number; y: number } => {
  for (let y = 0; y <= GRID_ROWS - h; y++) {
    for (let x = 0; x <= GRID_COLS - w; x++) {
      const candidate = { x, y, w, h };
      const collides = spaces.some((s) =>
        rectsOverlap(candidate, { x: s.grid_x, y: s.grid_y, w: s.grid_w, h: s.grid_h }),
      );
      if (!collides) return { x, y };
    }
  }
  return { x: 0, y: 0 };
};

interface DraggableSpaceProps {
  space: FacilitySpace;
  invalid: boolean;
  onEdit: () => void;
}

const DraggableSpace = ({ space, invalid, onEdit }: DraggableSpaceProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: space.id,
  });

  const style: React.CSSProperties = {
    left: space.grid_x * CELL,
    top: space.grid_y * CELL,
    width: space.grid_w * CELL - 4,
    height: space.grid_h * CELL - 4,
    background: space.color,
    opacity: space.is_active ? (isDragging ? 0.85 : 1) : 0.4,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 30 : 1,
    touchAction: "none",
    boxShadow: isDragging
      ? "0 12px 28px hsl(0 0% 0% / 0.5)"
      : "0 2px 8px hsl(0 0% 0% / 0.25)",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "absolute rounded-md p-2 text-left text-xs font-medium text-white select-none cursor-grab active:cursor-grabbing transition-shadow",
        "ring-2 ring-transparent",
        invalid && "ring-destructive animate-pulse",
        !invalid && isDragging && "ring-foreground/60",
      )}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start justify-between gap-1 h-full">
        <div className="min-w-0 flex-1">
          <div className="font-bold leading-tight break-words" title={space.name}>
            {space.name}
          </div>
          <div className="text-[10px] opacity-90 capitalize">{space.space_type}</div>
          <div className="text-[10px] opacity-90 mt-0.5">Capacity {space.capacity}</div>
        </div>
        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="shrink-0 p-1 rounded hover:bg-black/20 active:bg-black/30 -m-1"
          aria-label={`Edit ${space.name}`}
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

type HistoryEntry = { id: string; from: Rect; to: Rect };

export const FloorPlanEditor = () => {
  const { data: spaces = [] } = useFacilitySpaces();
  const updatePos = useUpdateSpacePosition();

  const [editing, setEditing] = useState<Partial<FacilitySpace> | null>(null);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewCell, setPreviewCell] = useState<{ x: number; y: number } | null>(null);
  const [collision, setCollision] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [savedLabel, setSavedLabel] = useState<string>("");

  const undoStack = useRef<HistoryEntry[]>([]);
  const redoStack = useRef<HistoryEntry[]>([]);
  const [, forceRender] = useState(0);

  // Sensors tuned for both touch and mouse with a small activation distance to
  // avoid hijacking taps on the edit button.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
  );

  const activeSpace = useMemo(
    () => spaces.find((s) => s.id === activeId) || null,
    [spaces, activeId],
  );

  const otherSpaces = useMemo(
    () => spaces.filter((s) => s.id !== activeId),
    [spaces, activeId],
  );

  // "Saved Xs ago" label
  useEffect(() => {
    if (!savedAt) return;
    const update = () => {
      const secs = Math.max(0, Math.round((Date.now() - savedAt) / 1000));
      setSavedLabel(secs < 5 ? "Saved just now" : `Saved ${secs}s ago`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [savedAt]);

  const computeTargetCell = (e: DragMoveEvent | DragEndEvent) => {
    if (!activeSpace) return null;
    const dx = Math.round(e.delta.x / CELL);
    const dy = Math.round(e.delta.y / CELL);
    const x = Math.max(0, Math.min(GRID_COLS - activeSpace.grid_w, activeSpace.grid_x + dx));
    const y = Math.max(0, Math.min(GRID_ROWS - activeSpace.grid_h, activeSpace.grid_y + dy));
    return { x, y };
  };

  const handleDragStart = (event: { active: { id: string | number } }) => {
    setActiveId(String(event.active.id));
    setCollision(false);
    setPreviewCell(null);
  };

  const handleDragMove = (e: DragMoveEvent) => {
    if (!activeSpace) return;
    const cell = computeTargetCell(e);
    if (!cell) return;
    setPreviewCell(cell);
    const candidate: Rect = { x: cell.x, y: cell.y, w: activeSpace.grid_w, h: activeSpace.grid_h };
    const collides = otherSpaces.some((s) =>
      rectsOverlap(candidate, { x: s.grid_x, y: s.grid_y, w: s.grid_w, h: s.grid_h }),
    );
    setCollision(collides || !isInBounds(candidate));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    if (!activeSpace) {
      setActiveId(null);
      setPreviewCell(null);
      return;
    }
    const cell = computeTargetCell(e);
    setActiveId(null);
    setPreviewCell(null);
    if (!cell) return;

    const candidate: Rect = { x: cell.x, y: cell.y, w: activeSpace.grid_w, h: activeSpace.grid_h };
    const collides = otherSpaces.some((s) =>
      rectsOverlap(candidate, { x: s.grid_x, y: s.grid_y, w: s.grid_w, h: s.grid_h }),
    );

    if (collides || !isInBounds(candidate)) {
      setCollision(true);
      setTimeout(() => setCollision(false), 350);
      return;
    }

    if (cell.x === activeSpace.grid_x && cell.y === activeSpace.grid_y) return;

    const entry: HistoryEntry = {
      id: activeSpace.id,
      from: { x: activeSpace.grid_x, y: activeSpace.grid_y, w: activeSpace.grid_w, h: activeSpace.grid_h },
      to: { x: cell.x, y: cell.y, w: activeSpace.grid_w, h: activeSpace.grid_h },
    };
    undoStack.current = [...undoStack.current.slice(-9), entry];
    redoStack.current = [];
    forceRender((n) => n + 1);

    updatePos.mutate(
      { id: activeSpace.id, grid_x: cell.x, grid_y: cell.y },
      { onSuccess: () => setSavedAt(Date.now()) },
    );
  };

  const undo = () => {
    const entry = undoStack.current[undoStack.current.length - 1];
    if (!entry) return;
    undoStack.current = undoStack.current.slice(0, -1);
    redoStack.current = [...redoStack.current, entry];
    forceRender((n) => n + 1);
    updatePos.mutate(
      { id: entry.id, grid_x: entry.from.x, grid_y: entry.from.y },
      { onSuccess: () => setSavedAt(Date.now()) },
    );
  };

  const redo = () => {
    const entry = redoStack.current[redoStack.current.length - 1];
    if (!entry) return;
    redoStack.current = redoStack.current.slice(0, -1);
    undoStack.current = [...undoStack.current, entry];
    forceRender((n) => n + 1);
    updatePos.mutate(
      { id: entry.id, grid_x: entry.to.x, grid_y: entry.to.y },
      { onSuccess: () => setSavedAt(Date.now()) },
    );
  };

  // Cmd/Ctrl+Z / Shift+Cmd+Z keyboard shortcuts (desktop)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openEdit = (s: Partial<FacilitySpace> | null) => {
    if (!s) {
      // Auto-position new space in first open 2x2 cell
      const cell = findFirstOpenCell(spaces, 2, 2);
      setEditing({ grid_x: cell.x, grid_y: cell.y, grid_w: 2, grid_h: 2 });
    } else {
      setEditing(s);
    }
    setOpen(true);
  };

  const previewRect: Rect | null =
    activeSpace && previewCell
      ? { x: previewCell.x, y: previewCell.y, w: activeSpace.grid_w, h: activeSpace.grid_h }
      : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-lg font-display text-foreground">FLOOR PLAN</h2>
          <p className="text-xs text-muted-foreground">
            Drag spaces to rearrange. Tap the pencil to edit details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savedLabel && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              {savedLabel}
            </span>
          )}
          <Button
            size="icon"
            variant="outline"
            onClick={undo}
            disabled={undoStack.current.length === 0}
            aria-label="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={redo}
            disabled={redoStack.current.length === 0}
            aria-label="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={() => openEdit(null)}>
            <Plus className="w-4 h-4 mr-1" /> Add Space
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-auto p-3 sm:p-4">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onDragCancel={() => {
            setActiveId(null);
            setPreviewCell(null);
            setCollision(false);
          }}
        >
          <div
            className="relative bg-muted/30 rounded-lg mx-auto"
            style={{
              width: GRID_COLS * CELL,
              height: GRID_ROWS * CELL,
              backgroundImage: `linear-gradient(to right, hsl(var(--border) / 0.5) 1px, transparent 1px),
                 linear-gradient(to bottom, hsl(var(--border) / 0.5) 1px, transparent 1px)`,
              backgroundSize: `${CELL}px ${CELL}px`,
            }}
          >
            {/* Drop preview */}
            {previewRect && (
              <div
                className={cn(
                  "absolute rounded-md pointer-events-none border-2 border-dashed transition-colors",
                  collision ? "border-destructive bg-destructive/10" : "border-primary bg-primary/10",
                )}
                style={{
                  left: previewRect.x * CELL,
                  top: previewRect.y * CELL,
                  width: previewRect.w * CELL - 4,
                  height: previewRect.h * CELL - 4,
                  zIndex: 10,
                }}
              />
            )}

            {spaces.map((s) => (
              <DraggableSpace
                key={s.id}
                space={s}
                invalid={collision && s.id === activeId}
                onEdit={() => openEdit(s)}
              />
            ))}

            {spaces.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground px-4 text-center">
                No spaces yet — tap "Add Space" to start.
              </div>
            )}
          </div>
        </DndContext>

        <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
          <p className="text-[10px] text-muted-foreground">
            Tip: drag to move · pencil to edit · ⌘Z to undo
          </p>
          {savedLabel && (
            <span className="sm:hidden inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 text-primary" />
              {savedLabel}
            </span>
          )}
        </div>
      </div>

      <SpaceFormDialog open={open} onOpenChange={setOpen} space={editing} />
    </div>
  );
};
