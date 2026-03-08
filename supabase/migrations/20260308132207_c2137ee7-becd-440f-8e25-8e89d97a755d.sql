
-- Create sample_requests table
CREATE TABLE public.sample_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  book_id uuid REFERENCES public.books(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sample_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can request sample" ON public.sample_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read samples" ON public.sample_requests
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update samples" ON public.sample_requests
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Add sample chapter URL to books
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS sample_chapter_url text;

-- Create storage bucket for sample chapters
INSERT INTO storage.buckets (id, name, public) VALUES ('sample-chapters', 'sample-chapters', false)
ON CONFLICT DO NOTHING;

-- Storage policies for admin access
CREATE POLICY "Admins can upload sample chapters" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'sample-chapters' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can read sample chapters" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'sample-chapters' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sample chapters" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'sample-chapters' AND has_role(auth.uid(), 'admin'::app_role));
