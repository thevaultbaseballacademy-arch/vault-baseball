import { useState, useEffect } from "react";
import { Loader2, UserCheck, Users, Link2, Unlink, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Profile {
  user_id: string;
  email: string;
  display_name: string;
}

interface UserRole {
  user_id: string;
  role: 'admin' | 'coach' | 'athlete';
}

interface Assignment {
  id: string;
  coach_user_id: string;
  athlete_user_id: string;
  created_at: string;
}

const CoachAthleteAssignments = () => {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<string>("");
  const [selectedAthlete, setSelectedAthlete] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [filterCoach, setFilterCoach] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profilesRes, rolesRes, assignmentsRes] = await Promise.all([
        supabase.from('profiles').select('user_id, email, display_name').order('display_name'),
        supabase.from('user_roles').select('user_id, role'),
        supabase.from('coach_athlete_assignments').select('*').order('created_at', { ascending: false }),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;
      if (assignmentsRes.error) throw assignmentsRes.error;

      setProfiles(profilesRes.data || []);
      setUserRoles(rolesRes.data || []);
      setAssignments(assignmentsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load assignment data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const coaches = profiles.filter(p => 
    userRoles.some(r => r.user_id === p.user_id && r.role === 'coach')
  );

  const athletes = profiles.filter(p => 
    userRoles.some(r => r.user_id === p.user_id && r.role === 'athlete')
  );

  const getProfileName = (userId: string) => {
    const profile = profiles.find(p => p.user_id === userId);
    return profile?.display_name || profile?.email || 'Unknown';
  };

  const isAlreadyAssigned = (coachId: string, athleteId: string) => {
    return assignments.some(a => a.coach_user_id === coachId && a.athlete_user_id === athleteId);
  };

  const handleAssign = async () => {
    if (!selectedCoach || !selectedAthlete) {
      toast({
        title: "Select both users",
        description: "Please select a coach and an athlete",
        variant: "destructive",
      });
      return;
    }

    if (isAlreadyAssigned(selectedCoach, selectedAthlete)) {
      toast({
        title: "Already assigned",
        description: "This athlete is already assigned to this coach",
        variant: "destructive",
      });
      return;
    }

    setAssigning(true);
    try {
      const { data, error } = await supabase
        .from('coach_athlete_assignments')
        .insert({
          coach_user_id: selectedCoach,
          athlete_user_id: selectedAthlete,
        })
        .select()
        .single();

      if (error) throw error;

      setAssignments(prev => [data, ...prev]);
      setSelectedCoach("");
      setSelectedAthlete("");
      toast({
        title: "Assignment created",
        description: `${getProfileName(selectedAthlete)} assigned to ${getProfileName(selectedCoach)}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
        variant: "destructive",
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (assignmentId: string) => {
    setRemovingId(assignmentId);
    try {
      const { error } = await supabase
        .from('coach_athlete_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      toast({
        title: "Assignment removed",
        description: "The coach-athlete assignment has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove assignment",
        variant: "destructive",
      });
    } finally {
      setRemovingId(null);
    }
  };

  const filteredAssignments = filterCoach === "all" 
    ? assignments 
    : assignments.filter(a => a.coach_user_id === filterCoach);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Assignment */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-display text-foreground mb-4 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-accent" />
          Create Assignment
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Select Coach</label>
            <Select value={selectedCoach} onValueChange={setSelectedCoach}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a coach..." />
              </SelectTrigger>
              <SelectContent>
                {coaches.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No coaches found</div>
                ) : (
                  coaches.map(coach => (
                    <SelectItem key={coach.user_id} value={coach.user_id}>
                      {coach.display_name || coach.email}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Select Athlete</label>
            <Select value={selectedAthlete} onValueChange={setSelectedAthlete}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an athlete..." />
              </SelectTrigger>
              <SelectContent>
                {athletes.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No athletes found</div>
                ) : (
                  athletes.map(athlete => (
                    <SelectItem key={athlete.user_id} value={athlete.user_id}>
                      {athlete.display_name || athlete.email}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleAssign}
              disabled={assigning || !selectedCoach || !selectedAthlete}
              className="w-full"
              variant="vault"
            >
              {assigning ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Link2 className="w-4 h-4 mr-2" />
              )}
              Assign
            </Button>
          </div>
        </div>

        {coaches.length === 0 && (
          <p className="text-sm text-muted-foreground mt-4">
            No coaches available. Assign the "Coach" role to users in the User Management tab first.
          </p>
        )}
      </div>

      {/* Current Assignments */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-display text-foreground flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-500" />
            Current Assignments ({filteredAssignments.length})
          </h3>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filter by coach:</span>
            <Select value={filterCoach} onValueChange={setFilterCoach}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coaches</SelectItem>
                {coaches.map(coach => (
                  <SelectItem key={coach.user_id} value={coach.user_id}>
                    {coach.display_name || coach.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No assignments found</p>
          </div>
        ) : (
          <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
            {filteredAssignments.map((assignment) => (
              <div 
                key={assignment.id}
                className="p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="font-medium text-foreground truncate">
                      {getProfileName(assignment.coach_user_id)}
                    </span>
                  </div>
                  
                  <div className="text-muted-foreground px-2">→</div>
                  
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="font-medium text-foreground truncate">
                      {getProfileName(assignment.athlete_user_id)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(assignment.id)}
                  disabled={removingId === assignment.id}
                  className="text-muted-foreground hover:text-destructive flex-shrink-0"
                >
                  {removingId === assignment.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Unlink className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-secondary/50 rounded-xl p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-2">About Coach-Athlete Assignments:</p>
        <ul className="space-y-1">
          <li>• Coaches can only view check-ins and health data for their assigned athletes</li>
          <li>• Athletes can see which coaches have been assigned to them</li>
          <li>• One athlete can be assigned to multiple coaches</li>
        </ul>
      </div>
    </div>
  );
};

export default CoachAthleteAssignments;
