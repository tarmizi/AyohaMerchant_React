
-- Add column
ALTER TABLE public.loyalty_program_stampcard_slots
ADD COLUMN is_redeem_item text NOT NULL DEFAULT 'N';

-- Backfill existing records
UPDATE public.loyalty_program_stampcard_slots
SET is_redeem_item = CASE
  WHEN reward_value_text IS NOT NULL AND btrim(reward_value_text) <> '' THEN 'Y'
  ELSE 'N'
END;

-- Create trigger function
CREATE OR REPLACE FUNCTION public.set_is_redeem_item()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.reward_value_text IS NOT NULL AND btrim(NEW.reward_value_text) <> '' THEN
    NEW.is_redeem_item := 'Y';
  ELSE
    NEW.is_redeem_item := 'N';
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger for INSERT and UPDATE
CREATE TRIGGER trg_set_is_redeem_item
BEFORE INSERT OR UPDATE ON public.loyalty_program_stampcard_slots
FOR EACH ROW
EXECUTE FUNCTION public.set_is_redeem_item();
