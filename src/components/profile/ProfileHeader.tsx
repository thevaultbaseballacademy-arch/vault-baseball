import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, Check, Calendar, Mail, GraduationCap, Target, Ruler, Scale, Hand, Timer, Twitter, Instagram, Youtube, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import EditProfileForm from "./EditProfileForm";
import ProfileImageUpload from "./ProfileImageUpload";

interface Profile {
  user_id: string;
  display_name: string;
  email: string;
  created_at: string;
  bio?: string | null;
  position?: string | null;
  graduation_year?: number | null;
  target_schools?: string[] | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  height_inches?: number | null;
  weight_lbs?: number | null;
  throwing_arm?: string | null;
  batting_side?: string | null;
  sixty_yard_dash?: number | null;
  twitter_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  hudl_url?: string | null;
}

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile: boolean;
  currentUserId?: string;
  onProfileUpdated?: (profile: Profile) => void;
}

const formatHeight = (inches: number) => {
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
};

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

  const hasPhysicalStats = currentProfile.height_inches || currentProfile.weight_lbs || 
    currentProfile.throwing_arm || currentProfile.batting_side || currentProfile.sixty_yard_dash;

  const hasSocialLinks = currentProfile.twitter_url || currentProfile.instagram_url || 
    currentProfile.youtube_url || currentProfile.hudl_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-border bg-card overflow-hidden">
        {/* Banner */}
        <div className="h-32 md:h-40 relative group">
          {currentProfile.cover_url ? (
            <img src={currentProfile.cover_url} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary/30 via-primary/20 to-primary/10" />
          )}
          {isOwnProfile && (
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ProfileImageUpload
                userId={currentProfile.user_id}
                type="cover"
                currentUrl={currentProfile.cover_url}
                onUpload={(url) => handleProfileUpdated({ ...currentProfile, cover_url: url })}
              />
            </div>
          )}
        </div>
        
        <CardContent className="relative pt-0 pb-6">
          {/* Avatar */}
          <div className="absolute -top-12 left-6 group">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center border-4 border-card shadow-lg overflow-hidden relative">
              {currentProfile.avatar_url ? (
                <img src={currentProfile.avatar_url} alt={currentProfile.display_name || 'Profile'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary-foreground font-bold text-2xl">{initials}</span>
              )}
              {isOwnProfile && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ProfileImageUpload
                    userId={currentProfile.user_id}
                    type="avatar"
                    currentUrl={currentProfile.avatar_url}
                    onUpload={(url) => handleProfileUpdated({ ...currentProfile, avatar_url: url })}
                    className="[&>button]:bg-transparent [&>button]:border-0 [&>button]:text-white [&>button]:p-0 [&>button]:h-auto"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-2 gap-2">
            {isOwnProfile && (
              <EditProfileForm profile={currentProfile} onProfileUpdated={handleProfileUpdated} />
            )}
            <Button variant="outline" size="sm" onClick={shareProfile} className="gap-2">
              {copied ? <><Check className="w-4 h-4" />Copied!</> : <><Share2 className="w-4 h-4" />Share Profile</>}
            </Button>
          </div>

          {/* Profile Info */}
          <div className="mt-8">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-3xl text-foreground">{currentProfile.display_name || 'Athlete'}</h1>
              {currentProfile.position && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">{currentProfile.position}</Badge>
              )}
              {isOwnProfile && <Badge variant="outline" className="text-muted-foreground">Your Profile</Badge>}
            </div>

            {currentProfile.bio && (
              <p className="mt-4 text-foreground/80 max-w-2xl">{currentProfile.bio}</p>
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

            {/* Physical Stats */}
            {hasPhysicalStats && (
              <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                <h3 className="text-sm font-medium text-foreground mb-3">Physical Stats</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {currentProfile.height_inches && (
                    <div className="text-center">
                      <Ruler className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-semibold text-foreground">{formatHeight(currentProfile.height_inches)}</p>
                      <p className="text-xs text-muted-foreground">Height</p>
                    </div>
                  )}
                  {currentProfile.weight_lbs && (
                    <div className="text-center">
                      <Scale className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-semibold text-foreground">{currentProfile.weight_lbs} lbs</p>
                      <p className="text-xs text-muted-foreground">Weight</p>
                    </div>
                  )}
                  {currentProfile.throwing_arm && (
                    <div className="text-center">
                      <Hand className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-semibold text-foreground">{currentProfile.throwing_arm}</p>
                      <p className="text-xs text-muted-foreground">Throws</p>
                    </div>
                  )}
                  {currentProfile.batting_side && (
                    <div className="text-center">
                      <Hand className="w-4 h-4 mx-auto mb-1 text-muted-foreground rotate-180" />
                      <p className="text-lg font-semibold text-foreground">{currentProfile.batting_side}</p>
                      <p className="text-xs text-muted-foreground">Bats</p>
                    </div>
                  )}
                  {currentProfile.sixty_yard_dash && (
                    <div className="text-center">
                      <Timer className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-semibold text-foreground">{currentProfile.sixty_yard_dash}s</p>
                      <p className="text-xs text-muted-foreground">60-Yard</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social Links */}
            {hasSocialLinks && (
              <div className="flex flex-wrap gap-2 mt-4">
                {currentProfile.twitter_url && (
                  <a href={currentProfile.twitter_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Twitter className="w-4 h-4" />Twitter
                    </Button>
                  </a>
                )}
                {currentProfile.instagram_url && (
                  <a href={currentProfile.instagram_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Instagram className="w-4 h-4" />Instagram
                    </Button>
                  </a>
                )}
                {currentProfile.youtube_url && (
                  <a href={currentProfile.youtube_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Youtube className="w-4 h-4" />YouTube
                    </Button>
                  </a>
                )}
                {currentProfile.hudl_url && (
                  <a href={currentProfile.hudl_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="w-4 h-4" />Hudl
                    </Button>
                  </a>
                )}
              </div>
            )}

            {/* Target Schools */}
            {currentProfile.target_schools && currentProfile.target_schools.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Target className="w-4 h-4" />
                  <span>Target Schools</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentProfile.target_schools.map(school => (
                    <Badge key={school} variant="outline" className="bg-muted/50">{school}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Share for Recruiting */}
          {isOwnProfile && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">Share your profile with college coaches:</p>
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
