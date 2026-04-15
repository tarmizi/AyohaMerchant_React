
-- Create user_type enum
CREATE TYPE public.merchant_user_type AS ENUM ('Administrator', 'Owner', 'Staff');

-- Create user_status enum
CREATE TYPE public.merchant_user_status AS ENUM ('Active', 'Inactive');

-- Create merchant_users table
CREATE TABLE public.merchant_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_account_id UUID NOT NULL,
  account_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  profile_image_url TEXT,
  register_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_type public.merchant_user_type NOT NULL DEFAULT 'Staff',
  user_status public.merchant_user_status NOT NULL DEFAULT 'Active',
  last_login_date TIMESTAMP WITH TIME ZONE,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.merchant_users ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own merchant users (exclude soft-deleted)
CREATE POLICY "Users can view own merchant users"
  ON public.merchant_users FOR SELECT
  USING (auth.uid() = merchant_account_id AND is_deleted = false);

-- RLS: Users can create merchant users under their account
CREATE POLICY "Users can create own merchant users"
  ON public.merchant_users FOR INSERT
  WITH CHECK (auth.uid() = merchant_account_id);

-- RLS: Users can update their own merchant users
CREATE POLICY "Users can update own merchant users"
  ON public.merchant_users FOR UPDATE
  USING (auth.uid() = merchant_account_id);

-- RLS: Users can delete their own merchant users (for soft delete update)
CREATE POLICY "Users can delete own merchant users"
  ON public.merchant_users FOR DELETE
  USING (auth.uid() = merchant_account_id);

-- Trigger for updated_at
CREATE TRIGGER update_merchant_users_updated_at
  BEFORE UPDATE ON public.merchant_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast lookup by merchant
CREATE INDEX idx_merchant_users_merchant_id ON public.merchant_users (merchant_account_id);
CREATE INDEX idx_merchant_users_not_deleted ON public.merchant_users (merchant_account_id) WHERE is_deleted = false;
