import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Loader2, Users, TrendingUp, Calendar, 
  ChevronDown, ChevronUp, Search, Activity, Trophy,
  BookOpen, Target, BarChart3, Video, Brain, DollarSign, Store
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CoachAlerts } from "@/components/CoachAlerts";
import { useCoachAlerts } from "@/hooks/useCoachAlerts";
import { WeeklySummaryReport } from "@/components/WeeklySummaryReport";
import { CoachScheduleManager } from "@/components/coach/CoachScheduleManager";
import { KPILeaderboards } from "@/components/coach/KPILeaderboards";
import { CoachLessonMonitor } from "@/components/coach/CoachLessonMonitor";
import GlobalSearch from "@/components/coach/GlobalSearch";
import PositionShortcuts from "@/components/coach/PositionShortcuts";
import FavoritesQuickStart from "@/components/coach/FavoritesQuickStart";
import QuickAccessCard from "@/components/coach/QuickAccessCard";
import CoachAnalysisReview from "@/components/coaching/CoachAnalysisReview";
import CoachEarningsDashboard from "@/components/marketplace/CoachEarningsDashboard";
import CoachMarketplaceSetup from "@/components/marketplace/CoachMarketplaceSetup";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AthleteProfile {
  user_id: string;
  email: string;
  display_name: string;
}

interface CheckinData {
  id: string;
  user_id: string;
  checkin_date: string;
  mood: number | null;
  energy_level: number | null;
  sleep_hours: number | null;
  soreness_level: number | null;
  stress_level: number | null;
  training_completed: boolean;
  training_type: string | null;
  training_duration_minutes: number | null;
  training_intensity: number | null;
  notes: string | null;
}

const CoachDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCoach, setIsCoach] = useState(false);
  const [coachRecordId, setCoachRecordId] = useState<string | null>(null);
  const [athletes, setAthletes] = useState<AthleteProfile[]>([]);
  const [checkins, setCheckins] = useState<CheckinData[]>([]);
  const [expandedAthlete, setExpandedAthlete] = useState<string | null>(null);
  const [athleteSearchTerm, setAthleteSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    alerts,
    unreadCount,
    generateAlerts,
    markAsRead,
    markAllAsRead,
    deleteAlert,
    fetchAlerts
  } = useCoachAlerts(user?.id || null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      checkCoachRole(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate("/auth");
      }
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkCoachRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'coach')
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setIsCoach(true);
        fetchAthletes();
        fetchAllCheckins();
        // Fetch coach record ID for marketplace
        const { data: coachData } = await supabase
          .from('coaches')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        if (coachData) setCoachRecordId(coachData.id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error checking coach role:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isCoach && user?.id && athletes.length > 0) {
      generateAlerts();
    }
  }, [isCoach, user?.id, athletes.length, generateAlerts]);

  const fetchAthletes = async () => {
    try {
      // Use profiles_public view to respect email privacy - coaches don't need emails
      const { data, error } = await supabase
        .from('profiles_public')
        .select('user_id, email, display_name')
        .order('display_name');

      if (error) throw error;
      setAthletes(data || []);
    } catch (error) {
      console.error('Error fetching athletes:', error);
    }
  };

  const fetchAllCheckins = async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14);

    try {
      const { data, error } = await supabase
        .from('athlete_checkins')
        .select('*')
        .gte('checkin_date', startDate.toISOString().split('T')[0])
        .order('checkin_date', { ascending: false });

      if (error) throw error;
      setCheckins(data || []);
    } catch (error) {
      console.error('Error fetching checkins:', error);
    }
  };

  const getAthleteCheckins = (userId: string) => {
    return checkins.filter(c => c.user_id === userId);
  };

  const getLatestCheckin = (userId: string) => {
    const athleteCheckins = getAthleteCheckins(userId);
    return athleteCheckins[0] || null;
  };

  const getAthleteStats = (userId: string) => {
    const athleteCheckins = getAthleteCheckins(userId);
    if (athleteCheckins.length === 0) return null;

    const trainingDays = athleteCheckins.filter(c => c.training_completed).length;
    const avgMood = athleteCheckins.reduce((sum, c) => sum + (c.mood || 0), 0) / athleteCheckins.filter(c => c.mood).length;
    const avgEnergy = athleteCheckins.reduce((sum, c) => sum + (c.energy_level || 0), 0) / athleteCheckins.filter(c => c.energy_level).length;

    return {
      checkinCount: athleteCheckins.length,
      trainingDays,
      avgMood: isNaN(avgMood) ? null : avgMood.toFixed(1),
      avgEnergy: isNaN(avgEnergy) ? null : avgEnergy.toFixed(1),
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getMoodColor = (mood: number | null) => {
    if (!mood) return 'bg-muted';
    if (mood >= 4) return 'bg-green-500';
    if (mood >= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredAthletes = athletes.filter(a => 
    a.display_name?.toLowerCase().includes(athleteSearchTerm.toLowerCase()) ||
    a.email?.toLowerCase().includes(athleteSearchTerm.toLowerCase())
  );

  const athletesWithRecentActivity = filteredAthletes.filter(a => {
    const latest = getLatestCheckin(a.user_id);
    return latest !== null;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isCoach) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-display text-foreground mb-2">Coach Access Required</h2>
              <p className="text-muted-foreground mb-6">
                This dashboard is only available to coaches.
              </p>
              <Button variant="vault" onClick={() => navigate("/")}>
                Go Home
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header with Global Search */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-display text-foreground mb-1">
                  COACH COMMAND CENTER
                </h1>
                <p className="text-muted-foreground">Find any drill in 3 clicks or less</p>
              </div>
              <div className="flex items-center gap-3">
                <GlobalSearch />
                <WeeklySummaryReport />
                <CoachAlerts
                  alerts={alerts}
                  unreadCount={unreadCount}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onDelete={deleteAlert}
                  onRefresh={() => {
                    generateAlerts();
                    fetchAlerts();
                  }}
                />
              </div>
            </div>

            {/* Position Shortcuts - 1 Click Access */}
            <PositionShortcuts />

            {/* Favorites Quick Start */}
            <FavoritesQuickStart />

            {/* Quick Access Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickAccessCard
                title="Courses"
                description="All training programs"
                icon={BookOpen}
                href="/courses"
                color="#3b82f6"
                delay={0.1}
              />
              <QuickAccessCard
                title="Certifications"
                description="Coach credentials"
                icon={Target}
                href="/certifications"
                color="#22c55e"
                delay={0.15}
              />
              <QuickAccessCard
                title="Leaderboards"
                description="Top performers"
                icon={Trophy}
                href="/certificate-leaderboard"
                color="#f59e0b"
                delay={0.2}
              />
              <QuickAccessCard
                title="Analytics"
                description="Performance data"
                icon={BarChart3}
                href="/longevity-dashboard"
                color="#8b5cf6"
                delay={0.25}
              />
            </div>

            {/* Tabs for Athletes vs Schedules vs Leaderboards */}
            <Tabs defaultValue="athletes" className="space-y-6">
              <TabsList className="grid w-full max-w-4xl grid-cols-7">
                <TabsTrigger value="athletes" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Athletes
                </TabsTrigger>
                <TabsTrigger value="motion" className="flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  Motion
                </TabsTrigger>
                <TabsTrigger value="lessons" className="flex items-center gap-1">
                  <Video className="w-3 h-3" />
                  Lessons
                </TabsTrigger>
                <TabsTrigger value="marketplace" className="flex items-center gap-1">
                  <Store className="w-3 h-3" />
                  Marketplace
                </TabsTrigger>
                <TabsTrigger value="earnings" className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Earnings
                </TabsTrigger>
                <TabsTrigger value="leaderboards" className="flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  Leaderboards
                </TabsTrigger>
                <TabsTrigger value="schedules" className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Schedules
                </TabsTrigger>
              </TabsList>

              <TabsContent value="motion" className="space-y-6">
                <h2 className="font-display text-xl text-foreground">VAULT AI MOTION ANALYSIS</h2>
                <p className="text-sm text-muted-foreground">Review AI-generated biomechanics reports. Add notes and mark key points for live sessions.</p>
                {athletes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No assigned athletes yet.</p>
                ) : (
                  <div className="space-y-6">
                    {athletes.map((a: any) => (
                      <CoachAnalysisReview
                        key={a.user_id}
                        coachUserId={user?.id || ''}
                        athleteUserId={a.user_id}
                        athleteName={a.display_name}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="lessons" className="space-y-6">
                <CoachLessonMonitor coachUserId={user?.id || ''} />
              </TabsContent>

              <TabsContent value="marketplace" className="space-y-6">
                <h2 className="font-display text-xl text-foreground">MARKETPLACE SETTINGS</h2>
                <p className="text-sm text-muted-foreground">Set up your public profile, services, and pricing for the Vault Coach Marketplace.</p>
                <CoachMarketplaceSetup userId={user?.id || ''} />
              </TabsContent>

              <TabsContent value="earnings" className="space-y-6">
                <h2 className="font-display text-xl text-foreground">MARKETPLACE EARNINGS</h2>
                <p className="text-sm text-muted-foreground">Track your session income and payout history. Platform fee: 30% / Coach: 70%.</p>
                {coachRecordId ? (
                  <CoachEarningsDashboard coachId={coachRecordId} />
                ) : (
                  <p className="text-sm text-muted-foreground">Loading coach record...</p>
                )}
              </TabsContent>

              <TabsContent value="leaderboards" className="space-y-6">
                <KPILeaderboards coachUserId={user?.id || ''} />
              </TabsContent>

              <TabsContent value="athletes" className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-accent" />
                      <span className="text-sm text-muted-foreground">Total Athletes</span>
                    </div>
                    <p className="text-2xl font-display text-foreground">{athletes.length}</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-accent" />
                      <span className="text-sm text-muted-foreground">Active (14d)</span>
                    </div>
                    <p className="text-2xl font-display text-foreground">{athletesWithRecentActivity.length}</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-accent" />
                      <span className="text-sm text-muted-foreground">Check-ins (14d)</span>
                    </div>
                    <p className="text-2xl font-display text-foreground">{checkins.length}</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-accent" />
                      <span className="text-sm text-muted-foreground">Training Sessions</span>
                    </div>
                    <p className="text-2xl font-display text-foreground">
                      {checkins.filter(c => c.training_completed).length}
                    </p>
                  </div>
                </div>

                {/* Athletes List with Search */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-lg font-display text-foreground">Athletes</h2>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search athletes..."
                        value={athleteSearchTerm}
                        onChange={(e) => setAthleteSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground w-full md:w-64 text-sm"
                      />
                    </div>
                  </div>

                  {filteredAthletes.length === 0 ? (
                    <div className="p-8 text-center">
                      <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No athletes found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {filteredAthletes.map((athlete) => {
                        const latest = getLatestCheckin(athlete.user_id);
                        const stats = getAthleteStats(athlete.user_id);
                        const isExpanded = expandedAthlete === athlete.user_id;
                        const athleteCheckins = getAthleteCheckins(athlete.user_id);

                        return (
                          <div key={athlete.user_id}>
                            <button
                              onClick={() => setExpandedAthlete(isExpanded ? null : athlete.user_id)}
                              className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                  <span className="text-sm font-medium text-accent">
                                    {athlete.display_name?.charAt(0).toUpperCase() || '?'}
                                  </span>
                                </div>
                                <div className="text-left">
                                  <p className="font-medium text-foreground">
                                    {athlete.display_name || 'Unknown'}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{athlete.email}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-6">
                                {latest ? (
                                  <>
                                    <div className="hidden md:flex items-center gap-4">
                                      <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Last Check-in</p>
                                        <p className="text-sm text-foreground">{formatDate(latest.checkin_date)}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Mood</p>
                                        <div className="flex items-center gap-1">
                                          <div className={`w-2 h-2 rounded-full ${getMoodColor(latest.mood)}`} />
                                          <span className="text-sm text-foreground">{latest.mood || '—'}/5</span>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Energy</p>
                                        <p className="text-sm text-foreground">{latest.energy_level || '—'}/5</p>
                                      </div>
                                    </div>
                                    {isExpanded ? (
                                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                    )}
                                  </>
                                ) : (
                                  <span className="text-sm text-muted-foreground">No check-ins</span>
                                )}
                              </div>
                            </button>

                            {/* Expanded Detail */}
                            {isExpanded && athleteCheckins.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="p-4 bg-secondary/30 border-t border-border"
                              >
                                <div className="grid md:grid-cols-4 gap-4 mb-6">
                                  <div className="bg-card rounded-xl p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Check-ins (14d)</p>
                                    <p className="text-lg font-display text-foreground">{stats?.checkinCount || 0}</p>
                                  </div>
                                  <div className="bg-card rounded-xl p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Training Days</p>
                                    <p className="text-lg font-display text-foreground">{stats?.trainingDays || 0}</p>
                                  </div>
                                  <div className="bg-card rounded-xl p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Avg Mood</p>
                                    <p className="text-lg font-display text-foreground">{stats?.avgMood || '—'}/5</p>
                                  </div>
                                  <div className="bg-card rounded-xl p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Avg Energy</p>
                                    <p className="text-lg font-display text-foreground">{stats?.avgEnergy || '—'}/5</p>
                                  </div>
                                </div>

                                {/* Trend Chart */}
                                <div className="bg-card rounded-xl p-4">
                                  <h4 className="text-sm font-medium text-foreground mb-4">Mood & Energy Trend</h4>
                                  <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <LineChart 
                                        data={[...athleteCheckins].reverse().map(c => ({
                                          date: formatDate(c.checkin_date),
                                          mood: c.mood,
                                          energy: c.energy_level,
                                        }))}
                                      >
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                                        <YAxis domain={[1, 5]} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                                        <Tooltip
                                          contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                            fontSize: "12px",
                                          }}
                                        />
                                        <Line type="monotone" dataKey="mood" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 3 }} name="Mood" />
                                        <Line type="monotone" dataKey="energy" stroke="hsl(220 70% 50%)" strokeWidth={2} dot={{ r: 3 }} name="Energy" />
                                      </LineChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>

                                {/* Recent Check-ins Table */}
                                <div className="mt-4">
                                  <h4 className="text-sm font-medium text-foreground mb-3">Recent Check-ins</h4>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="border-b border-border">
                                          <th className="text-left py-2 px-2 text-muted-foreground font-medium">Date</th>
                                          <th className="text-left py-2 px-2 text-muted-foreground font-medium">Training</th>
                                          <th className="text-left py-2 px-2 text-muted-foreground font-medium">Mood</th>
                                          <th className="text-left py-2 px-2 text-muted-foreground font-medium">Energy</th>
                                          <th className="text-left py-2 px-2 text-muted-foreground font-medium">Sleep</th>
                                          <th className="text-left py-2 px-2 text-muted-foreground font-medium">Notes</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {athleteCheckins.slice(0, 7).map((c) => (
                                          <tr key={c.id} className="border-b border-border/50">
                                            <td className="py-2 px-2 text-foreground">{formatDate(c.checkin_date)}</td>
                                            <td className="py-2 px-2">
                                              {c.training_completed ? (
                                                <span className="text-green-600">{c.training_type || 'Yes'}</span>
                                              ) : (
                                                <span className="text-muted-foreground">Rest</span>
                                              )}
                                            </td>
                                            <td className="py-2 px-2">
                                              <div className="flex items-center gap-1">
                                                <div className={`w-2 h-2 rounded-full ${getMoodColor(c.mood)}`} />
                                                <span className="text-foreground">{c.mood || '—'}</span>
                                              </div>
                                            </td>
                                            <td className="py-2 px-2 text-foreground">{c.energy_level || '—'}</td>
                                            <td className="py-2 px-2 text-foreground">{c.sleep_hours ? `${c.sleep_hours}h` : '—'}</td>
                                            <td className="py-2 px-2 text-muted-foreground truncate max-w-[150px]">
                                              {c.notes || '—'}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="schedules">
                <CoachScheduleManager />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CoachDashboard;
