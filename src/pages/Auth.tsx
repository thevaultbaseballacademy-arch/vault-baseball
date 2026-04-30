import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, User, Loader2, Eye, EyeOff, ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import MFAVerify from "@/components/auth/MFAVerify";
import LegalAgreements from "@/components/auth/LegalAgreements";
import RoleSelector from "@/components/auth/RoleSelector";
import SportSelector from "@/components/auth/SportSelector";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { SportType } from "@/lib/sportTypes";
import { lovable } from "@/integrations/lovable";
import vaultLogo from "@/assets/vault-logo-new.webp";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
});

type UserRole = "athlete" | "coach" | "parent";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("athlete");
  const [sportType, setSportType] = useState<SportType>("baseball");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const [legalAgreed, setLegalAgreed] = useState(false);
  
  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaUserId, setMfaUserId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { recordSession } = useSessionManagement();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) checkMFAStatus(session);
    });
  }, []);

  const checkMFAStatus = async (session: any) => {
    try {
      const { data: { currentLevel } } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (currentLevel === "aal2") {
        await routeByRole(session.user.id);
      } else {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const verifiedFactors = factors?.totp?.filter(f => f.status === "verified") || [];
        if (verifiedFactors.length > 0) {
          setMfaRequired(true);
          setMfaFactorId(verifiedFactors[0].id);
          setMfaUserId(session.user.id);
        } else {
          await routeByRole(session.user.id);
        }
      }
    } catch (error) {
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  };

  /** Race a promise against a timeout. Returns null on timeout/error so callers never hang. */
  const withTimeout = <T,>(p: Promise<T>, ms: number, label: string): Promise<T | null> =>
    Promise.race([
      p.catch((e) => {
        console.warn(`[auth] ${label} failed:`, e);
        return null as any;
      }),
      new Promise<null>((resolve) =>
        setTimeout(() => {
          console.warn(`[auth] ${label} timed out after ${ms}ms`);
          resolve(null);
        }, ms)
      ),
    ]);

  /** Route user to the correct dashboard based on their role */
  const routeByRole = async (userId: string) => {
    const from = (location.state as any)?.from?.pathname;
    if (from && from !== "/auth") {
      navigate(from, { replace: true });
      return;
    }

    // Check user_roles table for role — bounded so a stalled query can't hang login
    const result = await withTimeout(
      Promise.resolve(supabase.from("user_roles").select("role").eq("user_id", userId)),
      5000,
      "user_roles lookup"
    );

    const userRoles = (result as any)?.data?.map((r: any) => r.role) || [];

    if (userRoles.includes("admin")) {
      navigate("/admin", { replace: true });
    } else if (userRoles.includes("coach")) {
      navigate("/coach-dashboard", { replace: true });
    } else {
      // Safe default — Dashboard further routes based on profile/role if needed
      navigate("/dashboard", { replace: true });
    }
  };

  const validateForm = () => {
    try {
      authSchema.parse({ email, password, name: isLogin ? undefined : name });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: typeof errors = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof typeof errors;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Fire-and-forget telemetry — never block navigation
        recordSession().catch((e) => console.warn("[auth] recordSession failed:", e));
        toast({ title: "Welcome back!", description: "You're signed in." });

        // Navigate immediately; MFA check runs in background and only intervenes if needed.
        if (data.user) {
          const userId = data.user.id;
          // Kick off MFA check in parallel — if a verified factor exists, prompt for it.
          // Tight 1.5s budget so a stalled GoTrue call cannot delay anything visible.
          withTimeout(
            Promise.resolve(supabase.auth.mfa.listFactors()),
            1500,
            "mfa.listFactors"
          ).then((factorsRes: any) => {
            const verifiedFactors =
              factorsRes?.data?.totp?.filter((f: any) => f.status === "verified") || [];
            if (verifiedFactors.length > 0) {
              setMfaRequired(true);
              setMfaFactorId(verifiedFactors[0].id);
              setMfaUserId(userId);
            }
          });
          await routeByRole(userId);
        }
      } else {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { full_name: name, display_name: name, signup_role: role, sport_type: sportType },
          },
        });
        if (error) throw error;

        // If user was auto-confirmed (e.g. in dev), assign role immediately
        if (signUpData.user && signUpData.session) {
          await assignRole(signUpData.user.id, role);
          // Update sport_type on the profile
          await supabase.from('profiles').update({ sport_type: sportType } as any).eq('user_id', signUpData.user.id);
          await recordSession();
          toast({ title: "Account created!", description: "Welcome to the Vault." });
          await routeByRole(signUpData.user.id);
        } else {
          toast({ title: "Account created!", description: "Check your email to verify, then sign in." });
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      let message = error.message || "An error occurred";
      if (error.message?.includes("User already registered")) {
        message = "This email is already registered. Please sign in instead.";
      } else if (error.message?.includes("Invalid login credentials")) {
        message = "Invalid email or password. Please try again.";
      } else if (error.message?.includes("Email not confirmed")) {
        message = "Please confirm your email before signing in.";
      }
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, selectedRole: UserRole) => {
    try {
      // Parent role maps to athlete in the DB enum since parent is not in app_role
      const dbRole = selectedRole === "coach" ? "coach" as const : "athlete" as const;
      await supabase.from("user_roles").upsert(
        [{ user_id: userId, role: dbRole }],
        { onConflict: "user_id,role" }
      );
    } catch (err) {
      console.error("Error assigning role:", err);
    }
  };

  const handleMFASuccess = async () => {
    await recordSession();
    toast({ title: "Welcome back!", description: "You're signed in." });
    if (mfaUserId) {
      await routeByRole(mfaUserId);
    }
  };

  const handleMFACancel = async () => {
    await supabase.auth.signOut();
    setMfaRequired(false);
    setMfaUserId(null);
    setMfaFactorId(null);
  };

  if (mfaRequired && mfaFactorId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute top-6 left-1/2 -translate-x-1/2">
          <button onClick={() => navigate("/")} className="flex items-center">
            <img src={vaultLogo} alt="Vault Baseball" className="h-12 w-auto" />
          </button>
        </div>
        <MFAVerify
          factorId={mfaFactorId}
          userId={mfaUserId || ""}
          onSuccess={handleMFASuccess}
          onCancel={handleMFACancel}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <button onClick={() => navigate("/")} className="flex items-center">
            <img src={vaultLogo} alt="Vault Baseball" className="h-14 w-auto" />
          </button>
        </div>

        {/* Toggle */}
        <div className="flex bg-secondary rounded-xl p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              isLogin ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              !isLogin ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          <div className="text-center mb-5">
            <h1 className="font-display text-2xl text-foreground">
              {isLogin ? "WELCOME BACK" : "JOIN THE VAULT"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLogin ? "Sign in to your account" : "Start your training journey"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <RoleSelector value={role} onChange={setRole} />
                <SportSelector value={sportType} onChange={setSportType} />
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                  required
                  minLength={6}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              {isLogin && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) {
                      toast({ title: "Enter your email", description: "Type your email above, then click Forgot Password.", variant: "destructive" });
                      return;
                    }
                    try {
                      const { error } = await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: `${window.location.origin}/reset-password`,
                      });
                      if (error) throw error;
                      toast({ title: "Reset link sent", description: "Check your email for a password reset link." });
                    } catch (err: any) {
                      toast({ title: "Error", description: err.message || "Could not send reset link.", variant: "destructive" });
                    }
                  }}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
                >
                  <KeyRound className="w-3 h-3" />
                  Forgot Password?
                </button>
              )}
            </div>

            {!isLogin && (
              <div className="pt-1 border-t border-border/50">
                <LegalAgreements onAgreementChange={setLegalAgreed} />
              </div>
            )}

            <Button
              type="submit"
              variant="vault"
              size="lg"
              className="w-full h-12"
              disabled={loading || (!isLogin && !legalAgreed)}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              {loading
                ? (isLogin ? "Signing In..." : "Creating Account...")
                : (isLogin ? "Sign In" : "Create Account")
              }
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">OR</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full h-12 mb-3"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                const result = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: window.location.origin,
                });
                if (result.redirected) return;
                if (result.error) throw result.error;
              } catch (err: any) {
                toast({ title: "Google Sign In failed", description: err.message || "Could not sign in with Google.", variant: "destructive" });
                setLoading(false);
              }
            }}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 hover:text-background border-foreground"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                const result = await lovable.auth.signInWithOAuth("apple", {
                  redirect_uri: window.location.origin,
                });
                if (result.redirected) return;
                if (result.error) throw result.error;
              } catch (err: any) {
                toast({ title: "Apple Sign In failed", description: err.message || "Could not sign in with Apple.", variant: "destructive" });
                setLoading(false);
              }
            }}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Sign in with Apple
          </Button>
        </div>

        {/* Back to home */}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
