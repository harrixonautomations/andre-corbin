import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, Mail, MapPin } from "lucide-react";

const AdminContactInfo = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("hello@andrecorbin.pro");
  const [location, setLocation] = useState("New York City & Virtual — coaching clients worldwide.");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["contact_email", "contact_location"]);
      if (data) {
        data.forEach((row) => {
          if (row.key === "contact_email") setEmail(row.value);
          if (row.key === "contact_location") setLocation(row.value);
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
      await saveSetting("contact_email", email);
      await saveSetting("contact_location", location);
      toast({ title: "Contact info updated" });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground mb-1">Contact Information</h2>
        <p className="text-muted-foreground text-xs">Edit the email and location shown on the Contact page.</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5 sm:p-6 space-y-5 max-w-lg">
        <div className="space-y-2">
          <Label htmlFor="contact-email" className="flex items-center gap-2">
            <Mail size={14} className="text-primary" /> Contact Email
          </Label>
          <Input
            id="contact-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hello@andrecorbin.pro"
            className="bg-secondary border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-location" className="flex items-center gap-2">
            <MapPin size={14} className="text-primary" /> Location
          </Label>
          <Textarea
            id="contact-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="New York City & Virtual — coaching clients worldwide."
            rows={3}
            className="bg-secondary border-border resize-none"
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

export default AdminContactInfo;
