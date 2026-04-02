import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useSport } from "@/contexts/SportContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  ReferenceLine, Area, AreaChart, Legend, ComposedChart
} from "recharts";
import {
  TrendingUp, Target, Award, Download, Share2, Activity,
  Dumbbell, Heart, Shield, BarChart3, ArrowUpRight, ArrowDownRight,
  Minus, Calendar, Zap, Timer, ChevronRight, FileText, Link2
} from "lucide-react";

// --- Mock data generators (would be replaced by real DB queries) ---
const generateVeloTrend = (base: number, months: number) =>
  Array.from({ length: months }, (_, i) => ({
    month: new Date(2025, i).toLocaleString("default", { month: "short" }),
    value: +(base + Math.random() * 4 + i * 0.5).toFixed(1),
  }));

const exitVeloData = generateVeloTrend(82, 12);
const pitchVeloData = generateVeloTrend(78, 12);
const sixtyData = Array.from({ length: 8 }, (_, i) => ({
  month: new Date(2025, i * 1.5).toLocaleString("default", { month: "short" }),
  value: +(7.2 - i * 0.05 - Math.random() * 0.1).toFixed(2),
}));
const popTimeData = Array.from({ length: 8 }, (_, i) => ({
  month: new Date(2025, i * 1.5).toLocaleString("default", { month: "short" }),
  value: +(2.15 - i * 0.02 - Math.random() * 0.05).toFixed(2),
}));

const prospectGradeHistory = [
  { date: "Jan", hitting: 50, power: 45, speed: 55, arm: 50, fielding: 50, ofp: 50 },
  { date: "Mar", hitting: 52, power: 48, speed: 55, arm: 52, fielding: 52, ofp: 52 },
  { date: "May", hitting: 55, power: 50, speed: 58, arm: 55, fielding: 55, ofp: 55 },
  { date: "Jul", hitting: 55, power: 53, speed: 58, arm: 55, fielding: 58, ofp: 56 },
  { date: "Sep", hitting: 58, power: 55, speed: 60, arm: 58, fielding: 58, ofp: 58 },
  { date: "Nov", hitting: 60, power: 58, speed: 60, arm: 60, fielding: 60, ofp: 60 },
];

const benchmarkData = [
  { metric: "Exit Velo", athlete: 87, natAvg: 78, d1: 92, d2: 86, d3: 82, pro: 98 },
  { metric: "Pitch Velo", athlete: 84, natAvg: 74, d1: 90, d2: 84, d3: 78, pro: 95 },
  { metric: "60-Yard", athlete: 70, natAvg: 60, d1: 80, d2: 70, d3: 65, pro: 85 },
  { metric: "Pop Time", athlete: 72, natAvg: 55, d1: 82, d2: 72, d3: 65, pro: 90 },
  { metric: "Sprint", athlete: 68, natAvg: 58, d1: 78, d2: 68, d3: 62, pro: 88 },
];

const scData = [
  { month: "Jan", squat: 225, deadlift: 275, bench: 155, bodyWeight: 175 },
  { month: "Mar", squat: 245, deadlift: 295, bench: 165, bodyWeight: 178 },
  { month: "May", squat: 265, deadlift: 315, bench: 175, bodyWeight: 180 },
  { month: "Jul", squat: 275, deadlift: 325, bench: 185, bodyWeight: 182 },
  { month: "Sep", squat: 285, deadlift: 335, bench: 195, bodyWeight: 183 },
  { month: "Nov", squat: 295, deadlift: 345, bench: 200, bodyWeight: 184 },
];

const jumpData = [
  { month: "Jan", vertical: 26, broad: 96 },
  { month: "Apr", vertical: 27.5, broad: 98 },
  { month: "Jul", vertical: 28.5, broad: 100 },
  { month: "Oct", vertical: 29, broad: 102 },
];

const injuryData = [
  { month: "Jan", daysMissed: 0, recoveryCompliance: 95, armHealth: 88 },
  { month: "Feb", daysMissed: 2, recoveryCompliance: 90, armHealth: 85 },
  { month: "Mar", daysMissed: 0, recoveryCompliance: 92, armHealth: 87 },
  { month: "Apr", daysMissed: 5, recoveryCompliance: 80, armHealth: 78 },
  { month: "May", daysMissed: 0, recoveryCompliance: 95, armHealth: 90 },
  { month: "Jun", daysMissed: 0, recoveryCompliance: 98, armHealth: 92 },
  { month: "Jul", daysMissed: 1, recoveryCompliance: 88, armHealth: 86 },
  { month: "Aug", daysMissed: 0, recoveryCompliance: 96, armHealth: 94 },
];

const goldColor = "hsl(44, 100%, 59%)";
const goldColorDim = "hsl(44, 80%, 45%)";
const steelColor = "hsl(0, 0%, 65%)";
const d1Color = "#22c55e";
const d2Color = "#3b82f6";
const d3Color = "#a855f7";
const proColor = "#ef4444";

const chartConfig = {
  value: { label: "Value", color: goldColor },
  athlete: { label: "You", color: goldColor },
  natAvg: { label: "Nat. Avg", color: steelColor },
  d1: { label: "D1", color: d1Color },
  d2: { label: "D2", color: d2Color },
  d3: { label: "D3", color: d3Color },
  pro: { label: "Pro", color: proColor },
  ofp: { label: "OFP", color: goldColor },
  squat: { label: "Squat", color: goldColor },
  deadlift: { label: "Deadlift", color: d1Color },
  bench: { label: "Bench", color: d2Color },
  bodyWeight: { label: "Body Weight", color: steelColor },
  vertical: { label: "Vertical", color: goldColor },
  broad: { label: "Broad Jump", color: d2Color },
  daysMissed: { label: "Days Missed", color: proColor },
  recoveryCompliance: { label: "Recovery", color: d1Color },
  armHealth: { label: "Arm Health", color: goldColor },
  hitting: { label: "Hitting", color: goldColor },
  power: { label: "Power", color: proColor },
  speed: { label: "Speed", color: d1Color },
  arm: { label: "Arm", color: d2Color },
  fielding: { label: "Fielding", color: d3Color },
};

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  if (Math.abs(diff) < 0.1) return <Badge variant="secondary" className="text-xs gap-1"><Minus className="w-3 h-3" /> Flat</Badge>;
  return diff > 0
    ? <Badge className="bg-green-900/50 text-green-400 border-green-700 text-xs gap-1"><ArrowUpRight className="w-3 h-3" /> +{diff.toFixed(1)}</Badge>
    : <Badge className="bg-red-900/50 text-red-400 border-red-700 text-xs gap-1"><ArrowDownRight className="w-3 h-3" /> {diff.toFixed(1)}</Badge>;
}

function KPITrendCard({ title, data, unit, icon }: { title: string; data: { month: string; value: number }[]; unit: string; icon: React.ReactNode }) {
  const latest = data[data.length - 1]?.value ?? 0;
  const prev = data[data.length - 2]?.value ?? latest;
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          <TrendBadge current={latest} previous={prev} />
        </div>
        <p className="text-2xl font-bold text-[hsl(var(--vault-utility))]" style={{ fontFamily: "var(--font-display)" }}>
          {latest} {unit}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-[140px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gold-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={goldColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={goldColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fill: steelColor, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="value" stroke={goldColor} strokeWidth={2} fill={`url(#gold-${title})`} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default function PerformanceAnalytics() {
  const { sport } = useSport();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("kpi");

  const seasonCompare = useMemo(() => {
    return [
      { metric: "Exit Velo", thisYear: 87.2, lastYear: 82.5, projected: 91.0 },
      { metric: "Pitch Velo", thisYear: 84.1, lastYear: 79.8, projected: 88.0 },
      { metric: "60-Yard", thisYear: 6.85, lastYear: 7.1, projected: 6.7 },
      { metric: "Vertical", thisYear: 29, lastYear: 26, projected: 31 },
      { metric: "Squat Max", thisYear: 295, lastYear: 225, projected: 340 },
    ];
  }, []);

  const handleExportPDF = () => {
    toast.success("Generating recruiting report PDF...");
    // Would trigger actual PDF generation
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/shared-profile/demo-token`);
    toast.success("Shareable link copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              PERFORMANCE ANALYTICS
            </h1>
            <p className="text-muted-foreground mt-1">
              {sport === "softball" ? "Softball" : "Baseball"} · Comprehensive development tracking
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShareLink} className="gap-1.5">
              <Share2 className="w-4 h-4" /> Share
            </Button>
            <Button size="sm" onClick={handleExportPDF} className="gap-1.5 bg-[hsl(var(--vault-utility))] text-black hover:bg-[hsl(44,100%,50%)]">
              <Download className="w-4 h-4" /> Export PDF
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 border border-border mb-6 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="kpi" className="text-xs gap-1"><Activity className="w-3 h-3" /> KPIs</TabsTrigger>
            <TabsTrigger value="prospect" className="text-xs gap-1"><Target className="w-3 h-3" /> Prospect</TabsTrigger>
            <TabsTrigger value="benchmark" className="text-xs gap-1"><BarChart3 className="w-3 h-3" /> Benchmarks</TabsTrigger>
            <TabsTrigger value="sc" className="text-xs gap-1"><Dumbbell className="w-3 h-3" /> S&C</TabsTrigger>
            <TabsTrigger value="health" className="text-xs gap-1"><Heart className="w-3 h-3" /> Health</TabsTrigger>
            <TabsTrigger value="export" className="text-xs gap-1"><FileText className="w-3 h-3" /> Report</TabsTrigger>
          </TabsList>

          {/* KPI TREND CHARTS */}
          <TabsContent value="kpi">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <KPITrendCard title="Exit Velocity" data={exitVeloData} unit="mph" icon={<Zap className="w-4 h-4 text-[hsl(var(--vault-utility))]" />} />
              <KPITrendCard title="Pitching Velocity" data={pitchVeloData} unit="mph" icon={<Activity className="w-4 h-4 text-[hsl(var(--vault-utility))]" />} />
              <KPITrendCard title="60-Yard Dash" data={sixtyData} unit="sec" icon={<Timer className="w-4 h-4 text-[hsl(var(--vault-utility))]" />} />
              <KPITrendCard title="Pop Time" data={popTimeData} unit="sec" icon={<Target className="w-4 h-4 text-[hsl(var(--vault-utility))]" />} />
            </div>

            {/* Season Comparison */}
            <Card className="mt-6 bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[hsl(var(--vault-utility))]" />
                  Season Comparison & Projection
                </CardTitle>
                <CardDescription>This year vs last year with graduation projection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-2 pr-4">Metric</th>
                        <th className="text-center py-2 px-3">Last Year</th>
                        <th className="text-center py-2 px-3">This Year</th>
                        <th className="text-center py-2 px-3">Change</th>
                        <th className="text-center py-2 pl-3">Projected</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seasonCompare.map((row) => {
                        const diff = row.thisYear - row.lastYear;
                        const isLower = row.metric.includes("Yard") ? diff < 0 : diff > 0;
                        return (
                          <tr key={row.metric} className="border-b border-border/50">
                            <td className="py-2.5 pr-4 font-medium">{row.metric}</td>
                            <td className="text-center py-2.5 px-3 text-muted-foreground">{row.lastYear}</td>
                            <td className="text-center py-2.5 px-3 font-semibold">{row.thisYear}</td>
                            <td className="text-center py-2.5 px-3">
                              <span className={isLower ? "text-green-400" : "text-red-400"}>
                                {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                              </span>
                            </td>
                            <td className="text-center py-2.5 pl-3 text-[hsl(var(--vault-utility))] font-bold">{row.projected}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROSPECT GRADE HISTORY */}
          <TabsContent value="prospect">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[hsl(var(--vault-utility))]" />
                  Prospect Grade History (20-80 Scale)
                </CardTitle>
                <CardDescription>Track how each tool grade has changed over the evaluation period</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <LineChart data={prospectGradeHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,20%)" />
                    <XAxis dataKey="date" tick={{ fill: steelColor, fontSize: 11 }} />
                    <YAxis domain={[30, 80]} tick={{ fill: steelColor, fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ReferenceLine y={60} stroke={goldColor} strokeDasharray="5 5" label={{ value: "60 Grade", fill: goldColor, fontSize: 10 }} />
                    <Line type="monotone" dataKey="ofp" stroke={goldColor} strokeWidth={3} dot={{ fill: goldColor, r: 4 }} />
                    <Line type="monotone" dataKey="hitting" stroke={goldColorDim} strokeWidth={1.5} strokeDasharray="4 2" />
                    <Line type="monotone" dataKey="power" stroke={proColor} strokeWidth={1.5} strokeDasharray="4 2" />
                    <Line type="monotone" dataKey="speed" stroke={d1Color} strokeWidth={1.5} strokeDasharray="4 2" />
                    <Line type="monotone" dataKey="arm" stroke={d2Color} strokeWidth={1.5} strokeDasharray="4 2" />
                    <Line type="monotone" dataKey="fielding" stroke={d3Color} strokeWidth={1.5} strokeDasharray="4 2" />
                    <Legend />
                  </LineChart>
                </ChartContainer>

                {/* Milestones */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "First 55+ Grade", date: "Mar 2025", tool: "Hitting" },
                    { label: "First 60+ Grade", date: "Sep 2025", tool: "Speed" },
                    { label: "OFP > 55", date: "Jul 2025", tool: "Overall" },
                  ].map((m) => (
                    <div key={m.label} className="p-3 border border-border rounded bg-muted/30">
                      <p className="text-xs text-muted-foreground">{m.date}</p>
                      <p className="text-sm font-semibold text-[hsl(var(--vault-utility))]">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.tool}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BENCHMARK COMPARISONS */}
          <TabsContent value="benchmark">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[hsl(var(--vault-utility))]" />
                  Division Benchmark Comparison
                </CardTitle>
                <CardDescription>Your percentile ranking vs national, D1, D2, D3, and professional averages</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                  <BarChart data={benchmarkData} layout="vertical" barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,20%)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: steelColor, fontSize: 10 }} />
                    <YAxis dataKey="metric" type="category" width={80} tick={{ fill: steelColor, fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="athlete" fill={goldColor} radius={[0, 2, 2, 0]} barSize={10} />
                    <Bar dataKey="natAvg" fill={steelColor} radius={[0, 2, 2, 0]} barSize={6} />
                    <Bar dataKey="d1" fill={d1Color} radius={[0, 2, 2, 0]} barSize={6} />
                    <Bar dataKey="d2" fill={d2Color} radius={[0, 2, 2, 0]} barSize={6} />
                    <Bar dataKey="d3" fill={d3Color} radius={[0, 2, 2, 0]} barSize={6} />
                    <Bar dataKey="pro" fill={proColor} radius={[0, 2, 2, 0]} barSize={6} />
                    <Legend />
                  </BarChart>
                </ChartContainer>

                {/* Quick rank cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
                  {benchmarkData.map((b) => (
                    <div key={b.metric} className="text-center p-3 border border-border rounded bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">{b.metric}</p>
                      <p className="text-xl font-bold text-[hsl(var(--vault-utility))]" style={{ fontFamily: "var(--font-display)" }}>{b.athlete}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {b.athlete >= b.d1 ? "D1+ Level" : b.athlete >= b.d2 ? "D2 Level" : b.athlete >= b.d3 ? "D3 Level" : "Developing"}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* S&C METRICS */}
          <TabsContent value="sc">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Lift Trends */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-[hsl(var(--vault-utility))]" />
                    Lift Progressions (lbs)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[240px] w-full">
                    <LineChart data={scData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,20%)" />
                      <XAxis dataKey="month" tick={{ fill: steelColor, fontSize: 10 }} />
                      <YAxis tick={{ fill: steelColor, fontSize: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="squat" stroke={goldColor} strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="deadlift" stroke={d1Color} strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="bench" stroke={d2Color} strokeWidth={2} dot={{ r: 3 }} />
                      <Legend />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Body Weight */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[hsl(var(--vault-utility))]" />
                    Body Weight Trend (lbs)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[240px] w-full">
                    <AreaChart data={scData}>
                      <defs>
                        <linearGradient id="bw-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={steelColor} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={steelColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,20%)" />
                      <XAxis dataKey="month" tick={{ fill: steelColor, fontSize: 10 }} />
                      <YAxis domain={["dataMin - 5", "dataMax + 5"]} tick={{ fill: steelColor, fontSize: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="bodyWeight" stroke={steelColor} strokeWidth={2} fill="url(#bw-grad)" />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Jump Metrics */}
              <Card className="bg-card border-border lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[hsl(var(--vault-utility))]" />
                    Explosiveness Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    {[
                      { label: "Vertical Jump", value: `${jumpData[jumpData.length - 1].vertical}"`, trend: "+3.0\"" },
                      { label: "Broad Jump", value: `${jumpData[jumpData.length - 1].broad}"`, trend: "+6\"" },
                      { label: "10-Yard Sprint", value: "1.62s", trend: "-0.05s" },
                      { label: "Lateral Agility", value: "4.28s", trend: "-0.12s" },
                    ].map((m) => (
                      <div key={m.label} className="text-center p-3 border border-border rounded bg-muted/30">
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <p className="text-xl font-bold text-[hsl(var(--vault-utility))]" style={{ fontFamily: "var(--font-display)" }}>{m.value}</p>
                        <p className="text-xs text-green-400">{m.trend}</p>
                      </div>
                    ))}
                  </div>
                  <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <LineChart data={jumpData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,20%)" />
                      <XAxis dataKey="month" tick={{ fill: steelColor, fontSize: 10 }} />
                      <YAxis tick={{ fill: steelColor, fontSize: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="vertical" stroke={goldColor} strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="broad" stroke={d2Color} strokeWidth={2} dot={{ r: 3 }} />
                      <Legend />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* HEALTH & RECOVERY */}
          <TabsContent value="health">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              {[
                { label: "Days Missed (YTD)", value: "8", icon: <Calendar className="w-5 h-5" />, color: "text-red-400" },
                { label: "Recovery Compliance", value: "92%", icon: <Shield className="w-5 h-5" />, color: "text-green-400" },
                { label: "Arm Health Score", value: "91", icon: <Heart className="w-5 h-5" />, color: "text-[hsl(var(--vault-utility))]" },
              ].map((s) => (
                <Card key={s.label} className="bg-card border-border">
                  <CardContent className="pt-6 flex items-center gap-4">
                    <div className={`p-3 rounded bg-muted/50 ${s.color}`}>{s.icon}</div>
                    <div>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{s.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[hsl(var(--vault-utility))]" />
                  Injury & Recovery Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <ComposedChart data={injuryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,20%)" />
                    <XAxis dataKey="month" tick={{ fill: steelColor, fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fill: steelColor, fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fill: steelColor, fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar yAxisId="left" dataKey="daysMissed" fill={proColor} radius={[2, 2, 0, 0]} barSize={16} />
                    <Line yAxisId="right" type="monotone" dataKey="recoveryCompliance" stroke={d1Color} strokeWidth={2} dot={{ r: 3 }} />
                    <Line yAxisId="right" type="monotone" dataKey="armHealth" stroke={goldColor} strokeWidth={2} dot={{ r: 3 }} />
                    <Legend />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EXPORT / REPORT */}
          <TabsContent value="export">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[hsl(var(--vault-utility))]" />
                  Exportable Recruiting Report
                </CardTitle>
                <CardDescription>Generate a comprehensive PDF or shareable link for college coaches</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* What's included */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "All KPI trends and current values",
                    "Prospect grades (20-80 scale)",
                    "Division benchmark comparisons",
                    "S&C progression data",
                    "Injury & recovery history",
                    "Highlight video links",
                    "Coach recommendations",
                    "Academic information (GPA, SAT/ACT)",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--vault-utility))]" />
                      {item}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                  <Button onClick={handleExportPDF} className="gap-2 bg-[hsl(var(--vault-utility))] text-black hover:bg-[hsl(44,100%,50%)] flex-1">
                    <Download className="w-4 h-4" />
                    Generate PDF Report
                  </Button>
                  <Button variant="outline" onClick={handleShareLink} className="gap-2 flex-1">
                    <Link2 className="w-4 h-4" />
                    Copy Shareable Link
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/recruiting/profile")} className="gap-2 flex-1">
                    <ChevronRight className="w-4 h-4" />
                    View Recruiting Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
