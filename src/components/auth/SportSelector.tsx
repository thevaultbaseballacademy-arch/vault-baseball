import { SportType, allSportTypes, sportConfigs } from "@/lib/sportTypes";

interface SportSelectorProps {
  value: SportType;
  onChange: (sport: SportType) => void;
}

const SportSelector = ({ value, onChange }: SportSelectorProps) => {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground">Choose Your Sport</label>
      <div className="grid grid-cols-2 gap-2">
        {allSportTypes.map((sportId) => {
          const config = sportConfigs[sportId];
          return (
            <button
              key={sportId}
              type="button"
              onClick={() => onChange(sportId)}
              className={`flex flex-col items-center gap-1.5 p-3 border rounded-lg transition-all text-center
                ${value === sportId
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/20"
                }`}
            >
              <span className="text-2xl">{config.icon}</span>
              <p className="font-medium text-sm">{config.displayName}</p>
              <p className="text-[10px] opacity-70 leading-tight">{config.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SportSelector;
