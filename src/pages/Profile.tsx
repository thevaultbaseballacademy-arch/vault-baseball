import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfilePosts from "@/components/profile/ProfilePosts";
import HighlightVideos from "@/components/profile/HighlightVideos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, FileText, GraduationCap, Video, Loader2 } from "lucide-react";

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
}

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user ?? null);

      if (!userId) {
        setError("No profile ID provided");
        setLoading(false);
        return;
      }

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setError("Failed to load profile");
        setLoading(false);
        return;
      }

      if (!profileData) {
        setError("Profile not found");
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setLoading(false);
    };

    fetchData();
  }, [userId]);

  const isOwnProfile = currentUser?.id === userId;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {error || "Profile not found"}
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="text-primary hover:underline"
            >
              Go back
            </button>
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
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile Header */}
          <ProfileHeader 
            profile={profile} 
            isOwnProfile={isOwnProfile}
            currentUserId={currentUser?.id}
            onProfileUpdated={setProfile}
          />

          {/* Content Tabs */}
          <Tabs defaultValue="stats" className="mt-8">
            <TabsList className="grid w-full grid-cols-4 bg-card border border-border">
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">Highlights</span>
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Posts</span>
              </TabsTrigger>
              <TabsTrigger value="recruiting" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <span className="hidden sm:inline">Recruiting</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="mt-6">
              <ProfileStats userId={userId!} />
            </TabsContent>

            <TabsContent value="videos" className="mt-6">
              <HighlightVideos 
                userId={userId!} 
                isOwnProfile={isOwnProfile}
              />
            </TabsContent>

            <TabsContent value="posts" className="mt-6">
              <ProfilePosts 
                userId={userId!} 
                currentUserId={currentUser?.id}
              />
            </TabsContent>

            <TabsContent value="recruiting" className="mt-6">
              <ProfilePosts 
                userId={userId!} 
                currentUserId={currentUser?.id}
                filterType="recruiting"
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
