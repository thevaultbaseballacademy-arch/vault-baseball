import { Users, Trophy } from "lucide-react";

type Role = "athlete" | "coach";

interface RoleSelectorProps {
  value: Role;
  onChange: (role: Role) => void;
}

const RoleSelector = ({ value, onChange }: RoleSelectorProps) => {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground">I am a...</label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange("athlete")}
          className={`flex items-center gap-2 p-3 border rounded-lg transition-all text-left text-sm
            ${value === "athlete"
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border text-muted-foreground hover:border-foreground/20"
            }`}
        >
          <Trophy className="w-4 h-4 shrink-0" />
          <div>
            <p className="font-medium text-xs">Athlete</p>
            <p className="text-[10px] opacity-70">Train & develop</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onChange("coach")}
          className={`flex items-center gap-2 p-3 border rounded-lg transition-all text-left text-sm
            ${value === "coach"
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border text-muted-foreground hover:border-foreground/20"
            }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <div>
            <p className="font-medium text-xs">Coach</p>
            <p className="text-[10px] opacity-70">Coach athletes</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default RoleSelector;
