import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import { GraduationCap, Target, Trophy, School } from "lucide-react";
import { useParentPortal } from "@/hooks/useParentPortal";

const commitmentLabels: Record<string, { label: string; color: string }> = {
  uncommitted: { label: "Uncommitted", color: "text-muted-foreground" },
  verbal_commit: { label: "Verbal Commit", color: "text-green-500" },
  signed: { label: "Signed NLI", color: "text-primary" },
  enrolled: { label: "Enrolled", color: "text-primary" },
};

const ParentRecruiting = () => {
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
  const recruiting = data?.recruiting;

  if (!currentAthleteId) {
    return (
      <div className="p-6 lg:p-10 text-center py-20">
        <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">Link an athlete to view recruiting status.</p>
        <Link to="/parent" className="text-primary text-sm hover:underline mt-2 inline-block">Go to My Athletes</Link>
      </div>
    );
  }

  const commitInfo = commitmentLabels[recruiting?.commitment_status || "uncommitted"];

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-display text-foreground">RECRUITING STATUS</h1>
          <p className="text-sm text-muted-foreground">{profile?.display_name || "Athlete"}'s recruiting overview</p>
        </div>
      </div>

      {recruiting ? (
        <div className="space-y-6">
          {/* Commitment Status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Commitment Status</p>
                <p className={`text-2xl font-display ${commitInfo.color}`}>{commitInfo.label}</p>
                {recruiting.committed_school && (
                  <p className="text-sm text-foreground flex items-center gap-1 mt-1">
                    <School className="w-3.5 h-3.5" /> {recruiting.committed_school}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Academic & Targets */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {recruiting.gpa && (
              <div className="bg-card border border-border rounded-2xl p-6 text-center">
                <p className="text-3xl font-display text-foreground">{recruiting.gpa}</p>
                <p className="text-sm text-muted-foreground">GPA</p>
              </div>
            )}
            {recruiting.division_target && recruiting.division_target.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1">
                  <Target className="w-3 h-3" /> Target Divisions
                </p>
                <div className="flex flex-wrap gap-2">
                  {recruiting.division_target.map((div) => (
                    <span key={div} className="px-3 py-1.5 bg-green-500/10 text-green-500 rounded-lg text-sm font-medium">
                      {div}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No recruiting profile set up yet.</p>
          <p className="text-xs mt-1">Your athlete can build their recruiting profile in the Recruiting Hub.</p>
        </div>
      )}
    </div>
  );
};

export default ParentRecruiting;
