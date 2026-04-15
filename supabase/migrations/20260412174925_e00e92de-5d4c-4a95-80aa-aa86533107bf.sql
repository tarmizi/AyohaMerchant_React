
-- Create enterprises table
CREATE TABLE public.enterprises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enterprise_name TEXT NOT NULL,
  tagline TEXT,
  address TEXT,
  state TEXT,
  city TEXT,
  postcode TEXT,
  street_detail TEXT,
  business_reg_no TEXT,
  office_phone TEXT,
  company_email TEXT,
  description TEXT,
  branch_type TEXT DEFAULT 'Branch',
  business_mode TEXT DEFAULT 'In Premise',
  bank_name TEXT,
  bank_account_type TEXT,
  bank_account_name TEXT,
  bank_account_no TEXT,
  facebook TEXT,
  instagram TEXT,
  coordinate TEXT,
  pic_name TEXT,
  whatsapp_no TEXT,
  logo_url TEXT,
  register_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enterprises ENABLE ROW LEVEL SECURITY;

-- Users can view their own enterprises
CREATE POLICY "Users can view own enterprises"
  ON public.enterprises FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create enterprises
CREATE POLICY "Users can create enterprises"
  ON public.enterprises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own enterprises
CREATE POLICY "Users can update own enterprises"
  ON public.enterprises FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own enterprises
CREATE POLICY "Users can delete own enterprises"
  ON public.enterprises FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_enterprises_updated_at
  BEFORE UPDATE ON public.enterprises
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
