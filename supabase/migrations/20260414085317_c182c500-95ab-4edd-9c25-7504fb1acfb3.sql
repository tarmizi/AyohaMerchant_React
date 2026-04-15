
-- Add social visibility toggles to stampcard design
ALTER TABLE public.loyalty_program_stampcard
  ADD COLUMN IF NOT EXISTS show_facebook boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_instagram boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_whatsapp boolean NOT NULL DEFAULT true;

-- Add merchant_account_id to slots for direct ownership
ALTER TABLE public.loyalty_program_stampcard_slots
  ADD COLUMN IF NOT EXISTS merchant_account_id uuid;

-- Backfill merchant_account_id from parent
UPDATE public.loyalty_program_stampcard_slots s
SET merchant_account_id = c.merchant_account_id
FROM public.loyalty_program_stampcard c
WHERE s.loyalty_program_stampcard_id = c.id
  AND s.merchant_account_id IS NULL;

-- Make it NOT NULL after backfill
ALTER TABLE public.loyalty_program_stampcard_slots
  ALTER COLUMN merchant_account_id SET NOT NULL;
