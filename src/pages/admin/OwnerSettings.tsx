import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Power } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_FLAGS: Record<string, { label: string; description: string; category: string; defaultValue: boolean }> = {
  sport_baseball: { label: "Baseball Module", description: "Enable baseball training system", category: "sports", defaultValue: true },
  sport_softball: { label: "Softball Module", description: "Enable softball training system", category: "sports", defaultValue: true },
  feature_webrtc: { label: "WebRTC Lessons", description: "Live video lessons", category: "features", defaultValue: true },
  feature_async_video: { label: "Async Video Analysis", description: "Video breakdown lessons", category: "features", defaultValue: true },
  feature_courses: { label: "Course System", description: "Self-paced courses", category: "features", defaultValue: true },
  feature_parent_portal: { label: "Parent Portal", description: "Read-only parent dashboard", category: "features", defaultValue: false },
  feature_recruiting: { label: "Recruiting Profiles", description: "Athlete recruiting profiles", category: "features", defaultValue: true },
  feature_injury_tracker: { label: "Injury Tracker", description: "Injury and load monitoring", category: "features", defaultValue: false },
  feature_pitch_load: { label: "Pitch Load Tracker", description: "Weekly pitch count tracking", category: "features", defaultValue: false },
  feature_community_drills: { label: "Community Drill Library", description: "Shared drill library", category: "features", defaultValue: false },
};

const OwnerSettings = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: settings = [] } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("platform_settings").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const getFlag = (key: string): boolean => {
    const setting = settings.find(s => s.setting_key === key);
    if (setting) return (setting.setting_value as any)?.enabled ?? DEFAULT_FLAGS[key]?.defaultValue ?? false;
    return DEFAULT_FLAGS[key]?.defaultValue ?? false;
  };

  const toggleFlag = useMutation({
    mutationFn: async (key: string) => {
      const current = getFlag(key);
      const { data: { user } } = await supabase.auth.getUser();

      const existing = settings.find(s => s.setting_key === key);
      if (existing) {
        const { error } = await supabase.from("platform_settings")
          .update({ setting_value: { enabled: !current }, updated_by: user?.id })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("platform_settings")
          .insert({
            setting_key: key,
            setting_value: { enabled: !current },
            category: DEFAULT_FLAGS[key]?.category || "general",
            updated_by: user?.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-settings"] });
      toast({ title: "Setting updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const groupedFlags = Object.entries(DEFAULT_FLAGS).reduce((acc, [key, flag]) => {
    if (!acc[flag.category]) acc[flag.category] = [];
    acc[flag.category].push({ key, ...flag });
    return acc;
  }, {} as Record<string, Array<{ key: string; label: string; description: string; category: string; defaultValue: boolean }>>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display text-foreground">SETTINGS</h1>
        <p className="text-sm text-muted-foreground">Platform configuration and feature flags</p>
      </div>

      {Object.entries(groupedFlags).map(([category, flags]) => (
        <div key={category} className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-display text-foreground uppercase">{category === "sports" ? "Sport Modules" : "Feature Flags"}</h2>
          </div>
          <div className="divide-y divide-border">
            {flags.map(flag => {
              const enabled = getFlag(flag.key);
              return (
                <div key={flag.key} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{flag.label}</p>
                    <p className="text-xs text-muted-foreground">{flag.description}</p>
                  </div>
                  <button
                    onClick={() => toggleFlag.mutate(flag.key)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-emerald-500" : "bg-secondary"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OwnerSettings;
