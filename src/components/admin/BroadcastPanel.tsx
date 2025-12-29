import { useState } from "react";
import { Send, Loader2, Bell, BookOpen, Megaphone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BroadcastPanelProps {
  userCount: number;
}

const notificationTypes = [
  {
    value: "course_update",
    label: "Course Update",
    description: "New lessons, modules, or program changes",
    icon: BookOpen,
    color: "text-green-500",
  },
  {
    value: "announcement",
    label: "Announcement",
    description: "General platform announcements",
    icon: Megaphone,
    color: "text-blue-500",
  },
  {
    value: "coach_message",
    label: "Coach Message",
    description: "Messages from coaching staff",
    icon: Users,
    color: "text-orange-500",
  },
];

const BroadcastPanel = ({ userCount }: BroadcastPanelProps) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("announcement");
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState<number | null>(null);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Missing fields",
        description: "Please enter both title and message",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    setSentCount(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("admin-broadcast", {
        body: {
          title: title.trim(),
          message: message.trim(),
          type,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setSentCount(data.notifiedCount || 0);
      setTitle("");
      setMessage("");
      
      toast({
        title: "Broadcast sent!",
        description: `Notification sent to ${data.notifiedCount} users`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send broadcast",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Broadcast Notifications
        </CardTitle>
        <CardDescription>
          Send a notification to all {userCount} registered users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Type */}
        <div className="space-y-3">
          <Label>Notification Type</Label>
          <RadioGroup
            value={type}
            onValueChange={setType}
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            {notificationTypes.map((option) => {
              const Icon = option.icon;
              return (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    type === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={option.value} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${option.color}`} />
                      <span className="font-medium text-sm text-foreground">
                        {option.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </RadioGroup>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="broadcast-title">Title</Label>
          <Input
            id="broadcast-title"
            placeholder="e.g., New Velocity System Module Available!"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground text-right">
            {title.length}/100
          </p>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="broadcast-message">Message</Label>
          <Textarea
            id="broadcast-message"
            placeholder="Enter your notification message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {message.length}/500
          </p>
        </div>

        {/* Preview */}
        <div className="bg-secondary/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Preview</p>
          <div className="bg-card border border-border rounded-lg p-3">
            <p className="font-medium text-sm text-foreground">
              {title || "Notification Title"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {message || "Notification message will appear here..."}
            </p>
          </div>
        </div>

        {/* Send Button */}
        <div className="flex items-center justify-between">
          {sentCount !== null && (
            <p className="text-sm text-green-600">
              ✓ Sent to {sentCount} users
            </p>
          )}
          <Button
            onClick={handleSend}
            disabled={sending || !title.trim() || !message.trim()}
            className="ml-auto"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send to {userCount} Users
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BroadcastPanel;
