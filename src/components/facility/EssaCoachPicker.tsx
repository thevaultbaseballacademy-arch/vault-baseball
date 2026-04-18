import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { UserCog } from "lucide-react";
import { useEssaCoaches } from "@/hooks/useEssaCoaches";

type Props = {
  value: string | null;
  onChange: (id: string | null, name: string | null) => void;
};

const EssaCoachPicker = ({ value, onChange }: Props) => {
  const { data: coaches = [], isLoading } = useEssaCoaches();

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center gap-2 mb-2">
        <UserCog className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm tracking-wide uppercase text-foreground">
          Coach (optional)
        </h3>
      </div>
      <Select
        value={value ?? "any"}
        onValueChange={(v) => {
          if (v === "any") return onChange(null, null);
          const c = coaches.find((c) => c.user_id === v);
          onChange(v, c?.display_name ?? null);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Loading coaches..." : "Any available coach"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any available coach</SelectItem>
          {coaches.map((c) => (
            <SelectItem key={c.user_id} value={c.user_id}>
              {c.display_name}
              {c.position ? ` · ${c.position}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
        Pick a coach to limit slots to their availability — or leave open and any coach can run the lesson.
      </p>
    </Card>
  );
};

export default EssaCoachPicker;
