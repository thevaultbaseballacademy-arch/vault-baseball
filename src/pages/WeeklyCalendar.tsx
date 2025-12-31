import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Zap, 
  Activity, 
  Target, 
  Heart,
  Brain,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  Wind,
  Shield
} from "lucide-react";

interface TrainingBlock {
  id: string;
  name: string;
  duration: string;
  emphasis: "velocity" | "athleticism" | "skill" | "recovery" | "mental";
  description: string;
  intensity: "high" | "moderate" | "low";
}

interface DaySchedule {
  day: string;
  shortDay: string;
  primary: "velocity" | "athleticism" | "skill" | "recovery";
  theme: string;
  blocks: TrainingBlock[];
}

const emphasisConfig = {
  velocity: { 
    color: "bg-red-500", 
    textColor: "text-red-500",
    bgLight: "bg-red-500/10",
    border: "border-red-500/30",
    icon: Zap,
    label: "Velocity"
  },
  athleticism: { 
    color: "bg-blue-500", 
    textColor: "text-blue-500",
    bgLight: "bg-blue-500/10",
    border: "border-blue-500/30",
    icon: Activity,
    label: "Athleticism"
  },
  skill: { 
    color: "bg-amber-500", 
    textColor: "text-amber-500",
    bgLight: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: Target,
    label: "Skill/Transfer"
  },
  recovery: { 
    color: "bg-green-500", 
    textColor: "text-green-500",
    bgLight: "bg-green-500/10",
    border: "border-green-500/30",
    icon: Heart,
    label: "Recovery"
  },
  mental: { 
    color: "bg-purple-500", 
    textColor: "text-purple-500",
    bgLight: "bg-purple-500/10",
    border: "border-purple-500/30",
    icon: Brain,
    label: "Mental"
  },
};

const weeklySchedule: DaySchedule[] = [
  {
    day: "Monday",
    shortDay: "Mon",
    primary: "velocity",
    theme: "Max Intent Day",
    blocks: [
      { id: "m1", name: "Dynamic Warm-up", duration: "15 min", emphasis: "athleticism", description: "Movement prep & activation", intensity: "moderate" },
      { id: "m2", name: "Throwing Program", duration: "30 min", emphasis: "velocity", description: "High-intent throws, building to max effort", intensity: "high" },
      { id: "m3", name: "Hitting - Exit Velo Focus", duration: "45 min", emphasis: "velocity", description: "Overload/underload, intent swings", intensity: "high" },
      { id: "m4", name: "Arm Care", duration: "15 min", emphasis: "recovery", description: "Band work, shoulder stability", intensity: "low" },
    ]
  },
  {
    day: "Tuesday",
    shortDay: "Tue",
    primary: "athleticism",
    theme: "Speed & Power Day",
    blocks: [
      { id: "t1", name: "Sprint Mechanics", duration: "20 min", emphasis: "athleticism", description: "Acceleration, top speed work", intensity: "high" },
      { id: "t2", name: "Plyometrics", duration: "25 min", emphasis: "athleticism", description: "Jump training, reactive power", intensity: "high" },
      { id: "t3", name: "Skill Work - Defense", duration: "30 min", emphasis: "skill", description: "Footwork, transfers, throws", intensity: "moderate" },
      { id: "t4", name: "Mobility Flow", duration: "15 min", emphasis: "recovery", description: "Hip, t-spine, ankle mobility", intensity: "low" },
    ]
  },
  {
    day: "Wednesday",
    shortDay: "Wed",
    primary: "skill",
    theme: "Game Transfer Day",
    blocks: [
      { id: "w1", name: "Movement Prep", duration: "15 min", emphasis: "athleticism", description: "Light activation", intensity: "low" },
      { id: "w2", name: "Live At-Bats", duration: "45 min", emphasis: "skill", description: "Competitive reps, game situations", intensity: "moderate" },
      { id: "w3", name: "Situational Defense", duration: "30 min", emphasis: "skill", description: "Game-speed scenarios", intensity: "moderate" },
      { id: "w4", name: "Mental Performance", duration: "20 min", emphasis: "mental", description: "Visualization, focus training", intensity: "low" },
    ]
  },
  {
    day: "Thursday",
    shortDay: "Thu",
    primary: "velocity",
    theme: "Power Development Day",
    blocks: [
      { id: "th1", name: "Explosive Warm-up", duration: "15 min", emphasis: "athleticism", description: "CNS activation", intensity: "moderate" },
      { id: "th2", name: "Weighted Balls", duration: "30 min", emphasis: "velocity", description: "Velocity development protocol", intensity: "high" },
      { id: "th3", name: "Bat Speed Training", duration: "30 min", emphasis: "velocity", description: "Overload swings, speed work", intensity: "high" },
      { id: "th4", name: "Strength Training", duration: "45 min", emphasis: "athleticism", description: "Lower body power focus", intensity: "high" },
    ]
  },
  {
    day: "Friday",
    shortDay: "Fri",
    primary: "skill",
    theme: "Competition Prep Day",
    blocks: [
      { id: "f1", name: "Game Prep Warm-up", duration: "20 min", emphasis: "athleticism", description: "Pre-competition routine", intensity: "moderate" },
      { id: "f2", name: "BP - Quality Reps", duration: "30 min", emphasis: "skill", description: "Approach work, situational hitting", intensity: "moderate" },
      { id: "f3", name: "Defensive Review", duration: "25 min", emphasis: "skill", description: "Game plan execution", intensity: "moderate" },
      { id: "f4", name: "Pre-Game Mental", duration: "15 min", emphasis: "mental", description: "Focus routine, breathing", intensity: "low" },
    ]
  },
  {
    day: "Saturday",
    shortDay: "Sat",
    primary: "skill",
    theme: "Game Day",
    blocks: [
      { id: "s1", name: "Early Work", duration: "20 min", emphasis: "skill", description: "Individual skill refinement", intensity: "low" },
      { id: "s2", name: "Team BP/Infield", duration: "30 min", emphasis: "skill", description: "Pre-game preparation", intensity: "moderate" },
      { id: "s3", name: "Competition", duration: "180 min", emphasis: "skill", description: "Game performance", intensity: "high" },
      { id: "s4", name: "Post-Game Recovery", duration: "20 min", emphasis: "recovery", description: "Cool down, arm care", intensity: "low" },
    ]
  },
  {
    day: "Sunday",
    shortDay: "Sun",
    primary: "recovery",
    theme: "Active Recovery Day",
    blocks: [
      { id: "su1", name: "Light Movement", duration: "20 min", emphasis: "recovery", description: "Walk, light jog, dynamic stretch", intensity: "low" },
      { id: "su2", name: "Mobility Session", duration: "30 min", emphasis: "recovery", description: "Full body mobility flow", intensity: "low" },
      { id: "su3", name: "Mental Reset", duration: "20 min", emphasis: "mental", description: "Journaling, visualization", intensity: "low" },
      { id: "su4", name: "Optional Skill", duration: "30 min", emphasis: "skill", description: "Light catch, tee work (optional)", intensity: "low" },
    ]
  },
];

const WeeklyCalendar = () => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState<DaySchedule>(weeklySchedule[0]);
  const [viewMode, setViewMode] = useState<"week" | "day">("week");

  const getIntensityBadge = (intensity: "high" | "moderate" | "low") => {
    switch (intensity) {
      case "high":
        return <Badge variant="outline" className="border-red-500/50 text-red-500 text-xs">High</Badge>;
      case "moderate":
        return <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 text-xs">Mod</Badge>;
      case "low":
        return <Badge variant="outline" className="border-green-500/50 text-green-500 text-xs">Low</Badge>;
    }
  };

  // Calculate weekly distribution
  const weeklyDistribution = {
    velocity: 0,
    athleticism: 0,
    skill: 0,
    recovery: 0,
    mental: 0,
  };

  weeklySchedule.forEach(day => {
    day.blocks.forEach(block => {
      const duration = parseInt(block.duration);
      weeklyDistribution[block.emphasis] += duration;
    });
  });

  const totalMinutes = Object.values(weeklyDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">VAULT™ Weekly Calendar</h1>
                <p className="text-muted-foreground">
                  Structured training distribution for optimal development
                </p>
              </div>
            </div>
            
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "week" | "day")}>
              <TabsList>
                <TabsTrigger value="week">Week View</TabsTrigger>
                <TabsTrigger value="day">Day View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Weekly Distribution Summary */}
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Weekly Training Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {Object.entries(weeklyDistribution).map(([key, minutes]) => {
                const config = emphasisConfig[key as keyof typeof emphasisConfig];
                const Icon = config.icon;
                const percentage = Math.round((minutes / totalMinutes) * 100);
                
                return (
                  <div key={key} className={`flex items-center gap-3 p-3 rounded-lg ${config.bgLight} ${config.border} border`}>
                    <Icon className={`h-5 w-5 ${config.textColor}`} />
                    <div>
                      <div className="font-semibold">{config.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(minutes / 60)}h {minutes % 60}m ({percentage}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {viewMode === "week" ? (
          /* Week View */
          <div className="grid grid-cols-7 gap-2 mb-8">
            {weeklySchedule.map((day) => {
              const config = emphasisConfig[day.primary];
              const Icon = config.icon;
              const isSelected = selectedDay.day === day.day;
              
              return (
                <Card 
                  key={day.day}
                  className={`cursor-pointer transition-all hover:scale-[1.02] ${
                    isSelected ? `ring-2 ring-primary ${config.bgLight}` : ""
                  }`}
                  onClick={() => setSelectedDay(day)}
                >
                  <CardContent className="p-3 text-center">
                    <div className={`w-10 h-10 mx-auto mb-2 rounded-full ${config.bgLight} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${config.textColor}`} />
                    </div>
                    <div className="font-semibold text-sm">{day.shortDay}</div>
                    <Badge className={`mt-1 ${config.color} text-white text-xs`}>
                      {config.label.split('/')[0]}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-2 line-clamp-1">
                      {day.theme}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Day Navigation */
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                const currentIndex = weeklySchedule.findIndex(d => d.day === selectedDay.day);
                const prevIndex = currentIndex === 0 ? 6 : currentIndex - 1;
                setSelectedDay(weeklySchedule[prevIndex]);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center min-w-[200px]">
              <h2 className="text-2xl font-bold">{selectedDay.day}</h2>
              <p className="text-muted-foreground">{selectedDay.theme}</p>
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                const currentIndex = weeklySchedule.findIndex(d => d.day === selectedDay.day);
                const nextIndex = currentIndex === 6 ? 0 : currentIndex + 1;
                setSelectedDay(weeklySchedule[nextIndex]);
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Selected Day Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const config = emphasisConfig[selectedDay.primary];
                  const Icon = config.icon;
                  return (
                    <>
                      <div className={`p-2 rounded-lg ${config.bgLight}`}>
                        <Icon className={`h-6 w-6 ${config.textColor}`} />
                      </div>
                      <div>
                        <CardTitle>{selectedDay.day} — {selectedDay.theme}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Primary Focus: {emphasisConfig[selectedDay.primary].label}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {selectedDay.blocks.reduce((sum, b) => sum + parseInt(b.duration), 0)} min
                </div>
                <div className="text-sm text-muted-foreground">Total Duration</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedDay.blocks.map((block, index) => {
                const config = emphasisConfig[block.emphasis];
                const Icon = config.icon;
                
                return (
                  <div 
                    key={block.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${config.border} ${config.bgLight}`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background text-muted-foreground font-semibold">
                      {index + 1}
                    </div>
                    <div className={`p-2 rounded-lg bg-background`}>
                      <Icon className={`h-5 w-5 ${config.textColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{block.name}</span>
                        <Badge variant="outline" className={`${config.textColor} ${config.border} text-xs`}>
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{block.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{block.duration}</div>
                      {getIntensityBadge(block.intensity)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Day Summary */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold mb-3">Training Emphasis Breakdown</h4>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(
                  selectedDay.blocks.reduce((acc, block) => {
                    const duration = parseInt(block.duration);
                    acc[block.emphasis] = (acc[block.emphasis] || 0) + duration;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([emphasis, minutes]) => {
                  const config = emphasisConfig[emphasis as keyof typeof emphasisConfig];
                  return (
                    <Badge 
                      key={emphasis} 
                      className={`${config.color} text-white`}
                    >
                      {config.label}: {minutes} min
                    </Badge>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VAULT™ Principles */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">VAULT™ Weekly Structure Principles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex gap-3">
                <Dumbbell className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">High Intent Days</h4>
                  <p className="text-sm text-muted-foreground">
                    Monday & Thursday focus on max effort velocity work when CNS is fresh
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Wind className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Movement Quality</h4>
                  <p className="text-sm text-muted-foreground">
                    Tuesday emphasizes athletic development and movement patterns
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Target className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Game Transfer</h4>
                  <p className="text-sm text-muted-foreground">
                    Wed/Fri/Sat focus on skill execution and competitive performance
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Recovery Protocol</h4>
                  <p className="text-sm text-muted-foreground">
                    Sunday is active recovery to rebuild and prepare for the next cycle
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default WeeklyCalendar;
