import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Loader2, Users, Shield, UserCheck, 
  Search, Plus, X, Check, BarChart3, Link2, Video, Award, Clock, FileText, Database, Trash2, Lightbulb, Activity, UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BroadcastPanel from "@/components/admin/BroadcastPanel";
import NotificationAnalytics from "@/components/admin/NotificationAnalytics";
import CoachAthleteAssignments from "@/components/admin/CoachAthleteAssignments";
import CourseVideoManager from "@/components/admin/CourseVideoManager";
import CertificationQuestionManager from "@/components/admin/CertificationQuestionManager";
import CertificationExpirationManager from "@/components/admin/CertificationExpirationManager";
import AuditLogViewer from "@/components/admin/AuditLogViewer";
import DataRetentionPanel from "@/components/admin/DataRetentionPanel";
import DeletionRequestsManager from "@/components/admin/DeletionRequestsManager";
import GDPRComplianceDashboard from "@/components/admin/GDPRComplianceDashboard";
import WeeklyTipsManager from "@/components/admin/WeeklyTipsManager";
import { SystemHealthDashboard } from "@/components/admin/SystemHealthDashboard";
import TeamWhitelistManager from "@/components/admin/TeamWhitelistManager";
import { CoachInviteManager } from "@/components/admin/CoachInviteManager";
import LeadsCustomersPanel from "@/components/admin/LeadsCustomersPanel";

interface Profile {
  user_id: string;
  email?: string; // Optional - not fetched to minimize data exposure
  display_name: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'coach' | 'athlete';
}

const ROLES = ['admin', 'coach', 'athlete'] as const;

const Admin = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("users");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      checkAdminRole(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate("/auth");
      }
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setIsAdmin(true);
        fetchData();
      }
      setLoading(false);
    } catch (error) {
      console.error('Error checking admin role:', error);
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [profilesRes, rolesRes] = await Promise.all([
        // Only select user_id and display_name - email is not needed for admin user list display
        supabase.from('profiles').select('user_id, display_name').order('display_name'),
        supabase.from('user_roles').select('id, user_id, role'),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      setProfiles(profilesRes.data || []);
      setUserRoles(rolesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    }
  };

  const getUserRoles = (userId: string) => {
    return userRoles.filter(r => r.user_id === userId);
  };

  const hasRole = (userId: string, role: string) => {
    return userRoles.some(r => r.user_id === userId && r.role === role);
  };

  const toggleRole = async (userId: string, role: 'admin' | 'coach' | 'athlete') => {
    setUpdatingRole(`${userId}-${role}`);
    
    try {
      const existingRole = userRoles.find(r => r.user_id === userId && r.role === role);
      
      if (existingRole) {
        // Remove role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('id', existingRole.id);
        
        if (error) throw error;
        
        setUserRoles(prev => prev.filter(r => r.id !== existingRole.id));
        toast({
          title: "Role removed",
          description: `Removed ${role} role from user`,
        });
      } else {
        // Add role
        const { data, error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role })
          .select()
          .single();
        
        if (error) throw error;
        
        setUserRoles(prev => [...prev, data]);
        toast({
          title: "Role assigned",
          description: `Assigned ${role} role to user`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(null);
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'coach': return UserCheck;
      default: return Users;
    }
  };

  const getRoleColor = (role: string, active: boolean) => {
    if (!active) return 'bg-secondary text-muted-foreground hover:bg-secondary/80';
    switch (role) {
      case 'admin': return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'coach': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      default: return 'bg-green-500/10 text-green-600 border-green-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-display text-foreground mb-2">Admin Access Required</h2>
              <p className="text-muted-foreground mb-6">
                This page is only available to administrators.
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
        <div className="container mx-auto px-4 max-w-6xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div>
              <h1 className="text-3xl md:text-4xl font-display text-foreground mb-1">
                ADMIN PANEL
              </h1>
              <p className="text-muted-foreground">Manage users, roles, and send notifications</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-accent" />
                  <span className="text-sm text-muted-foreground">Total Users</span>
                </div>
                <p className="text-2xl font-display text-foreground">{profiles.length}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-muted-foreground">Admins</span>
                </div>
                <p className="text-2xl font-display text-foreground">
                  {userRoles.filter(r => r.role === 'admin').length}
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Coaches</span>
                </div>
                <p className="text-2xl font-display text-foreground">
                  {userRoles.filter(r => r.role === 'coach').length}
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Athletes</span>
                </div>
                <p className="text-2xl font-display text-foreground">
                  {userRoles.filter(r => r.role === 'athlete').length}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex flex-wrap w-full max-w-6xl gap-1">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="team" className="flex items-center gap-1">
                  <UserPlus className="w-3 h-3" />
                  Team
                </TabsTrigger>
                <TabsTrigger value="coach-invites" className="flex items-center gap-1">
                  <Link2 className="w-3 h-3" />
                  Coach Invites
                </TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                <TabsTrigger value="tips">Tips</TabsTrigger>
                <TabsTrigger value="certifications">Questions</TabsTrigger>
                <TabsTrigger value="expirations">Expirations</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
                <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="audit">Audit</TabsTrigger>
                <TabsTrigger value="retention">Retention</TabsTrigger>
                <TabsTrigger value="deletion">Deletion</TabsTrigger>
                <TabsTrigger value="gdpr">GDPR</TabsTrigger>
                <TabsTrigger value="health" className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Health
                </TabsTrigger>
                <TabsTrigger value="leads" className="flex items-center gap-1">
                  <UserPlus className="w-3 h-3" />
                  Leads & CRM
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="mt-6 space-y-6">
                {/* Search */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground w-full"
                  />
                </div>

                {/* Users List */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <h2 className="text-lg font-display text-foreground">Users ({filteredProfiles.length})</h2>
                  </div>

                  {filteredProfiles.length === 0 ? (
                    <div className="p-8 text-center">
                      <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No users found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                      {filteredProfiles.map((profile) => {
                        const roles = getUserRoles(profile.user_id);
                        
                        return (
                          <div 
                            key={profile.user_id}
                            className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                <span className="text-sm font-medium text-accent">
                                  {profile.display_name?.charAt(0).toUpperCase() || '?'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {profile.display_name || 'Unknown'}
                                </p>
                                <p className="text-sm text-muted-foreground">{profile.email}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {ROLES.map((role) => {
                                const active = hasRole(profile.user_id, role);
                                const isUpdating = updatingRole === `${profile.user_id}-${role}`;
                                const Icon = getRoleIcon(role);
                                
                                return (
                                  <button
                                    key={role}
                                    onClick={() => toggleRole(profile.user_id, role)}
                                    disabled={isUpdating}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${getRoleColor(role, active)} ${active ? 'border' : 'border-transparent'}`}
                                  >
                                    {isUpdating ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : active ? (
                                      <Check className="w-3 h-3" />
                                    ) : (
                                      <Plus className="w-3 h-3" />
                                    )}
                                    <span className="capitalize">{role}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Help Text */}
                <div className="bg-secondary/50 rounded-xl p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-2">Role Permissions:</p>
                  <ul className="space-y-1">
                    <li><span className="text-red-600 font-medium">Admin</span> — Full access to manage users and roles</li>
                    <li><span className="text-blue-600 font-medium">Coach</span> — View all athletes' check-ins and progress</li>
                    <li><span className="text-green-600 font-medium">Athlete</span> — Standard user access (for tagging purposes)</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="team" className="mt-6">
                <TeamWhitelistManager />
              </TabsContent>

              <TabsContent value="coach-invites" className="mt-6">
                <CoachInviteManager />
              </TabsContent>

              <TabsContent value="assignments" className="mt-6">
                <CoachAthleteAssignments />
              </TabsContent>

              <TabsContent value="tips" className="mt-6">
                <WeeklyTipsManager />
              </TabsContent>

              <TabsContent value="certifications" className="mt-6">
                <CertificationQuestionManager />
              </TabsContent>

              <TabsContent value="expirations" className="mt-6">
                <CertificationExpirationManager />
              </TabsContent>

              <TabsContent value="videos" className="mt-6">
                <CourseVideoManager />
              </TabsContent>

              <TabsContent value="broadcast" className="mt-6">
                <BroadcastPanel userCount={profiles.length} />
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <NotificationAnalytics />
              </TabsContent>

              <TabsContent value="audit" className="mt-6">
                <AuditLogViewer />
              </TabsContent>

              <TabsContent value="retention" className="mt-6">
                <DataRetentionPanel />
              </TabsContent>

              <TabsContent value="deletion" className="mt-6">
                <DeletionRequestsManager />
              </TabsContent>

              <TabsContent value="gdpr" className="mt-6">
                <GDPRComplianceDashboard />
              </TabsContent>

              <TabsContent value="health" className="mt-6">
                <SystemHealthDashboard />
              </TabsContent>

              <TabsContent value="leads" className="mt-6">
                <LeadsCustomersPanel />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
