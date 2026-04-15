
-- Create enum for membership card status
CREATE TYPE public.membership_card_status AS ENUM ('Active', 'Inactive');

-- Create membership_cards table
CREATE TABLE public.membership_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_account_id UUID NOT NULL,
  card_name TEXT NOT NULL,
  card_description TEXT,
  card_image_url TEXT,
  card_status membership_card_status NOT NULL DEFAULT 'Active',
  card_type TEXT DEFAULT 'Standard',
  validity_start DATE,
  validity_end DATE,
  terms_conditions TEXT,
  max_members INTEGER,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.membership_cards ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own membership cards"
ON public.membership_cards FOR SELECT
USING (auth.uid() = merchant_account_id AND is_deleted = false);

CREATE POLICY "Users can create own membership cards"
ON public.membership_cards FOR INSERT
WITH CHECK (auth.uid() = merchant_account_id);

CREATE POLICY "Users can update own membership cards"
ON public.membership_cards FOR UPDATE
USING (auth.uid() = merchant_account_id);

CREATE POLICY "Users can delete own membership cards"
ON public.membership_cards FOR DELETE
USING (auth.uid() = merchant_account_id);

-- Trigger for updated_at
CREATE TRIGGER update_membership_cards_updated_at
BEFORE UPDATE ON public.membership_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
