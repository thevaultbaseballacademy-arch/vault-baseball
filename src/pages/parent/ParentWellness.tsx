import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import { Activity, Zap, Moon, Heart, Frown } from "lucide-react";
import { useParentPortal } from "@/hooks/useParentPortal";

const moodEmojis = ["😞", "😕", "😐", "🙂", "😊"];
const energyColors = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-green-400", "bg-green-500"];

const ParentWellness = () => {
  const [searchParams] = useSearchParams();
  const athleteId = searchParams.get("athlete");
  const { activeLinks, fetchAthleteData, athleteData } = useParentPortal();

  const selectedLink = athleteId
    ? activeLinks.find((l) => l.athlete_user_id === athleteId)
    : activeLinks[0];

  const currentAthleteId = selectedLink?.athlete_user_id;

  useEffect(() => {
    if (currentAthleteId && !athleteData[currentAthleteId]) {
      fetchAthleteData(currentAthleteId);
    }
  }, [currentAthleteId]);

  const data = currentAthleteId ? athleteData[currentAthleteId] : null;
  const profile = data?.profile;
  const checkins = data?.checkins || [];

  if (!currentAthleteId) {
    return (
      <div className="p-6 lg:p-10 text-center py-20">
        <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">Link an athlete to view wellness data.</p>
        <Link to="/parent" className="text-primary text-sm hover:underline mt-2 inline-block">Go to My Athletes</Link>
      </div>
    );
  }

  const trainingDays = checkins.filter((c) => c.training_completed).length;
  const avgEnergy = checkins.length > 0
    ? Math.round(checkins.filter((c) => c.energy_level).reduce((sum, c) => sum + (c.energy_level || 0), 0) / checkins.filter((c) => c.energy_level).length)
    : 0;
  const avgMood = checkins.length > 0
    ? Math.round(checkins.filter((c) => c.mood).reduce((sum, c) => sum + (c.mood || 0), 0) / checkins.filter((c) => c.mood).length)
    : 0;
  const highSoreness = checkins.filter((c) => (c.soreness_level || 0) >= 4).length;

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
          <Activity className="w-6 h-6 text-rose-500" />
        </div>
        <div>
          <h1 className="text-2xl font-display text-foreground">WELLNESS CHECK</h1>
          <p className="text-sm text-muted-foreground">{profile?.display_name || "Athlete"}'s last 14 days</p>
        </div>
      </div>

      {/* Summary Cards */}
      {checkins.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-2xl p-4 text-center">
              <Zap className="w-5 h-5 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-display text-foreground">{avgEnergy}/5</p>
              <p className="text-xs text-muted-foreground">Avg Energy</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}
              className="bg-card border border-border rounded-2xl p-4 text-center">
              <span className="text-2xl block mb-1">{avgMood > 0 ? moodEmojis[Math.min(avgMood - 1, 4)] : "—"}</span>
              <p className="text-2xl font-display text-foreground">{avgMood}/5</p>
              <p className="text-xs text-muted-foreground">Avg Mood</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-2xl p-4 text-center">
              <Heart className="w-5 h-5 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-display text-foreground">{trainingDays}/{checkins.length}</p>
              <p className="text-xs text-muted-foreground">Training Days</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
              className={`bg-card border rounded-2xl p-4 text-center ${highSoreness > 3 ? "border-red-500/30" : "border-border"}`}>
              <Frown className={`w-5 h-5 mx-auto mb-2 ${highSoreness > 3 ? "text-red-500" : "text-muted-foreground"}`} />
              <p className="text-2xl font-display text-foreground">{highSoreness}</p>
              <p className="text-xs text-muted-foreground">High Soreness Days</p>
            </motion.div>
          </div>

          {/* Daily Log */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-display text-foreground mb-4">Daily Check-ins</h3>
            <div className="space-y-2">
              {checkins.map((checkin, i) => (
                <motion.div
                  key={checkin.checkin_date}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3 bg-secondary rounded-xl"
                >
                  <span className="text-xs text-muted-foreground w-20 shrink-0">
                    {new Date(checkin.checkin_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <div className="flex items-center gap-2 flex-1">
                    {checkin.energy_level && (
                      <div className="flex items-center gap-1" title="Energy">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <div key={n} className={`w-2 h-2 rounded-full ${n <= checkin.energy_level! ? energyColors[Math.min(checkin.energy_level! - 1, 4)] : "bg-border"}`} />
                          ))}
                        </div>
                      </div>
                    )}
                    {checkin.mood && (
                      <span className="text-sm" title="Mood">{moodEmojis[Math.min(checkin.mood - 1, 4)]}</span>
                    )}
                    {checkin.soreness_level && checkin.soreness_level >= 4 && (
                      <span className="text-xs px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded">Sore</span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    checkin.training_completed ? "bg-green-500/10 text-green-500" : "bg-secondary text-muted-foreground"
                  }`}>
                    {checkin.training_completed ? "Trained" : "Rest"}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No check-in data available yet.</p>
          <p className="text-xs mt-1">Wellness data appears once your athlete starts daily check-ins.</p>
        </div>
      )}
    </div>
  );
};

export default ParentWellness;
