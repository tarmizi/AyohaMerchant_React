-- Fix merchant_profiles: give it its own UUID primary key.
-- auth_user_id stores the auth.users link (same email can be both customer & merchant).

DROP TABLE IF EXISTS public.merchant_profiles CASCADE;

CREATE TABLE public.merchant_profiles (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name         text,
  email             text,
  phone_no          text,
  profile_image_url text,
  username          text UNIQUE,
  status            text DEFAULT 'active',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX merchant_profiles_auth_user_id_idx ON public.merchant_profiles(auth_user_id);

-- Auto-update updated_at
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

-- Auto-insert on new auth.users signup (Google SSO or email/password)
DROP TRIGGER IF EXISTS trg_handle_new_merchant_signup ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_merchant_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.merchant_profiles (auth_user_id, full_name, email, profile_image_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (auth_user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_handle_new_merchant_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_merchant_signup();

-- RLS
ALTER TABLE public.merchant_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchant can insert own profile"
  ON public.merchant_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Merchant can read own profile"
  ON public.merchant_profiles FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Merchant can update own profile"
  ON public.merchant_profiles FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());
