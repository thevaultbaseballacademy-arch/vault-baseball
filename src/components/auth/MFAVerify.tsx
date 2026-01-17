import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MFAVerifyProps {
  factorId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const MFAVerify = ({ factorId, onSuccess, onCancel }: MFAVerifyProps) => {
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const { toast } = useToast();

  const handleVerify = async () => {
    if (code.length !== 6) return;

    setVerifying(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) throw verifyError;

      toast({
        title: "Verified",
        description: "Two-factor authentication successful.",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid code. Please try again.",
        variant: "destructive",
      });
      setCode("");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="font-display text-2xl text-foreground mb-2">
            Two-Factor Authentication
          </h2>
          <p className="text-muted-foreground">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mfaCode">Verification Code</Label>
            <Input
              id="mfaCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="text-center text-3xl tracking-[0.5em] font-mono h-14"
              autoFocus
            />
          </div>

          <Button
            variant="vault"
            size="lg"
            onClick={handleVerify}
            disabled={verifying || code.length !== 6}
            className="w-full"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={onCancel}
            className="w-full"
          >
            Back to Login
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default MFAVerify;
