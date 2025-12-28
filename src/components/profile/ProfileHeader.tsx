import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, Check, Calendar, Mail, MapPin, GraduationCap, Target } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import EditProfileForm from "./EditProfileForm";

interface Profile {
  user_id: string;
  display_name: string;
  email: string;
  created_at: string;
  bio?: string | null;
  position?: string | null;
  graduation_year?: number | null;
  target_schools?: string[] | null;
}

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile: boolean;
  currentUserId?: string;
  onProfileUpdated?: (profile: Profile) => void;
}

const ProfileHeader = ({ profile, isOwnProfile, onProfileUpdated }: ProfileHeaderProps) => {
  const [copied, setCopied] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile);

  const shareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${currentProfile.user_id}`;
    
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Profile link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleProfileUpdated = (updatedProfile: Profile) => {
    setCurrentProfile(updatedProfile);
    onProfileUpdated?.(updatedProfile);
  };

  const initials = currentProfile.display_name
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

          {/* Action Buttons */}
          <div className="flex justify-end pt-2 gap-2">
            {isOwnProfile && (
              <EditProfileForm 
                profile={currentProfile} 
                onProfileUpdated={handleProfileUpdated}
              />
            )}
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
                {currentProfile.display_name || 'Athlete'}
              </h1>
              {currentProfile.position && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
                  {currentProfile.position}
                </Badge>
              )}
              {isOwnProfile && (
                <Badge variant="outline" className="text-muted-foreground">
                  Your Profile
                </Badge>
              )}
            </div>

            {/* Bio */}
            {currentProfile.bio && (
              <p className="mt-4 text-foreground/80 max-w-2xl">
                {currentProfile.bio}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              {currentProfile.graduation_year && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>Class of {currentProfile.graduation_year}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{currentProfile.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {format(new Date(currentProfile.created_at), 'MMMM yyyy')}</span>
              </div>
            </div>

            {/* Target Schools */}
            {currentProfile.target_schools && currentProfile.target_schools.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Target className="w-4 h-4" />
                  <span>Target Schools</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentProfile.target_schools.map(school => (
                    <Badge key={school} variant="outline" className="bg-muted/50">
                      {school}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Share for Recruiting */}
          {isOwnProfile && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">
                Share your profile with college coaches:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-background rounded text-xs text-foreground truncate">
                  {`${window.location.origin}/profile/${currentProfile.user_id}`}
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
