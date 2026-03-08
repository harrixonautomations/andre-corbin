
-- Allow users to update their own consultations (for reschedule requests)
CREATE POLICY "Users can update own consultations" ON public.consultations
FOR UPDATE USING (auth.uid() = user_id);
