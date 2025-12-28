import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, X, Loader2, Plus } from "lucide-react";

interface Profile {
  user_id: string;
  display_name: string;
  email: string;
  bio?: string | null;
  position?: string | null;
  graduation_year?: number | null;
  target_schools?: string[] | null;
}

interface EditProfileFormProps {
  profile: Profile;
  onProfileUpdated: (profile: Profile) => void;
}

const positions = [
  "Pitcher",
  "Catcher",
  "First Base",
  "Second Base",
  "Third Base",
  "Shortstop",
  "Left Field",
  "Center Field",
  "Right Field",
  "Designated Hitter",
  "Utility",
  "Two-Way Player"
];

const currentYear = new Date().getFullYear();
const graduationYears = Array.from({ length: 8 }, (_, i) => currentYear + i);

const EditProfileForm = ({ profile, onProfileUpdated }: EditProfileFormProps) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [position, setPosition] = useState(profile.position || "");
  const [graduationYear, setGraduationYear] = useState<string>(
    profile.graduation_year?.toString() || ""
  );
  const [targetSchools, setTargetSchools] = useState<string[]>(
    profile.target_schools || []
  );
  const [newSchool, setNewSchool] = useState("");

  const addSchool = () => {
    if (newSchool.trim() && !targetSchools.includes(newSchool.trim())) {
      setTargetSchools([...targetSchools, newSchool.trim()]);
      setNewSchool("");
    }
  };

  const removeSchool = (school: string) => {
    setTargetSchools(targetSchools.filter(s => s !== school));
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error("Display name is required");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          position: position || null,
          graduation_year: graduationYear ? parseInt(graduationYear) : null,
          target_schools: targetSchools.length > 0 ? targetSchools : null
        })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      const updatedProfile: Profile = {
        ...profile,
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        position: position || null,
        graduation_year: graduationYear ? parseInt(graduationYear) : null,
        target_schools: targetSchools.length > 0 ? targetSchools : null
      };

      onProfileUpdated(updatedProfile);
      toast.success("Profile updated successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="w-4 h-4" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Customize your athlete profile to share with coaches and recruiters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell coaches about yourself, your achievements, and goals..."
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/500
            </p>
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger>
                <SelectValue placeholder="Select your position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map(pos => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Graduation Year */}
          <div className="space-y-2">
            <Label htmlFor="graduationYear">Graduation Year</Label>
            <Select value={graduationYear} onValueChange={setGraduationYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select graduation year" />
              </SelectTrigger>
              <SelectContent>
                {graduationYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Schools */}
          <div className="space-y-2">
            <Label>Target Schools</Label>
            <div className="flex gap-2">
              <Input
                value={newSchool}
                onChange={(e) => setNewSchool(e.target.value)}
                placeholder="Add a school"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSchool();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={addSchool}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {targetSchools.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {targetSchools.map(school => (
                  <Badge
                    key={school}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {school}
                    <button
                      onClick={() => removeSchool(school)}
                      className="ml-1 hover:bg-muted rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileForm;
