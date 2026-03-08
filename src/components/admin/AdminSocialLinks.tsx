import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, Link as LinkIcon } from "lucide-react";

const AdminSocialLinks = () => {
  const { toast } = useToast();
  const [linkedin, setLinkedin] = useState("https://linkedin.com");
  const [twitter, setTwitter] = useState("https://twitter.com");
  const [email, setEmail] = useState("hello@andrecorbin.pro");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["social_linkedin", "social_twitter", "social_email"]);
      if (data) {
        data.forEach((row) => {
          if (row.key === "social_linkedin") setLinkedin(row.value);
          if (row.key === "social_twitter") setTwitter(row.value);
          if (row.key === "social_email") setEmail(row.value);
        });
      }
    };
    load();
  }, []);

  const saveSetting = async (key: string, value: string) => {
    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .eq("key", key)
      .maybeSingle();

    if (existing) {
      await supabase.from("site_settings").update({ value }).eq("key", key);
    } else {
      await supabase.from("site_settings").insert({ key, value });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSetting("social_linkedin", linkedin);
      await saveSetting("social_twitter", twitter);
      await saveSetting("social_email", email);
      toast({ title: "Social links updated" });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground mb-1">Social Media Links</h2>
        <p className="text-muted-foreground text-xs">Edit the social links shown in the footer across the site.</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5 sm:p-6 space-y-5 max-w-lg">
        <div className="space-y-2">
          <Label htmlFor="social-linkedin" className="flex items-center gap-2">
            <LinkIcon size={14} className="text-primary" /> LinkedIn URL
          </Label>
          <Input
            id="social-linkedin"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="https://linkedin.com/in/andrecorbin"
            className="bg-secondary border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="social-twitter" className="flex items-center gap-2">
            <LinkIcon size={14} className="text-primary" /> X / Twitter URL
          </Label>
          <Input
            id="social-twitter"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            placeholder="https://twitter.com/andrecorbin"
            className="bg-secondary border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="social-email" className="flex items-center gap-2">
            <LinkIcon size={14} className="text-primary" /> Email Address
          </Label>
          <Input
            id="social-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hello@andrecorbin.pro"
            className="bg-secondary border-border"
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save size={14} />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default AdminSocialLinks;
