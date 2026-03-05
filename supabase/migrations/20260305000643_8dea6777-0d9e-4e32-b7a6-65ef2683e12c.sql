
-- Consultation plans table
CREATE TABLE public.consultation_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 60,
  is_published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  discount_percent numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.consultation_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are publicly readable" ON public.consultation_plans FOR SELECT USING (true);
CREATE POLICY "Admins can insert plans" ON public.consultation_plans FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update plans" ON public.consultation_plans FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete plans" ON public.consultation_plans FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_consultation_plans_updated_at
  BEFORE UPDATE ON public.consultation_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Availability slots table
CREATE TABLE public.availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_blocked boolean NOT NULL DEFAULT false,
  is_booked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_slot UNIQUE (slot_date, start_time)
);

ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Slots are publicly readable" ON public.availability_slots FOR SELECT USING (true);
CREATE POLICY "Admins can insert slots" ON public.availability_slots FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update slots" ON public.availability_slots FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete slots" ON public.availability_slots FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Chat messages table
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  reply_to_id uuid REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can read chat" ON public.chat_messages FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    EXISTS (SELECT 1 FROM public.consultations WHERE id = consultation_id AND user_id = auth.uid())
  );
CREATE POLICY "Participants can send messages" ON public.chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND (
      has_role(auth.uid(), 'admin'::app_role) OR
      EXISTS (SELECT 1 FROM public.consultations WHERE id = consultation_id AND user_id = auth.uid())
    )
  );

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Add columns to consultations for booking system
ALTER TABLE public.consultations
  ADD COLUMN plan_id uuid REFERENCES public.consultation_plans(id),
  ADD COLUMN slot_date date,
  ADD COLUMN slot_time time,
  ADD COLUMN postponed_date date,
  ADD COLUMN postponed_time time,
  ADD COLUMN client_response text;

-- Add discount columns to books
ALTER TABLE public.books
  ADD COLUMN discount_percent numeric NOT NULL DEFAULT 0,
  ADD COLUMN discount_active boolean NOT NULL DEFAULT false,
  ADD COLUMN discount_start timestamptz,
  ADD COLUMN discount_end timestamptz;
