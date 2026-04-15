
-- Drop old tables and enums
DROP TABLE IF EXISTS public.membership_card_programs;
DROP TABLE IF EXISTS public.loyalty_programs;
DROP TYPE IF EXISTS public.loyalty_program_type;
DROP TYPE IF EXISTS public.loyalty_program_status;

-- Create shared enum for linking
CREATE TYPE public.loyalty_program_module_type AS ENUM (
  'stamp', 'point', 'discount', 'voucher', 'contest', 'event', 'coupon', 'referral'
);

-- Helper: create a loyalty program master table with RLS
-- We'll create each one explicitly for clarity

-- ═══════════════════════════════════════
-- 1. STAMP
-- ═══════════════════════════════════════
CREATE TABLE public.loyalty_program_stamp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_account_id UUID NOT NULL,
  program_name TEXT NOT NULL,
  program_description TEXT,
  program_status TEXT NOT NULL DEFAULT 'Active',
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_program_stamp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "merchant_select" ON public.loyalty_program_stamp FOR SELECT USING (auth.uid() = merchant_account_id AND is_deleted = false);
CREATE POLICY "merchant_insert" ON public.loyalty_program_stamp FOR INSERT WITH CHECK (auth.uid() = merchant_account_id);
CREATE POLICY "merchant_update" ON public.loyalty_program_stamp FOR UPDATE USING (auth.uid() = merchant_account_id);
CREATE POLICY "merchant_delete" ON public.loyalty_program_stamp FOR DELETE USING (auth.uid() = merchant_account_id);
CREATE TRIGGER update_loyalty_program_stamp_updated_at BEFORE UPDATE ON public.loyalty_program_stamp FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_lp_stamp_merchant ON public.loyalty_program_stamp(merchant_account_id);

-- ═══════════════════════════════════════
-- 2. POINT
-- ═══════════════════════════════════════
CREATE TABLE public.loyalty_program_point (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_account_id UUID NOT NULL,
  program_name TEXT NOT NULL,
  program_description TEXT,
  program_status TEXT NOT NULL DEFAULT 'Active',
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_program_point ENABLE ROW LEVEL SECURITY;
CREATE POLICY "merchant_select" ON public.loyalty_program_point FOR SELECT USING (auth.uid() = merchant_account_id AND is_deleted = false);
CREATE POLICY "merchant_insert" ON public.loyalty_program_point FOR INSERT WITH CHECK (auth.uid() = merchant_account_id);
CREATE POLICY "merchant_update" ON public.loyalty_program_point FOR UPDATE USING (auth.uid() = merchant_account_id);
CREATE POLICY "merchant_delete" ON public.loyalty_program_point FOR DELETE USING (auth.uid() = merchant_account_id);
CREATE TRIGGER update_loyalty_program_point_updated_at BEFORE UPDATE ON public.loyalty_program_point FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_lp_point_merchant ON public.loyalty_program_point(merchant_account_id);

-- ═══════════════════════════════════════
-- 3. DISCOUNT
-- ═══════════════════════════════════════
CREATE TABLE public.loyalty_program_discount (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_account_id UUID NOT NULL,
  program_name TEXT NOT NULL,
  program_description TEXT,
  program_status TEXT NOT NULL DEFAULT 'Active',
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_program_discount ENABLE ROW LEVEL SECURITY;
CREATE POLICY "merchant_select" ON public.loyalty_program_discount FOR SELECT USING (auth.uid() = merchant_account_id AND is_deleted = false);
CREATE POLICY "merchant_insert" ON public.loyalty_program_discount FOR INSERT WITH CHECK (auth.uid() = merchant_account_id);
CREATE POLICY "merchant_update" ON public.loyalty_program_discount FOR UPDATE USING (auth.uid() = merchant_account_id);
CREATE POLICY "merchant_delete" ON public.loyalty_program_discount FOR DELETE USING (auth.uid() = merchant_account_id);
CREATE TRIGGER update_loyalty_program_discount_updated_at BEFORE UPDATE ON public.loyalty_program_discount FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_lp_discount_merchant ON public.loyalty_program_discount(merchant_account_id);

-- ═══════════════════════════════════════
-- 4. VOUCHER
-- ═══════════════════════════════════════
CREATE TABLE public.loyalty_program_voucher (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_account_id UUID NOT NULL,
  program_name TEXT NOT NULL,
  program_description TEXT,
  program_status TEXT NOT NULL DEFAULT 'Active',
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_program_voucher ENABLE ROW LEVEL SECURITY;
CREATE POLICY "merchant_select" ON public.loyalty_program_voucher FOR SELECT USING (auth.uid() = merchant_account_id AND is_deleted = false);
CREATE POLICY "merchant_insert" ON public.loyalty_program_voucher FOR INSERT WITH CHECK (auth.uid() = merchant_account_id);
CREATE POLICY "merchant_update" ON public.loyalty_program_voucher FOR UPDATE USING (auth.uid() = merchant_account_id);
CREATE POLICY "merchant_delete" ON public.loyalty_program_voucher FOR DELETE USING (auth.uid() = merchant_account_id);
CREATE TRIGGER update_loyalty_program_voucher_updated_at BEFORE UPDATE ON public.loyalty_program_voucher FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_lp_voucher_merchant ON public.loyalty_program_voucher(merchant_account_id);

-- ═══════════════════════════════════════
-- 5. CONTEST
-- ═══════════════════════════════════════
CREATE TABLE public.loyalty_program_contest (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_account_id UUID NOT NULL,
  program_name TEXT NOT NULL,
  program_description TEXT,
  program_status TEXT NOT NULL DEFAULT 'Active',
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_program_contest ENABLE ROW LEVEL SECURITY;
CREATE POLICY "merchant_select" ON public.loyalty_program_contest FOR SELECT USING (auth.uid() = merchant_account_id AND is_deleted = false);
CREATE POLICY "merchant_insert" ON public.loyalty_program_contest FOR INSERT WITH CHECK (auth.uid() = merchant_account_id);
CREATE POLICY "merchant_update" ON public.loyalty_program_contest FOR UPDATE USING (auth.uid() = merchant_account_id);
CREATE POLICY "merchant_delete" ON public.loyalty_program_contest FOR DELETE USING (auth.uid() = merchant_account_id);
CREATE TRIGGER update_loyalty_program_contest_updated_at BEFORE UPDATE ON public.loyalty_program_contest FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_lp_contest_merchant ON public.loyalty_program_contest(merchant_account_id);

-- ═══════════════════════════════════════
-- 6. EVENT
-- ═══════════════════════════════════════
CREATE TABLE public.loyalty_program_event (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_account_id UUID NOT NULL,
  program_name TEXT NOT NULL,
  program_description TEXT,
  program_status TEXT NOT NULL DEFAULT 'Active',
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_program_event ENABLE ROW LEVEL SECURITY;
CREATE POLICY "merchant_select" ON public.loyalty_program_event FOR SELECT USING (auth.uid() = merchant_account_id AND is_deleted = false);
CREATE POLICY "merchant_insert" ON public.loyalty_program_event FOR INSERT WITH CHECK (auth.uid() = merchant_account_id);
CREATE POLICY "merchant_update" ON public.loyalty_program_event FOR UPDATE USING (auth.uid() = merchant_account_id);
CREATE POLICY "merchant_delete" ON public.loyalty_program_event FOR DELETE USING (auth.uid() = merchant_account_id);
CREATE TRIGGER update_loyalty_program_event_updated_at BEFORE UPDATE ON public.loyalty_program_event FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_lp_event_merchant ON public.loyalty_program_event(merchant_account_id);

-- ═══════════════════════════════════════
-- 7. COUPON
-- ═══════════════════════════════════════
CREATE TABLE public.loyalty_program_coupon (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_account_id UUID NOT NULL,
  program_name TEXT NOT NULL,
  program_description TEXT,
  program_status TEXT NOT NULL DEFAULT 'Active',
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_program_coupon ENABLE ROW LEVEL SECURITY;
CREATE POLICY "merchant_select" ON public.loyalty_program_coupon FOR SELECT USING (auth.uid() = merchant_account_id AND is_deleted = false);
CREATE POLICY "merchant_insert" ON public.loyalty_program_coupon FOR INSERT WITH CHECK (auth.uid() = merchant_account_id);
CREATE POLICY "merchant_update" ON public.loyalty_program_coupon FOR UPDATE USING (auth.uid() = merchant_account_id);
CREATE POLICY "merchant_delete" ON public.loyalty_program_coupon FOR DELETE USING (auth.uid() = merchant_account_id);
CREATE TRIGGER update_loyalty_program_coupon_updated_at BEFORE UPDATE ON public.loyalty_program_coupon FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_lp_coupon_merchant ON public.loyalty_program_coupon(merchant_account_id);

-- ═══════════════════════════════════════
-- 8. REFERRAL
-- ═══════════════════════════════════════
CREATE TABLE public.loyalty_program_referral (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_account_id UUID NOT NULL,
  program_name TEXT NOT NULL,
  program_description TEXT,
  program_status TEXT NOT NULL DEFAULT 'Active',
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_program_referral ENABLE ROW LEVEL SECURITY;
CREATE POLICY "merchant_select" ON public.loyalty_program_referral FOR SELECT USING (auth.uid() = merchant_account_id AND is_deleted = false);
CREATE POLICY "merchant_insert" ON public.loyalty_program_referral FOR INSERT WITH CHECK (auth.uid() = merchant_account_id);
CREATE POLICY "merchant_update" ON public.loyalty_program_referral FOR UPDATE USING (auth.uid() = merchant_account_id);
CREATE POLICY "merchant_delete" ON public.loyalty_program_referral FOR DELETE USING (auth.uid() = merchant_account_id);
CREATE TRIGGER update_loyalty_program_referral_updated_at BEFORE UPDATE ON public.loyalty_program_referral FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_lp_referral_merchant ON public.loyalty_program_referral(merchant_account_id);

-- ═══════════════════════════════════════
-- POLYMORPHIC JUNCTION TABLE
-- ═══════════════════════════════════════
CREATE TABLE public.membership_card_loyalty_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_account_id UUID NOT NULL,
  membership_card_id UUID NOT NULL REFERENCES public.membership_cards(id) ON DELETE CASCADE,
  loyalty_program_type public.loyalty_program_module_type NOT NULL,
  loyalty_program_record_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (membership_card_id, loyalty_program_type, loyalty_program_record_id)
);
ALTER TABLE public.membership_card_loyalty_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "merchant_select" ON public.membership_card_loyalty_programs FOR SELECT
  USING (auth.uid() = merchant_account_id);

CREATE POLICY "merchant_insert" ON public.membership_card_loyalty_programs FOR INSERT
  WITH CHECK (
    auth.uid() = merchant_account_id
    AND EXISTS (SELECT 1 FROM public.membership_cards WHERE id = membership_card_id AND merchant_account_id = auth.uid())
  );

CREATE POLICY "merchant_delete" ON public.membership_card_loyalty_programs FOR DELETE
  USING (auth.uid() = merchant_account_id);

CREATE POLICY "merchant_update" ON public.membership_card_loyalty_programs FOR UPDATE
  USING (auth.uid() = merchant_account_id);

CREATE TRIGGER update_mclp_updated_at BEFORE UPDATE ON public.membership_card_loyalty_programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_mclp_card ON public.membership_card_loyalty_programs(membership_card_id);
CREATE INDEX idx_mclp_merchant ON public.membership_card_loyalty_programs(merchant_account_id);
CREATE INDEX idx_mclp_type_record ON public.membership_card_loyalty_programs(loyalty_program_type, loyalty_program_record_id);
