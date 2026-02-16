import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  UserCheck, Loader2, ArrowLeft, Shield, CheckCircle, Clock,
  Briefcase, Award, MessageSquare, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CoachRegister = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [isAlreadyCoach, setIsAlreadyCoach] = useState(false);
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);
  const [inviteTokenId, setInviteTokenId] = useState<string | null>(null);

  // Form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth", { state: { from: { pathname: `/coach-register${inviteToken ? `?invite=${inviteToken}` : ""}` } } });
        return;
      }
      setUser(session.user);
      setEmail(session.user.email || "");
      init(session.user.id);
    });
  }, [navigate]);

  const init = async (userId: string) => {
    try {
      // Check if already a coach
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "coach")
        .maybeSingle();

      if (roleData) {
        setIsAlreadyCoach(true);
        setLoading(false);
        return;
      }

      // Check for existing request
      const { data: reqData } = await supabase
        .from("coach_registration_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (reqData) setExistingRequest(reqData);

      // Validate invite token if present
      if (inviteToken) {
        const { data: tokenData } = await supabase
          .from("coach_invite_tokens")
          .select("*")
          .eq("token", inviteToken)
          .eq("is_active", true)
          .maybeSingle();

        if (tokenData && tokenData.used_count < (tokenData.max_uses || 999)) {
          const notExpired = !tokenData.expires_at || new Date(tokenData.expires_at) > new Date();
          setInviteValid(notExpired);
          if (notExpired) setInviteTokenId(tokenData.id);
        } else {
          setInviteValid(false);
        }
      }

      // Pre-fill name from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", userId)
        .maybeSingle();

      if (profile?.display_name) setFullName(profile.display_name);
    } catch (error) {
      console.error("Error initializing:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      // If valid invite token, auto-approve
      if (inviteValid && inviteTokenId) {
        // Insert request as approved
        const { error: reqError } = await supabase
          .from("coach_registration_requests")
          .insert({
            user_id: user.id,
            full_name: fullName,
            email,
            organization: organization || null,
            experience_years: experienceYears ? parseInt(experienceYears) : null,
            specialization: specialization || null,
            message: message || null,
            invite_token_id: inviteTokenId,
            status: "approved",
            reviewed_at: new Date().toISOString(),
          });

        if (reqError) throw reqError;

        // Auto-assign coach role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: user.id, role: "coach" });

        if (roleError) throw roleError;

        // Increment invite token usage
        await supabase.rpc("increment_invite_usage" as any, { token_id: inviteTokenId });

        // Create onboarding record
        await supabase
          .from("coach_onboarding")
          .insert({ user_id: user.id });

        toast({
          title: "Welcome, Coach!",
          description: "Your coach access has been activated. Let's get you set up.",
        });

        navigate("/coach-onboarding");
        return;
      }

      // Otherwise submit as pending request
      const { error } = await supabase
        .from("coach_registration_requests")
        .insert({
          user_id: user.id,
          full_name: fullName,
          email,
          organization: organization || null,
          experience_years: experienceYears ? parseInt(experienceYears) : null,
          specialization: specialization || null,
          message: message || null,
        });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "An admin will review your request shortly.",
      });

      setExistingRequest({ status: "pending" });
    } catch (error: any) {
      console.error("Error submitting:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
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
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-accent" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display text-foreground mb-2">
                BECOME A VAULT COACH
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Join the VAULT coaching network and get access to powerful tools for managing your athletes.
              </p>
              {inviteValid && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Invite link verified — instant access upon registration
                </div>
              )}
              {inviteValid === false && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm">
                  Invite link is invalid or expired
                </div>
              )}
            </div>

            {/* Already a coach */}
            {isAlreadyCoach && (
              <div className="bg-card border border-accent/30 rounded-2xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-accent mx-auto mb-4" />
                <h2 className="text-xl font-display text-foreground mb-2">You're Already a Coach!</h2>
                <p className="text-muted-foreground mb-6">
                  You already have coach access. Head to your dashboard to get started.
                </p>
                <Button variant="vault" onClick={() => navigate("/coach")}>
                  Go to Coach Dashboard
                </Button>
              </div>
            )}

            {/* Existing pending request */}
            {existingRequest && !isAlreadyCoach && (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                {existingRequest.status === "pending" ? (
                  <>
                    <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-display text-foreground mb-2">Application Pending</h2>
                    <p className="text-muted-foreground mb-6">
                      Your coach application is being reviewed. You'll be notified once approved.
                    </p>
                  </>
                ) : existingRequest.status === "rejected" ? (
                  <>
                    <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-display text-foreground mb-2">Application Not Approved</h2>
                    <p className="text-muted-foreground mb-6">
                      Your previous application was not approved. Contact support for more info.
                    </p>
                  </>
                ) : null}
                <Button variant="ghost" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
              </div>
            )}

            {/* Registration form */}
            {!isAlreadyCoach && !existingRequest && (
              <>
                {/* Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <Users className="w-6 h-6 text-accent mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Athlete Management</p>
                    <p className="text-xs text-muted-foreground">Track check-ins, KPIs & progress</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <Award className="w-6 h-6 text-accent mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Certifications</p>
                    <p className="text-xs text-muted-foreground">Get VAULT verified credentials</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <Briefcase className="w-6 h-6 text-accent mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Schedule Builder</p>
                    <p className="text-xs text-muted-foreground">Create & assign training programs</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Coach John Smith"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="coach@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization / Team</Label>
                    <Input
                      id="organization"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Elite Baseball Academy"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years Coaching</Label>
                      <Select value={experienceYears} onValueChange={setExperienceYears}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1-2 years</SelectItem>
                          <SelectItem value="3">3-5 years</SelectItem>
                          <SelectItem value="6">6-10 years</SelectItem>
                          <SelectItem value="11">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Select value={specialization} onValueChange={setSpecialization}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hitting">Hitting</SelectItem>
                          <SelectItem value="pitching">Pitching</SelectItem>
                          <SelectItem value="fielding">Fielding</SelectItem>
                          <SelectItem value="strength">Strength & Conditioning</SelectItem>
                          <SelectItem value="general">General / All-Around</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Why do you want to coach on VAULT? (Optional)</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your coaching philosophy and goals..."
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="vault"
                    size="lg"
                    className="w-full"
                    disabled={submitting || !fullName || !email}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : inviteValid ? (
                      "Activate Coach Access"
                    ) : (
                      "Submit Application"
                    )}
                  </Button>

                  {!inviteValid && (
                    <p className="text-xs text-muted-foreground text-center">
                      Applications are typically reviewed within 24-48 hours.
                    </p>
                  )}
                </form>
              </>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CoachRegister;
