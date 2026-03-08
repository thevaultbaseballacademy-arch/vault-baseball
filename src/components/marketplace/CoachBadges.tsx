import { Award, Shield, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CoachBadgesProps {
  isCertified?: boolean;
  isBypassCertified?: boolean;
  isStaff?: boolean;
  compact?: boolean;
}

const CoachBadges = ({ isCertified, isBypassCertified, isStaff, compact = false }: CoachBadgesProps) => {
  const badges = [];

  if (isStaff) {
    badges.push(
      <Badge
        key="staff"
        className="bg-foreground text-background gap-1"
      >
        <Shield className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
        {!compact && "Vault Staff"}
      </Badge>
    );
  }

  if (isBypassCertified) {
    badges.push(
      <Badge
        key="inperson"
        className="bg-purple-600 text-white gap-1"
      >
        <ShieldCheck className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
        {!compact && "Certified by Eddie Mejia"}
      </Badge>
    );
  } else if (isCertified) {
    badges.push(
      <Badge
        key="certified"
        className="bg-accent text-accent-foreground gap-1"
      >
        <Award className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
        {!compact && "Vault Certified"}
      </Badge>
    );
  }

  if (badges.length === 0) return null;

  return <div className="flex flex-wrap gap-1.5">{badges}</div>;
};

export default CoachBadges;
