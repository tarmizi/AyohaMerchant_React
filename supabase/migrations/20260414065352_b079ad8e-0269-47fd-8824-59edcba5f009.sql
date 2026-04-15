
-- Create enum for loyalty program types
CREATE TYPE public.loyalty_program_type AS ENUM (
  'stamp', 'point', 'discount', 'voucher', 'contest', 'event', 'coupon', 'referral'
);

-- Create enum for loyalty program status
CREATE TYPE public.loyalty_program_status AS ENUM ('Active', 'Inactive');

-- Create loyalty_programs master table
CREATE TABLE public.loyalty_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_account_id UUID NOT NULL,
  program_type public.loyalty_program_type NOT NULL,
  program_name TEXT NOT NULL,
  program_description TEXT,
  program_status public.loyalty_program_status NOT NULL DEFAULT 'Active',
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;

-- RLS policies for loyalty_programs
CREATE POLICY "Users can view own loyalty programs"
  ON public.loyalty_programs FOR SELECT
  USING (auth.uid() = merchant_account_id AND is_deleted = false);

CREATE POLICY "Users can create own loyalty programs"
  ON public.loyalty_programs FOR INSERT
  WITH CHECK (auth.uid() = merchant_account_id);

CREATE POLICY "Users can update own loyalty programs"
  ON public.loyalty_programs FOR UPDATE
  USING (auth.uid() = merchant_account_id);

CREATE POLICY "Users can delete own loyalty programs"
  ON public.loyalty_programs FOR DELETE
  USING (auth.uid() = merchant_account_id);

-- Timestamp trigger
CREATE TRIGGER update_loyalty_programs_updated_at
  BEFORE UPDATE ON public.loyalty_programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create junction table for membership_card <-> loyalty_program
CREATE TABLE public.membership_card_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  membership_card_id UUID NOT NULL REFERENCES public.membership_cards(id) ON DELETE CASCADE,
  loyalty_program_id UUID NOT NULL REFERENCES public.loyalty_programs(id) ON DELETE CASCADE,
  linked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (membership_card_id, loyalty_program_id)
);

-- Enable RLS
ALTER TABLE public.membership_card_programs ENABLE ROW LEVEL SECURITY;

-- RLS policies: user must own both the card and the program
CREATE POLICY "Users can view own card-program links"
  ON public.membership_card_programs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.membership_cards WHERE id = membership_card_id AND merchant_account_id = auth.uid())
  );

CREATE POLICY "Users can link programs to own cards"
  ON public.membership_card_programs FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.membership_cards WHERE id = membership_card_id AND merchant_account_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.loyalty_programs WHERE id = loyalty_program_id AND merchant_account_id = auth.uid())
  );

CREATE POLICY "Users can unlink programs from own cards"
  ON public.membership_card_programs FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.membership_cards WHERE id = membership_card_id AND merchant_account_id = auth.uid())
  );

-- Indexes
CREATE INDEX idx_loyalty_programs_merchant ON public.loyalty_programs(merchant_account_id);
CREATE INDEX idx_loyalty_programs_type ON public.loyalty_programs(program_type);
CREATE INDEX idx_mcp_card ON public.membership_card_programs(membership_card_id);
CREATE INDEX idx_mcp_program ON public.membership_card_programs(loyalty_program_id);
