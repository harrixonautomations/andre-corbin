
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are publicly readable" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can insert settings" ON public.site_settings FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update settings" ON public.site_settings FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete settings" ON public.site_settings FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed the intro video setting
INSERT INTO public.site_settings (key, value) VALUES ('intro_video_url', '');

-- Create video-uploads bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('video-uploads', 'video-uploads', true);

-- Storage policies for video-uploads
CREATE POLICY "Anyone can view videos" ON storage.objects FOR SELECT USING (bucket_id = 'video-uploads');
CREATE POLICY "Admins can upload videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'video-uploads' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete videos" ON storage.objects FOR DELETE USING (bucket_id = 'video-uploads' AND has_role(auth.uid(), 'admin'::app_role));
