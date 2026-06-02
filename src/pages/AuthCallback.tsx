import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { waitForRecoveredSession } from "@/lib/authSession";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const session = await waitForRecoveredSession({ timeoutMs: 8000, intervalMs: 250 });

        if (session?.user) {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id);

          const userRoles = roles?.map(r => r.role) || [];
          const destination = userRoles.includes("admin")
            ? "/admin"
            : userRoles.includes("coach")
              ? "/coach-dashboard"
              : "/dashboard";

          navigate(destination, { replace: true });
        } else {
          navigate("/auth", { replace: true });
        }
      } catch {
        navigate("/auth", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground text-sm">Verifying your account...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
