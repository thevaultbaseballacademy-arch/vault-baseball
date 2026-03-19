import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import { BookOpen, MessageSquare, CheckCircle2, AlertTriangle } from "lucide-react";
import { useParentPortal } from "@/hooks/useParentPortal";

const ParentLessons = () => {
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
  const lessons = data?.recent_lessons || [];
  const profile = data?.profile;

  if (!currentAthleteId) {
    return (
      <div className="p-6 lg:p-10 text-center py-20">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">Link an athlete to view lesson feedback.</p>
        <Link to="/parent" className="text-primary text-sm hover:underline mt-2 inline-block">Go to My Athletes</Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-display text-foreground">LESSON FEEDBACK</h1>
          <p className="text-sm text-muted-foreground">{profile?.display_name || "Athlete"}'s recent coaching sessions</p>
        </div>
      </div>

      {lessons.length > 0 ? (
        <div className="space-y-4">
          {lessons.map((lesson, i) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-display text-foreground">
                  {lesson.lesson_focus || "Training Session"}
                </p>
                <span className="text-xs text-muted-foreground">
                  {new Date(lesson.created_at).toLocaleDateString()}
                </span>
              </div>

              {lesson.ai_summary && (
                <div className="p-3 bg-primary/5 rounded-xl mb-3">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Coach Summary
                  </p>
                  <p className="text-sm text-foreground">{lesson.ai_summary}</p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                {lesson.strengths_observed && (
                  <div className="p-3 bg-green-500/5 rounded-xl">
                    <p className="text-xs text-green-500 mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Strengths
                    </p>
                    <p className="text-sm text-foreground">{lesson.strengths_observed}</p>
                  </div>
                )}
                {lesson.areas_for_improvement && (
                  <div className="p-3 bg-amber-500/5 rounded-xl">
                    <p className="text-xs text-amber-500 mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Areas to Improve
                    </p>
                    <p className="text-sm text-foreground">{lesson.areas_for_improvement}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No lesson feedback available yet.</p>
          <p className="text-xs mt-1">Feedback will appear here after coaching sessions.</p>
        </div>
      )}
    </div>
  );
};

export default ParentLessons;
