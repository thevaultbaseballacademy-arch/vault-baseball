import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Gauge, 
  Plus, 
  Loader2, 
  Trash2, 
  Zap, 
  Ruler, 
  Dumbbell,
  TrendingUp,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

interface AthleteKPI {
  id: string;
  user_id: string;
  kpi_category: 'performance' | 'physical' | 'training';
  kpi_name: string;
  kpi_value: number;
  kpi_unit: string | null;
  recorded_at: string;
  notes: string | null;
  created_at: string;
}

interface AthleteKPIFormProps {
  userId: string;
  isOwnProfile: boolean;
}

const kpiCategories = [
  { value: "performance", label: "Performance Metrics", icon: Zap, color: "text-amber-500" },
  { value: "physical", label: "Physical Measurements", icon: Ruler, color: "text-blue-500" },
  { value: "training", label: "Training Progress", icon: Dumbbell, color: "text-green-500" },
];

const performanceKPIs = [
  { name: "Fastball Velocity", unit: "mph" },
  { name: "Exit Velocity", unit: "mph" },
  { name: "Sprint Speed", unit: "mph" },
  { name: "60-Yard Dash", unit: "sec" },
  { name: "Throwing Velocity", unit: "mph" },
  { name: "Pop Time", unit: "sec" },
  { name: "Bat Speed", unit: "mph" },
  { name: "Spin Rate", unit: "rpm" },
  { name: "Launch Angle", unit: "°" },
  { name: "Home to First", unit: "sec" },
];

const physicalKPIs = [
  { name: "Height", unit: "in" },
  { name: "Weight", unit: "lbs" },
  { name: "Body Fat", unit: "%" },
  { name: "Wingspan", unit: "in" },
  { name: "Vertical Jump", unit: "in" },
  { name: "Broad Jump", unit: "in" },
  { name: "Grip Strength (L)", unit: "lbs" },
  { name: "Grip Strength (R)", unit: "lbs" },
  { name: "Flexibility Score", unit: "" },
];

const trainingKPIs = [
  { name: "Weekly Workouts", unit: "sessions" },
  { name: "Training Hours", unit: "hrs" },
  { name: "Squat Max", unit: "lbs" },
  { name: "Bench Press Max", unit: "lbs" },
  { name: "Deadlift Max", unit: "lbs" },
  { name: "Pull-ups", unit: "reps" },
  { name: "Plyo Throws", unit: "throws" },
  { name: "Long Toss Max", unit: "ft" },
  { name: "Bullpen Count", unit: "pitches" },
  { name: "BP Swings", unit: "swings" },
];

const getKPIOptions = (category: string) => {
  switch (category) {
    case "performance": return performanceKPIs;
    case "physical": return physicalKPIs;
    case "training": return trainingKPIs;
    default: return [];
  }
};

const AthleteKPIForm = ({ userId, isOwnProfile }: AthleteKPIFormProps) => {
  const [addOpen, setAddOpen] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [kpiName, setKpiName] = useState("");
  const [kpiValue, setKpiValue] = useState("");
  const [kpiUnit, setKpiUnit] = useState("");
  const [recordedAt, setRecordedAt] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("performance");
  const queryClient = useQueryClient();

  const { data: kpis = [], isLoading } = useQuery({
    queryKey: ['athlete-kpis', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('athlete_kpis')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false });
      if (error) throw error;
      return data as AthleteKPI[];
    }
  });

  const addKPI = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('athlete_kpis')
        .insert({
          user_id: userId,
          kpi_category: category,
          kpi_name: kpiName,
          kpi_value: parseFloat(kpiValue),
          kpi_unit: kpiUnit || null,
          recorded_at: recordedAt,
          notes: notes || null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-kpis', userId] });
      toast.success("KPI recorded!");
      resetForm();
    },
    onError: () => toast.error("Failed to add KPI"),
  });

  const deleteKPI = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('athlete_kpis').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-kpis', userId] });
      toast.success("KPI removed");
    },
    onError: () => toast.error("Failed to remove KPI"),
  });

  const resetForm = () => {
    setAddOpen(false);
    setCategory("");
    setKpiName("");
    setKpiValue("");
    setKpiUnit("");
    setRecordedAt(format(new Date(), "yyyy-MM-dd"));
    setNotes("");
  };

  const handleKPISelect = (name: string) => {
    setKpiName(name);
    const options = getKPIOptions(category);
    const selected = options.find(k => k.name === name);
    if (selected) {
      setKpiUnit(selected.unit);
    }
  };

  const groupedKPIs = kpis.reduce((acc, kpi) => {
    if (!acc[kpi.kpi_category]) acc[kpi.kpi_category] = {};
    if (!acc[kpi.kpi_category][kpi.kpi_name]) acc[kpi.kpi_category][kpi.kpi_name] = [];
    acc[kpi.kpi_category][kpi.kpi_name].push(kpi);
    return acc;
  }, {} as Record<string, Record<string, AthleteKPI[]>>);

  const getLatestKPIs = (categoryData: Record<string, AthleteKPI[]>) => {
    return Object.entries(categoryData).map(([name, entries]) => ({
      name,
      latest: entries[0],
      previous: entries[1],
      trend: entries.length > 1 ? entries[0].kpi_value - entries[1].kpi_value : 0,
    }));
  };

  const getCategoryIcon = (cat: string) => {
    const found = kpiCategories.find(c => c.value === cat);
    return found ? found.icon : Gauge;
  };

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-primary" />
          Athlete KPIs
        </CardTitle>
        {isOwnProfile && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Log KPI
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Log New KPI</DialogTitle>
                <DialogDescription>Track your performance, physical, or training metrics.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(v) => { setCategory(v); setKpiName(""); setKpiUnit(""); }}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {kpiCategories.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex items-center gap-2">
                            <c.icon className={`w-4 h-4 ${c.color}`} />
                            {c.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {category && (
                  <div className="space-y-2">
                    <Label>Metric</Label>
                    <Select value={kpiName} onValueChange={handleKPISelect}>
                      <SelectTrigger><SelectValue placeholder="Select metric" /></SelectTrigger>
                      <SelectContent>
                        {getKPIOptions(category).map(k => (
                          <SelectItem key={k.name} value={k.name}>
                            {k.name} {k.unit && `(${k.unit})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={kpiValue}
                        onChange={(e) => setKpiValue(e.target.value)}
                        placeholder="0"
                      />
                      {kpiUnit && (
                        <span className="text-sm text-muted-foreground whitespace-nowrap">{kpiUnit}</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={recordedAt}
                      onChange={(e) => setRecordedAt(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add context or details..."
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button 
                  onClick={() => addKPI.mutate()} 
                  disabled={!category || !kpiName || !kpiValue || addKPI.isPending}
                >
                  {addKPI.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Log KPI
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>

      <CardContent>
        {kpis.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Gauge className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No KPIs logged yet</p>
            {isOwnProfile && <p className="text-sm mt-1">Start tracking your performance metrics</p>}
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              {kpiCategories.map(cat => (
                <TabsTrigger key={cat.value} value={cat.value} className="flex items-center gap-1.5">
                  <cat.icon className={`w-4 h-4 ${cat.color}`} />
                  <span className="hidden sm:inline">{cat.label.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {kpiCategories.map(cat => {
              const categoryData = groupedKPIs[cat.value] || {};
              const latestKPIs = getLatestKPIs(categoryData);

              return (
                <TabsContent key={cat.value} value={cat.value}>
                  {latestKPIs.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <cat.icon className={`w-8 h-8 mx-auto mb-2 opacity-50 ${cat.color}`} />
                      <p className="text-sm">No {cat.label.toLowerCase()} recorded</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {latestKPIs.map(({ name, latest, trend }) => (
                        <div 
                          key={name}
                          className="group relative p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-muted-foreground truncate pr-2">{name}</p>
                            {trend !== 0 && (
                              <TrendingUp className={`w-3 h-3 flex-shrink-0 ${trend > 0 ? 'text-green-500' : 'text-red-500 rotate-180'}`} />
                            )}
                          </div>
                          <p className="text-xl font-bold text-foreground">
                            {latest.kpi_value}
                            {latest.kpi_unit && (
                              <span className="text-sm font-normal text-muted-foreground ml-1">{latest.kpi_unit}</span>
                            )}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(latest.recorded_at), "MMM d, yyyy")}
                            </p>
                          </div>
                          {isOwnProfile && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => deleteKPI.mutate(latest.id)}
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default AthleteKPIForm;
