import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Calendar, Clock, CalendarPlus, ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LessonRow {
  id: string;
  coach_user_id: string;
  athlete_user_id: string;
  scheduled_at: string;
  duration_minutes: number;
  video_call_link: string | null;
  status: string;
  notes: string | null;
}

function generateICS(lesson: LessonRow, otherName: string): string {
  const start = new Date(lesson.scheduled_at);
  const end = new Date(start.getTime() + lesson.duration_minutes * 60000);
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Vault Baseball//Lessons//EN",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Vault Lesson with ${otherName}`,
    `DESCRIPTION:${lesson.notes || "Remote coaching session"}${lesson.video_call_link ? "\\nJoin: " + lesson.video_call_link : ""}`,
    lesson.video_call_link ? `URL:${lesson.video_call_link}` : "",
    `UID:${lesson.id}@vault-baseball.com`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Vault lesson in 15 minutes",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

function downloadICS(lesson: LessonRow, otherName: string) {
  const ics = generateICS(lesson, otherName);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vault-lesson-${new Date(lesson.scheduled_at).toISOString().split("T")[0]}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

interface UpcomingLessonsProps {
  userId: string;
}

const UpcomingLessons = ({ userId }: UpcomingLessonsProps) => {
  const [lessons, setLessons] = useState<(LessonRow & { other_name: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchLessons();
  }, [userId]);

  const fetchLessons = async () => {
    const now = new Date().toISOString();
    const { data } = await (supabase.from("remote_lessons" as any) as any)
      .select("*")
      .or(`coach_user_id.eq.${userId},athlete_user_id.eq.${userId}`)
      .gte("scheduled_at", now)
      .neq("status", "cancelled")
      .order("scheduled_at", { ascending: true })
      .limit(5);

    if (!data?.length) {
      setLessons([]);
      setLoading(false);
      return;
    }

    // Get the "other person" names
    const otherIds = [
      ...new Set(
        (data as LessonRow[]).map((l) =>
          l.coach_user_id === userId ? l.athlete_user_id : l.coach_user_id
        )
      ),
    ];
    const { data: profiles } = await supabase.rpc("get_public_profiles_by_ids", {
      user_ids: otherIds,
    });
    const nameMap = new Map(
      (profiles || []).map((p: any) => [p.user_id, p.display_name])
    );

    setLessons(
      (data as LessonRow[]).map((l) => ({
        ...l,
        other_name:
          nameMap.get(
            l.coach_user_id === userId ? l.athlete_user_id : l.coach_user_id
          ) || "Vault Coach",
      }))
    );
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (lessons.length === 0) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            UPCOMING LESSONS
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/remote-lessons")}
            className="text-xs"
          >
            View All <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {lessons.map((lesson) => {
          const date = new Date(lesson.scheduled_at);
          const isToday =
            date.toDateString() === new Date().toDateString();
          const isTomorrow =
            date.toDateString() ===
            new Date(Date.now() + 86400000).toDateString();

          return (
            <div
              key={lesson.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isToday
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {lesson.other_name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-3 h-3" />
                      {isToday
                        ? "Today"
                        : isTomorrow
                        ? "Tomorrow"
                        : date.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {date.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {isToday && (
                  <Badge className="bg-primary/10 text-primary text-[10px]">
                    TODAY
                  </Badge>
                )}
                {lesson.video_call_link && (
                  <Button variant="vault" size="sm" asChild className="h-7 text-xs">
                    <a
                      href={lesson.video_call_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join
                    </a>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    downloadICS(lesson, lesson.other_name);
                    toast({
                      title: "Calendar event downloaded",
                      description:
                        "Open the .ics file to add it to your calendar app.",
                    });
                  }}
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default UpcomingLessons;
