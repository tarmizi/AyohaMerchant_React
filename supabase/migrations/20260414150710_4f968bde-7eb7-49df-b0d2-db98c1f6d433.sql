
CREATE TABLE public.merchant_quotas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_account_id uuid NOT NULL UNIQUE,
  max_membership_cards integer DEFAULT NULL,
  max_loyalty_programs integer DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.merchant_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view own quota"
ON public.merchant_quotas
FOR SELECT
TO authenticated
USING (auth.uid() = merchant_account_id);

CREATE TRIGGER update_merchant_quotas_updated_at
BEFORE UPDATE ON public.merchant_quotas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
