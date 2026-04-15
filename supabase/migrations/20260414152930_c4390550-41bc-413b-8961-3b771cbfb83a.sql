
-- 1. Add entitlement_status to merchant_quotas
ALTER TABLE public.merchant_quotas
  ADD COLUMN IF NOT EXISTS entitlement_status text NOT NULL DEFAULT 'active';

-- 2. Create monetization_config table
CREATE TABLE public.monetization_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_type text NOT NULL,
  default_free_quota integer NOT NULL DEFAULT 1,
  extra_unit_price numeric(10,2) DEFAULT 0,
  currency text NOT NULL DEFAULT 'MYR',
  is_active boolean NOT NULL DEFAULT true,
  effective_from timestamp with time zone DEFAULT now(),
  effective_to timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT monetization_config_resource_type_check CHECK (resource_type IN ('membership_card', 'loyalty_program'))
);

ALTER TABLE public.monetization_config ENABLE ROW LEVEL SECURITY;

-- Read-only for authenticated users (future: restrict to platform_admin)
CREATE POLICY "Authenticated users can view monetization config"
  ON public.monetization_config FOR SELECT TO authenticated
  USING (true);

-- Seed default config
INSERT INTO public.monetization_config (resource_type, default_free_quota, extra_unit_price, currency)
VALUES
  ('membership_card', 1, 0, 'MYR'),
  ('loyalty_program', 1, 0, 'MYR');

-- 3. Create merchant_quota_overrides table
CREATE TABLE public.merchant_quota_overrides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_account_id uuid NOT NULL,
  resource_type text NOT NULL,
  override_quota integer NOT NULL DEFAULT 1,
  override_price_per_extra_unit numeric(10,2) DEFAULT NULL,
  override_reason text DEFAULT NULL,
  is_active boolean NOT NULL DEFAULT true,
  effective_from timestamp with time zone DEFAULT now(),
  effective_to timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT merchant_quota_overrides_resource_type_check CHECK (resource_type IN ('membership_card', 'loyalty_program'))
);

ALTER TABLE public.merchant_quota_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view own quota overrides"
  ON public.merchant_quota_overrides FOR SELECT TO authenticated
  USING (auth.uid() = merchant_account_id);

-- 4. Auto-sync trigger: insert into loyalty_program_master on source table create
CREATE OR REPLACE FUNCTION public.sync_loyalty_program_master()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_type text;
BEGIN
  -- Determine program type from TG_TABLE_NAME
  v_type := replace(TG_TABLE_NAME, 'loyalty_program_', '');

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.loyalty_program_master (
      merchant_account_id, loyalty_program_type, loyalty_program_record_id, status, is_deleted
    ) VALUES (
      NEW.merchant_account_id, v_type::loyalty_program_module_type, NEW.id, NEW.program_status, false
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Sync soft delete and status
    UPDATE public.loyalty_program_master
    SET
      status = NEW.program_status,
      is_deleted = NEW.is_deleted,
      deleted_at = CASE WHEN NEW.is_deleted = true AND OLD.is_deleted = false THEN now() ELSE deleted_at END,
      updated_at = now()
    WHERE loyalty_program_record_id = NEW.id
      AND loyalty_program_type = v_type::loyalty_program_module_type
      AND merchant_account_id = NEW.merchant_account_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Attach triggers to all 8 source tables
CREATE TRIGGER sync_master_stamp AFTER INSERT OR UPDATE ON public.loyalty_program_stamp
  FOR EACH ROW EXECUTE FUNCTION public.sync_loyalty_program_master();

CREATE TRIGGER sync_master_point AFTER INSERT OR UPDATE ON public.loyalty_program_point
  FOR EACH ROW EXECUTE FUNCTION public.sync_loyalty_program_master();

CREATE TRIGGER sync_master_discount AFTER INSERT OR UPDATE ON public.loyalty_program_discount
  FOR EACH ROW EXECUTE FUNCTION public.sync_loyalty_program_master();

CREATE TRIGGER sync_master_voucher AFTER INSERT OR UPDATE ON public.loyalty_program_voucher
  FOR EACH ROW EXECUTE FUNCTION public.sync_loyalty_program_master();

CREATE TRIGGER sync_master_contest AFTER INSERT OR UPDATE ON public.loyalty_program_contest
  FOR EACH ROW EXECUTE FUNCTION public.sync_loyalty_program_master();

CREATE TRIGGER sync_master_event AFTER INSERT OR UPDATE ON public.loyalty_program_event
  FOR EACH ROW EXECUTE FUNCTION public.sync_loyalty_program_master();

CREATE TRIGGER sync_master_coupon AFTER INSERT OR UPDATE ON public.loyalty_program_coupon
  FOR EACH ROW EXECUTE FUNCTION public.sync_loyalty_program_master();

CREATE TRIGGER sync_master_referral AFTER INSERT OR UPDATE ON public.loyalty_program_referral
  FOR EACH ROW EXECUTE FUNCTION public.sync_loyalty_program_master();

-- Timestamps triggers for new tables
CREATE TRIGGER update_monetization_config_updated_at
  BEFORE UPDATE ON public.monetization_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_merchant_quota_overrides_updated_at
  BEFORE UPDATE ON public.merchant_quota_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
