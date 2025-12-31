import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Check, X, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Athlete {
  user_id: string;
  display_name: string;
  email: string;
}

interface Assignment {
  id: string;
  athlete_user_id: string;
  is_active: boolean;
}

interface ScheduleAssignmentProps {
  scheduleId: string;
  scheduleName: string;
  onClose: () => void;
}

export function ScheduleAssignment({ scheduleId, scheduleName, onClose }: ScheduleAssignmentProps) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [scheduleId]);

  const fetchData = async () => {
    try {
      // Fetch all athletes (profiles)
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, display_name, email")
        .order("display_name");

      if (profilesError) throw profilesError;

      // Fetch current assignments for this schedule
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("schedule_assignments")
        .select("id, athlete_user_id, is_active")
        .eq("schedule_id", scheduleId);

      if (assignmentsError) throw assignmentsError;

      setAthletes(profilesData || []);
      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load athletes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isAssigned = (userId: string) => {
    return assignments.some(a => a.athlete_user_id === userId && a.is_active);
  };

  const toggleAssignment = async (athleteId: string) => {
    setSaving(athleteId);
    try {
      const existingAssignment = assignments.find(a => a.athlete_user_id === athleteId);
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) throw new Error("Not authenticated");

      if (existingAssignment) {
        // Toggle existing assignment
        const { error } = await supabase
          .from("schedule_assignments")
          .update({ is_active: !existingAssignment.is_active })
          .eq("id", existingAssignment.id);

        if (error) throw error;

        setAssignments(prev => prev.map(a => 
          a.id === existingAssignment.id 
            ? { ...a, is_active: !a.is_active } 
            : a
        ));
      } else {
        // Create new assignment
        const { data, error } = await supabase
          .from("schedule_assignments")
          .insert({
            schedule_id: scheduleId,
            athlete_user_id: athleteId,
            assigned_by: userData.user.id,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;

        setAssignments(prev => [...prev, data]);
      }

      toast({
        title: isAssigned(athleteId) ? "Unassigned" : "Assigned",
        description: isAssigned(athleteId) 
          ? "Schedule removed from athlete"
          : "Schedule assigned to athlete",
      });
    } catch (error) {
      console.error("Error toggling assignment:", error);
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const assignedCount = assignments.filter(a => a.is_active).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg text-foreground">Assign Athletes</h3>
          <p className="text-sm text-muted-foreground">
            {scheduleName} • {assignedCount} assigned
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          Done
        </Button>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {athletes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No athletes found</p>
          </div>
        ) : (
          athletes.map(athlete => {
            const assigned = isAssigned(athlete.user_id);
            const isSaving = saving === athlete.user_id;

            return (
              <motion.button
                key={athlete.user_id}
                onClick={() => toggleAssignment(athlete.user_id)}
                disabled={isSaving}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  assigned
                    ? "bg-accent/10 border-accent"
                    : "bg-secondary border-border hover:border-accent/50"
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {athlete.display_name?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">
                      {athlete.display_name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">{athlete.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {assigned && (
                    <span className="text-xs text-accent flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Assigned
                    </span>
                  )}
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : assigned ? (
                    <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                      <Check className="w-3 h-3 text-accent-foreground" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}
