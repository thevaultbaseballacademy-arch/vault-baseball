import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import {
  MessageSquare, Calendar, FileText, Download, Share2,
  Video, Clock, CheckCircle2, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import CoachingMessenger from "@/components/coaching/CoachingMessenger";
import { useParentPortal } from "@/hooks/useParentPortal";
import { useSport } from "@/contexts/SportContext";
import { toast } from "sonner";

const ParentMessages = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"messages" | "conference" | "share">("messages");
  const [searchParams] = useSearchParams();
  const athleteId = searchParams.get("athlete");
  const { activeLinks, fetchAthleteData, athleteData } = useParentPortal();
  const { sport } = useSport();
  const isSoftball = sport === "softball";
  const accent = isSoftball ? "text-purple-400" : "text-primary";
  const accentBg = isSoftball ? "bg-purple-500/10" : "bg-primary/10";

  const selectedLink = athleteId
    ? activeLinks.find((l) => l.athlete_user_id === athleteId)
    : activeLinks[0];
  const currentAthleteId = selectedLink?.athlete_user_id;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id);
    });
  }, []);

  useEffect(() => {
    if (currentAthleteId && !athleteData[currentAthleteId]) fetchAthleteData(currentAthleteId);
  }, [currentAthleteId]);

  const data = currentAthleteId ? athleteData[currentAthleteId] : null;
  const profile = data?.profile;
  const recentLessons = data?.recent_lessons || [];

  const handleDownloadReport = () => {
    toast.success("Development report download started", { description: "Your PDF will be ready shortly." });
  };

  const handleShareProgress = () => {
    toast.success("Progress report link copied!", { description: "Share this link with family or recruiters." });
  };

  const tabs = [
    { key: "messages" as const, label: "Messages", icon: MessageSquare },
    { key: "conference" as const, label: "Conference", icon: Video },
    { key: "share" as const, label: "Share & Download", icon: Share2 },
  ];

  if (!userId) {
    return (
      <div className="p-6 lg:p-10 text-center py-20">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accentBg}`}>
          <MessageSquare className={`w-6 h-6 ${accent}`} />
        </div>
        <div>
          <h1 className="text-2xl font-display text-foreground">COMMUNICATION</h1>
          <p className="text-sm text-muted-foreground">Message coaches, schedule conferences, and share reports</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Direct Messages */}
      {activeTab === "messages" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl overflow-hidden h-[550px]">
          <CoachingMessenger userId={userId} />
        </motion.div>
      )}

      {/* Schedule Conference */}
      {activeTab === "conference" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-display text-foreground mb-4 flex items-center gap-2">
              <Video className={`w-4 h-4 ${accent}`} /> Schedule Parent-Coach Conference
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Request a dedicated session with your athlete's coach to discuss development progress, goals, and next steps.
            </p>
            <div className="space-y-3">
              <div className="p-4 bg-secondary rounded-xl">
                <p className="text-xs font-medium text-foreground mb-2">Conference Topics to Discuss:</p>
                <div className="grid grid-cols-2 gap-2">
                  {["Development progress", "Recruiting readiness", "Training plan adjustments", "Position development",
                    "Showcase preparation", "Academic-athletic balance", "Mental performance", "Long-term goals"].map((topic, i) => (
                    <label key={i} className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                      <input type="checkbox" className="rounded border-border" />
                      {topic}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 bg-secondary rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Preferred Format</p>
                  <div className="flex gap-2">
                    <button className={`flex-1 text-xs py-2 rounded-lg border transition-all ${accentBg} border-primary/20 text-foreground`}>
                      <Video className="w-3.5 h-3.5 mx-auto mb-1" /> Video Call
                    </button>
                    <button className="flex-1 text-xs py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-all">
                      <MessageSquare className="w-3.5 h-3.5 mx-auto mb-1" /> In-App
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-secondary rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Duration</p>
                  <div className="flex gap-2">
                    <button className={`flex-1 text-xs py-2 rounded-lg border transition-all ${accentBg} border-primary/20 text-foreground`}>15 min</button>
                    <button className="flex-1 text-xs py-2 rounded-lg border border-border text-muted-foreground">30 min</button>
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={() => toast.success("Conference request sent!", { description: "The coach will confirm a time within 24 hours." })}>
                <Send className="w-4 h-4 mr-2" /> Request Conference
              </Button>
            </div>
          </div>

          {/* Quick Tips */}
          <div className={`p-4 rounded-2xl border ${isSoftball ? "border-purple-500/20 bg-purple-500/5" : "border-primary/20 bg-primary/5"}`}>
            <p className={`text-xs font-bold ${accent} mb-2`}>💡 Conference Tips</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Come prepared with 2-3 specific questions</li>
              <li>• Review recent coach feedback before the call</li>
              <li>• Ask about specific metrics and what they mean for your athlete</li>
              <li>• Let the athlete be part of the conversation when possible</li>
            </ul>
          </div>
        </motion.div>
      )}

      {/* Share & Download */}
      {activeTab === "share" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Share Progress Report */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-display text-foreground mb-4 flex items-center gap-2">
              <Share2 className={`w-4 h-4 ${accent}`} /> Share Athlete Progress
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate a shareable link or download a PDF of your athlete's development report.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Button variant="outline" className="w-full" onClick={handleShareProgress}>
                <Share2 className="w-4 h-4 mr-2" /> Copy Share Link
              </Button>
              <Button className="w-full" onClick={handleDownloadReport}>
                <Download className="w-4 h-4 mr-2" /> Download PDF Report
              </Button>
            </div>
          </div>

          {/* Recent Reports Available */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-display text-foreground mb-4 flex items-center gap-2">
              <FileText className={`w-4 h-4 ${accent}`} /> Available Reports
            </h3>
            <div className="space-y-2">
              {[
                { name: "Development Progress Report", desc: "Overall development scores, KPI trends, and coach insights", icon: FileText },
                { name: "Recruiting Profile Export", desc: "Stats, academics, and verified metrics for college coaches", icon: Calendar },
                { name: "Training History", desc: "Session attendance, workout logs, and compliance data", icon: Clock },
              ].map((report, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                  <report.icon className={`w-4 h-4 ${accent} shrink-0`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{report.name}</p>
                    <p className="text-xs text-muted-foreground">{report.desc}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={handleDownloadReport}>
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Coach Feedback Snapshot */}
          {recentLessons.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Latest Coach Notes
              </h3>
              <div className="space-y-2">
                {recentLessons.slice(0, 3).map((lesson: any, i: number) => (
                  <div key={i} className="p-3 bg-secondary rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">
                      {new Date(lesson.created_at).toLocaleDateString()} — {lesson.lesson_focus || "Session"}
                    </p>
                    {lesson.ai_summary && (
                      <p className="text-xs text-foreground">{lesson.ai_summary}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ParentMessages;
