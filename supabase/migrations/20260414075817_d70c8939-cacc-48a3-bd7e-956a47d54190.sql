
ALTER TABLE public.loyalty_program_stamp
  ADD COLUMN IF NOT EXISTS stamp_campaign_code text,
  ADD COLUMN IF NOT EXISTS stamp_card_type text NOT NULL DEFAULT 'Stamp Card',
  ADD COLUMN IF NOT EXISTS stamp_rule_amount integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS stamp_rule_descriptions text,
  ADD COLUMN IF NOT EXISTS is_popup_stamp_rule boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_campaign_date_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS campaign_start_date date,
  ADD COLUMN IF NOT EXISTS campaign_end_date date,
  ADD COLUMN IF NOT EXISTS subscribers_count integer NOT NULL DEFAULT 0;

-- Add trigger for updated_at if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_loyalty_program_stamp_updated_at'
  ) THEN
    CREATE TRIGGER update_loyalty_program_stamp_updated_at
      BEFORE UPDATE ON public.loyalty_program_stamp
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END;
$$;
