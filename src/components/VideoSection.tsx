import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const VideoSection = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "intro_video_url")
        .maybeSingle();
      if (data?.value) setVideoUrl(data.value);
    })();
  }, []);

  const isEmbedUrl = videoUrl.includes("youtube.com/embed") || videoUrl.includes("player.vimeo.com");

  return (
    <section className="section-padding bg-background">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-4">
            Watch the <span className="text-gradient-gold">Introduction</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Learn how executive coaching can transform your leadership and accelerate your company's growth.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative aspect-video bg-card rounded-lg overflow-hidden border border-border glow-gold"
        >
          {videoUrl && isEmbedUrl ? (
            playing ? (
              <iframe
                src={`${videoUrl}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Introduction Video"
              />
            ) : (
              <button onClick={() => setPlaying(true)} className="absolute inset-0 flex items-center justify-center group cursor-pointer">
                <div className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary/30 transition-colors duration-300">
                  <Play className="w-8 h-8 text-primary ml-1" />
                </div>
              </button>
            )
          ) : videoUrl ? (
            <video src={videoUrl} controls className="w-full h-full object-contain" />
          ) : (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-8 h-8 text-primary ml-1" />
                </div>
              </div>
              <div className="absolute bottom-6 left-6 text-sm text-muted-foreground">
                Video coming soon
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;
