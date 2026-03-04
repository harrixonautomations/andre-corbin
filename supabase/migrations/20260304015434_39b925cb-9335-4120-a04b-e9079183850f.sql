
-- Create a trigger function that auto-assigns admin role to the primary admin email on signup
CREATE OR REPLACE FUNCTION public.handle_primary_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.email = 'harrixonautomations@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for new signups
CREATE TRIGGER on_primary_admin_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_primary_admin();
