
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testimonials are publicly readable" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Admins can insert testimonials" ON public.testimonials FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update testimonials" ON public.testimonials FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete testimonials" ON public.testimonials FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.testimonials (quote, name, title, display_order) VALUES
  ('Andre fundamentally changed how I approach leadership. His coaching helped me 3x our revenue in 18 months while working fewer hours.', 'Sarah Chen', 'CEO, TechCorp', 0),
  ('The clarity I gained from our sessions was worth more than any MBA. Andre sees what you can''t see in yourself.', 'Marcus Williams', 'Founder, Venture Labs', 1),
  ('Working with Andre gave me the frameworks to navigate our Series B and scale from 20 to 200 employees with confidence.', 'Elena Rodriguez', 'Co-Founder, ScaleUp Inc.', 2);
