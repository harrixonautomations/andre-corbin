
-- Create trigger for auto-assigning admin role to primary admin on signup
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_primary_admin();
