
-- Add reschedule tracking columns to consultations
ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS reschedule_requested_by text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reschedule_proposed_date date DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reschedule_proposed_time time without time zone DEFAULT NULL;

-- Create consultation_logs table for meeting event tracking
CREATE TABLE public.consultation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid REFERENCES public.consultations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  action text NOT NULL,
  details text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.consultation_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read all logs
CREATE POLICY "Admins can read all logs" ON public.consultation_logs
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can read logs for their own consultations
CREATE POLICY "Users can read own consultation logs" ON public.consultation_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.consultations 
    WHERE consultations.id = consultation_logs.consultation_id 
    AND consultations.user_id = auth.uid()
  )
);

-- Authenticated users can insert logs
CREATE POLICY "Authenticated users can insert logs" ON public.consultation_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime for logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultation_logs;
