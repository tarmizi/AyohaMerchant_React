
-- Create a view that excludes password_hash
CREATE VIEW public.merchant_users_public
WITH (security_invoker=on) AS
  SELECT id, merchant_account_id, account_name, email, phone_number,
         profile_image_url, register_date, user_type, user_status,
         last_login_date, username, is_deleted, created_at, updated_at
  FROM public.merchant_users;

-- Drop old SELECT policy and replace with one that denies direct table access
DROP POLICY IF EXISTS "Users can view own merchant users" ON public.merchant_users;

CREATE POLICY "No direct select on merchant_users"
  ON public.merchant_users FOR SELECT
  USING (false);

-- Add SELECT policy on the view's underlying query via RLS bypass for security_invoker view
-- Since security_invoker=on, the view runs as the calling user.
-- We need a policy that allows SELECT when accessed through the view.
-- Actually, security_invoker views check RLS as the invoker, so USING(false) blocks the view too.
-- Instead, use a security definer function approach.

-- Let's revert and use a simpler approach: keep SELECT policy but never query password_hash in app code
DROP POLICY IF EXISTS "No direct select on merchant_users" ON public.merchant_users;

CREATE POLICY "Users can view own merchant users"
  ON public.merchant_users FOR SELECT
  USING ((auth.uid() = merchant_account_id) AND (is_deleted = false));

-- Drop the view since security_invoker won't work with USING(false)
DROP VIEW IF EXISTS public.merchant_users_public;
