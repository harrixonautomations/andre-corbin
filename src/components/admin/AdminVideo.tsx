import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Link, Trash2, Video } from "lucide-react";

const AdminVideo = () => {
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState("");
  const [embedInput, setEmbedInput] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"embed" | "upload">("embed");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "intro_video_url")
        .maybeSingle();
      if (data?.value) {
        setVideoUrl(data.value);
        setEmbedInput(data.value);
      }
    })();
  }, []);

  const parseEmbedUrl = (url: string): string => {
    // Convert YouTube watch URLs to embed URLs
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    // Convert Vimeo URLs to embed URLs
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url;
  };

  const saveEmbedUrl = async () => {
    if (!embedInput.trim()) return;
    setSaving(true);
    const parsed = parseEmbedUrl(embedInput.trim());
    const { error } = await supabase
      .from("site_settings")
      .update({ value: parsed, updated_at: new Date().toISOString() })
      .eq("key", "intro_video_url");
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      setVideoUrl(parsed);
      toast({ title: "Video URL saved" });
    }
    setSaving(false);
  };

  const uploadVideo = async () => {
    if (!videoFile) return;
    setSaving(true);
    const ext = videoFile.name.split(".").pop();
    const path = `intro-video-${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("video-uploads").upload(path, videoFile);
    if (uploadErr) {
      toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" });
      setSaving(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("video-uploads").getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    const { error } = await supabase
      .from("site_settings")
      .update({ value: publicUrl, updated_at: new Date().toISOString() })
      .eq("key", "intro_video_url");
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      setVideoUrl(publicUrl);
      setEmbedInput(publicUrl);
      setVideoFile(null);
      toast({ title: "Video uploaded and saved" });
    }
    setSaving(false);
  };

  const clearVideo = async () => {
    setSaving(true);
    await supabase
      .from("site_settings")
      .update({ value: "", updated_at: new Date().toISOString() })
      .eq("key", "intro_video_url");
    setVideoUrl("");
    setEmbedInput("");
    toast({ title: "Video removed" });
    setSaving(false);
  };

  const isEmbedUrl = videoUrl.includes("youtube.com/embed") || videoUrl.includes("player.vimeo.com");

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-foreground mb-6">Introduction Video</h2>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={mode === "embed" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("embed")}
          className="gap-2"
        >
          <Link size={14} /> Embed URL
        </Button>
        <Button
          variant={mode === "upload" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("upload")}
          className="gap-2"
        >
          <Upload size={14} /> Upload File
        </Button>
      </div>

      {mode === "embed" ? (
        <div className="space-y-3">
          <Label className="text-sm text-muted-foreground">
            Paste a YouTube, Vimeo, or direct video URL
          </Label>
          <div className="flex gap-2">
            <Input
              value={embedInput}
              onChange={(e) => setEmbedInput(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1"
            />
            <Button onClick={saveEmbedUrl} disabled={saving || !embedInput.trim()} size="sm">
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Label className="text-sm text-muted-foreground">
            Upload an MP4 or WebM video file (max 50MB recommended)
          </Label>
          <div className="flex gap-2">
            <Input
              type="file"
              accept="video/mp4,video/webm"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="flex-1"
            />
            <Button onClick={uploadVideo} disabled={saving || !videoFile} size="sm">
              Upload
            </Button>
          </div>
        </div>
      )}

      {/* Preview */}
      {videoUrl && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">Current Video Preview</h3>
            <Button variant="ghost" size="sm" onClick={clearVideo} className="text-destructive gap-1.5">
              <Trash2 size={13} /> Remove
            </Button>
          </div>
          <div className="aspect-video bg-card rounded-lg overflow-hidden border border-border">
            {isEmbedUrl ? (
              <iframe
                src={videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Introduction Video Preview"
              />
            ) : (
              <video src={videoUrl} controls className="w-full h-full object-contain" />
            )}
          </div>
        </div>
      )}

      {!videoUrl && (
        <div className="mt-6 aspect-video bg-card rounded-lg border border-border flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Video size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No video set yet</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVideo;
