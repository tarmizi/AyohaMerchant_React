-- merchant_profiles: stores every merchant who signs up (Google SSO or email/password).
-- This is the owner/identity record for a merchant account, mirroring customer_profiles structure.

CREATE TABLE public.merchant_profiles (
  id                uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name         text,
  email             text,
  phone_no          text,
  profile_image_url text,
  username          text UNIQUE,
  status            text DEFAULT 'active',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.set_merchant_profiles_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_merchant_profiles_updated_at
  BEFORE UPDATE ON public.merchant_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_merchant_profiles_updated_at();

-- Auto-insert a merchant_profiles row on every new auth.users signup
-- so the profile exists immediately after Google SSO or email/password signup.
CREATE OR REPLACE FUNCTION public.handle_new_merchant_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.merchant_profiles (id, full_name, email, profile_image_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_handle_new_merchant_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_merchant_signup();

-- RLS
ALTER TABLE public.merchant_profiles ENABLE ROW LEVEL SECURITY;

-- Merchant can insert, read, and update their own profile
CREATE POLICY "Merchant can insert own profile"
  ON public.merchant_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Merchant can read own profile"
  ON public.merchant_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Merchant can update own profile"
  ON public.merchant_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Platform admin can read all (future use)
-- CREATE POLICY "Platform admin can read all merchant profiles"
--   ON public.merchant_profiles FOR SELECT
--   TO authenticated
--   USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'platform_admin'));
