import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, Video } from "lucide-react";

const AdminMeeting = () => {
  const { toast } = useToast();
  const [meetingId, setMeetingId] = useState("");
  const [password, setPassword] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["zoom_meeting_id", "zoom_password", "zoom_meeting_link"]);
      if (data) {
        data.forEach((s) => {
          if (s.key === "zoom_meeting_id") setMeetingId(s.value);
          if (s.key === "zoom_password") setPassword(s.value);
          if (s.key === "zoom_meeting_link") setMeetingLink(s.value);
        });
      }
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    const settings = [
      { key: "zoom_meeting_id", value: meetingId },
      { key: "zoom_password", value: password },
      { key: "zoom_meeting_link", value: meetingLink },
    ];

    for (const s of settings) {
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("key", s.key)
        .maybeSingle();

      if (existing) {
        await supabase.from("site_settings").update({ value: s.value }).eq("key", s.key);
      } else {
        await supabase.from("site_settings").insert(s);
      }
    }

    setSaving(false);
    toast({ title: "Meeting credentials saved" });
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-foreground mb-2">Zoom Meeting Settings</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Set your standard Zoom meeting credentials. These will be used when inviting clients to meetings via chat.
      </p>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4 max-w-lg">
        <div className="flex items-center gap-2 mb-2">
          <Video size={18} className="text-primary" />
          <span className="text-sm font-medium text-foreground">Default Meeting Credentials</span>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Meeting ID</Label>
          <Input
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            placeholder="e.g. 123 456 7890"
            className="bg-secondary border-border"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Password</Label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="e.g. abc123"
            className="bg-secondary border-border"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Meeting Link (optional)</Label>
          <Input
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="e.g. https://zoom.us/j/1234567890"
            className="bg-secondary border-border"
          />
        </div>

        <Button onClick={save} disabled={saving} className="gap-2 mt-2">
          <Save size={14} />{saving ? "Saving..." : "Save Credentials"}
        </Button>
      </div>
    </div>
  );
};

export default AdminMeeting;
