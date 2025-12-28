import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, Check, Calendar, Mail } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Profile {
  user_id: string;
  display_name: string;
  email: string;
  created_at: string;
}

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile: boolean;
  currentUserId?: string;
}

const ProfileHeader = ({ profile, isOwnProfile }: ProfileHeaderProps) => {
  const [copied, setCopied] = useState(false);

  const shareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${profile.user_id}`;
    
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Profile link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const initials = profile.display_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-border bg-card overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/10" />
        
        <CardContent className="relative pt-0 pb-6">
          {/* Avatar */}
          <div className="absolute -top-12 left-6">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center border-4 border-card shadow-lg">
              <span className="text-primary-foreground font-bold text-2xl">
                {initials}
              </span>
            </div>
          </div>

          {/* Share Button */}
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={shareProfile}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Share Profile
                </>
              )}
            </Button>
          </div>

          {/* Profile Info */}
          <div className="mt-8">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-3xl text-foreground">
                {profile.display_name || 'Athlete'}
              </h1>
              {isOwnProfile && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  Your Profile
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
              </div>
            </div>
          </div>

          {/* Quick Share for Recruiting */}
          {isOwnProfile && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">
                Share your profile with college coaches:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-background rounded text-xs text-foreground truncate">
                  {`${window.location.origin}/profile/${profile.user_id}`}
                </code>
                <Button size="sm" variant="secondary" onClick={shareProfile}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileHeader;
