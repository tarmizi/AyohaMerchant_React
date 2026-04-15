
-- 1. Create merchant role enum
CREATE TYPE public.merchant_role AS ENUM ('merchant_owner', 'merchant_admin', 'merchant_staff');

-- 2. Create user_roles table (roles stored separately per system instructions)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_account_id uuid NOT NULL,
  role merchant_role NOT NULL DEFAULT 'merchant_staff',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, merchant_account_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer: check role without RLS recursion
CREATE OR REPLACE FUNCTION public.has_merchant_role(_user_id uuid, _role merchant_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Security definer: get role for a user
CREATE OR REPLACE FUNCTION public.get_merchant_role(_user_id uuid)
RETURNS merchant_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 5. RLS: users can see roles in their merchant account
CREATE POLICY "Users can view roles in own merchant"
  ON public.user_roles FOR SELECT TO authenticated
  USING (merchant_account_id IN (
    SELECT ur.merchant_account_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
  ));

-- 6. RLS: only merchant_owner can insert roles
CREATE POLICY "Owners can assign roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_merchant_role(auth.uid(), 'merchant_owner'));

-- 7. RLS: only merchant_owner can update roles
CREATE POLICY "Owners can update roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_merchant_role(auth.uid(), 'merchant_owner'));

-- 8. RLS: only merchant_owner can delete roles
CREATE POLICY "Owners can delete roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_merchant_role(auth.uid(), 'merchant_owner'));

-- 9. Auto-assign merchant_owner on first signup
CREATE OR REPLACE FUNCTION public.auto_assign_owner_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, merchant_account_id, role)
  VALUES (NEW.id, NEW.id, 'merchant_owner');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_owner_role();

-- 10. Timestamp trigger
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
