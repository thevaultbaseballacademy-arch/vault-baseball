import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Share2, Copy, Trash2, Eye, Link2, Calendar, Plus } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ShareToken {
  id: string;
  token: string;
  expires_at: string | null;
  include_goals: boolean;
  include_stats: boolean;
  include_videos: boolean;
  view_count: number;
  created_at: string;
}

interface KPIShareManagerProps {
  userId: string;
}

const generateToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export function KPIShareManager({ userId }: KPIShareManagerProps) {
  const [tokens, setTokens] = useState<ShareToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // New token settings
  const [includeGoals, setIncludeGoals] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [includeVideos, setIncludeVideos] = useState(false);
  const [expiration, setExpiration] = useState("never");

  useEffect(() => {
    fetchTokens();
  }, [userId]);

  const fetchTokens = async () => {
    const { data, error } = await supabase
      .from('kpi_share_tokens')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching share tokens:', error);
    } else {
      setTokens(data || []);
    }
    setLoading(false);
  };

  const createShareLink = async () => {
    setCreating(true);
    
    let expiresAt: string | null = null;
    if (expiration !== "never") {
      const date = new Date();
      switch (expiration) {
        case "7days":
          date.setDate(date.getDate() + 7);
          break;
        case "30days":
          date.setDate(date.getDate() + 30);
          break;
        case "90days":
          date.setDate(date.getDate() + 90);
          break;
      }
      expiresAt = date.toISOString();
    }

    const token = generateToken();
    
    const { error } = await supabase
      .from('kpi_share_tokens')
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt,
        include_goals: includeGoals,
        include_stats: includeStats,
        include_videos: includeVideos,
      });

    if (error) {
      toast.error("Failed to create share link");
      console.error(error);
    } else {
      toast.success("Share link created!");
      setShowCreateForm(false);
      fetchTokens();
    }
    setCreating(false);
  };

  const deleteToken = async (id: string) => {
    const { error } = await supabase
      .from('kpi_share_tokens')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete share link");
    } else {
      toast.success("Share link deleted");
      setTokens(tokens.filter(t => t.id !== id));
    }
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading share links...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Recruiter Share Links
            </CardTitle>
            <CardDescription>
              Generate shareable links for recruiters and scouts to view your performance data
            </CardDescription>
          </div>
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Link
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showCreateForm && (
          <Card className="border-dashed">
            <CardContent className="pt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-stats">Include KPI Stats</Label>
                  <Switch
                    id="include-stats"
                    checked={includeStats}
                    onCheckedChange={setIncludeStats}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-goals">Include Goals</Label>
                  <Switch
                    id="include-goals"
                    checked={includeGoals}
                    onCheckedChange={setIncludeGoals}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-videos">Include Highlight Videos</Label>
                  <Switch
                    id="include-videos"
                    checked={includeVideos}
                    onCheckedChange={setIncludeVideos}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link Expiration</Label>
                  <Select value={expiration} onValueChange={setExpiration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never expires</SelectItem>
                      <SelectItem value="7days">7 days</SelectItem>
                      <SelectItem value="30days">30 days</SelectItem>
                      <SelectItem value="90days">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={createShareLink} disabled={creating}>
                  {creating ? "Creating..." : "Generate Link"}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {tokens.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No share links created yet</p>
            <p className="text-sm">Create a link to share your KPIs with recruiters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
              <div
                key={token.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  isExpired(token.expires_at) ? 'bg-muted/50 opacity-60' : 'bg-card'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {token.token.substring(0, 8)}...
                    </code>
                    {isExpired(token.expires_at) ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {token.view_count} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {token.expires_at
                        ? `Expires ${format(new Date(token.expires_at), 'MMM d, yyyy')}`
                        : 'Never expires'}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    {token.include_stats && <Badge variant="outline">Stats</Badge>}
                    {token.include_goals && <Badge variant="outline">Goals</Badge>}
                    {token.include_videos && <Badge variant="outline">Videos</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyLink(token.token)}
                    disabled={isExpired(token.expires_at)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteToken(token.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
