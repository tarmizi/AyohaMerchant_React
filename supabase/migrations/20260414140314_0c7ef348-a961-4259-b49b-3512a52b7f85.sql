
-- Create loyalty_program_master table
CREATE TABLE public.loyalty_program_master (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_account_id UUID NOT NULL,
  loyalty_program_type public.loyalty_program_module_type NOT NULL,
  loyalty_program_record_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (merchant_account_id, loyalty_program_type, loyalty_program_record_id)
);

ALTER TABLE public.loyalty_program_master ENABLE ROW LEVEL SECURITY;

CREATE POLICY "merchant_select" ON public.loyalty_program_master
  FOR SELECT USING (auth.uid() = merchant_account_id);

CREATE POLICY "merchant_insert" ON public.loyalty_program_master
  FOR INSERT WITH CHECK (auth.uid() = merchant_account_id);

CREATE POLICY "merchant_update" ON public.loyalty_program_master
  FOR UPDATE USING (auth.uid() = merchant_account_id);

CREATE POLICY "merchant_delete" ON public.loyalty_program_master
  FOR DELETE USING (auth.uid() = merchant_account_id);

CREATE TRIGGER update_loyalty_program_master_updated_at
  BEFORE UPDATE ON public.loyalty_program_master
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add linked_at to membership_card_loyalty_programs
ALTER TABLE public.membership_card_loyalty_programs
  ADD COLUMN IF NOT EXISTS linked_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Backfill from all 8 source tables
INSERT INTO public.loyalty_program_master (merchant_account_id, loyalty_program_type, loyalty_program_record_id, status, is_deleted, created_at, updated_at)
SELECT merchant_account_id, 'stamp'::public.loyalty_program_module_type, id, program_status, is_deleted, created_at, updated_at FROM public.loyalty_program_stamp
ON CONFLICT (merchant_account_id, loyalty_program_type, loyalty_program_record_id) DO NOTHING;

INSERT INTO public.loyalty_program_master (merchant_account_id, loyalty_program_type, loyalty_program_record_id, status, is_deleted, created_at, updated_at)
SELECT merchant_account_id, 'point'::public.loyalty_program_module_type, id, program_status, is_deleted, created_at, updated_at FROM public.loyalty_program_point
ON CONFLICT (merchant_account_id, loyalty_program_type, loyalty_program_record_id) DO NOTHING;

INSERT INTO public.loyalty_program_master (merchant_account_id, loyalty_program_type, loyalty_program_record_id, status, is_deleted, created_at, updated_at)
SELECT merchant_account_id, 'discount'::public.loyalty_program_module_type, id, program_status, is_deleted, created_at, updated_at FROM public.loyalty_program_discount
ON CONFLICT (merchant_account_id, loyalty_program_type, loyalty_program_record_id) DO NOTHING;

INSERT INTO public.loyalty_program_master (merchant_account_id, loyalty_program_type, loyalty_program_record_id, status, is_deleted, created_at, updated_at)
SELECT merchant_account_id, 'voucher'::public.loyalty_program_module_type, id, program_status, is_deleted, created_at, updated_at FROM public.loyalty_program_voucher
ON CONFLICT (merchant_account_id, loyalty_program_type, loyalty_program_record_id) DO NOTHING;

INSERT INTO public.loyalty_program_master (merchant_account_id, loyalty_program_type, loyalty_program_record_id, status, is_deleted, created_at, updated_at)
SELECT merchant_account_id, 'contest'::public.loyalty_program_module_type, id, program_status, is_deleted, created_at, updated_at FROM public.loyalty_program_contest
ON CONFLICT (merchant_account_id, loyalty_program_type, loyalty_program_record_id) DO NOTHING;

INSERT INTO public.loyalty_program_master (merchant_account_id, loyalty_program_type, loyalty_program_record_id, status, is_deleted, created_at, updated_at)
SELECT merchant_account_id, 'event'::public.loyalty_program_module_type, id, program_status, is_deleted, created_at, updated_at FROM public.loyalty_program_event
ON CONFLICT (merchant_account_id, loyalty_program_type, loyalty_program_record_id) DO NOTHING;

INSERT INTO public.loyalty_program_master (merchant_account_id, loyalty_program_type, loyalty_program_record_id, status, is_deleted, created_at, updated_at)
SELECT merchant_account_id, 'coupon'::public.loyalty_program_module_type, id, program_status, is_deleted, created_at, updated_at FROM public.loyalty_program_coupon
ON CONFLICT (merchant_account_id, loyalty_program_type, loyalty_program_record_id) DO NOTHING;

INSERT INTO public.loyalty_program_master (merchant_account_id, loyalty_program_type, loyalty_program_record_id, status, is_deleted, created_at, updated_at)
SELECT merchant_account_id, 'referral'::public.loyalty_program_module_type, id, program_status, is_deleted, created_at, updated_at FROM public.loyalty_program_referral
ON CONFLICT (merchant_account_id, loyalty_program_type, loyalty_program_record_id) DO NOTHING;
