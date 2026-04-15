
-- Create the subscriber stamp transaction table
CREATE TABLE public.loyalty_program_stamp_subscriber (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_account_id uuid NOT NULL,
  loyalty_program_stampcard_id uuid NOT NULL REFERENCES public.loyalty_program_stampcard(id),
  subscriber_accno text NOT NULL,
  slot_no integer NOT NULL,
  slot_type text NOT NULL DEFAULT 'sequence',
  slot_label text,
  perk_image_url text,
  perk_title text,
  perk_description text,
  reward_value_text text,
  is_redeem_item text NOT NULL DEFAULT 'N',
  sort_order integer NOT NULL DEFAULT 1,
  batch integer NOT NULL DEFAULT 1,
  stamped_status text NOT NULL DEFAULT 'N',
  stamped_by text,
  stamped_date timestamptz,
  stamped_redeem_status text,
  stamped_method text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (loyalty_program_stampcard_id, subscriber_accno, slot_no, batch)
);

-- Indexes
CREATE INDEX idx_stamp_subscriber_merchant ON public.loyalty_program_stamp_subscriber(merchant_account_id);
CREATE INDEX idx_stamp_subscriber_accno ON public.loyalty_program_stamp_subscriber(subscriber_accno);
CREATE INDEX idx_stamp_subscriber_card ON public.loyalty_program_stamp_subscriber(loyalty_program_stampcard_id);

-- Enable RLS
ALTER TABLE public.loyalty_program_stamp_subscriber ENABLE ROW LEVEL SECURITY;

CREATE POLICY "merchant_select" ON public.loyalty_program_stamp_subscriber
  FOR SELECT USING (auth.uid() = merchant_account_id);

CREATE POLICY "merchant_insert" ON public.loyalty_program_stamp_subscriber
  FOR INSERT WITH CHECK (auth.uid() = merchant_account_id);

CREATE POLICY "merchant_update" ON public.loyalty_program_stamp_subscriber
  FOR UPDATE USING (auth.uid() = merchant_account_id);

CREATE POLICY "merchant_delete" ON public.loyalty_program_stamp_subscriber
  FOR DELETE USING (auth.uid() = merchant_account_id);

-- Auto-update updated_at
CREATE TRIGGER update_stamp_subscriber_updated_at
  BEFORE UPDATE ON public.loyalty_program_stamp_subscriber
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Generation function: copies slot templates into subscriber rows
-- Prevents duplicates for same subscriber + stampcard + batch
CREATE OR REPLACE FUNCTION public.generate_subscriber_stamp_rows(
  p_merchant_account_id uuid,
  p_loyalty_program_stampcard_id uuid,
  p_subscriber_accno text,
  p_batch integer DEFAULT 1
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  -- Guard: check if rows already exist for this subscriber/card/batch
  IF EXISTS (
    SELECT 1 FROM public.loyalty_program_stamp_subscriber
    WHERE loyalty_program_stampcard_id = p_loyalty_program_stampcard_id
      AND subscriber_accno = p_subscriber_accno
      AND batch = p_batch
  ) THEN
    RETURN 0; -- already generated, skip
  END IF;

  INSERT INTO public.loyalty_program_stamp_subscriber (
    merchant_account_id,
    loyalty_program_stampcard_id,
    subscriber_accno,
    slot_no,
    slot_type,
    slot_label,
    perk_image_url,
    perk_title,
    perk_description,
    reward_value_text,
    is_redeem_item,
    sort_order,
    batch,
    stamped_status,
    stamped_by,
    stamped_date,
    stamped_redeem_status,
    stamped_method
  )
  SELECT
    p_merchant_account_id,
    s.loyalty_program_stampcard_id,
    p_subscriber_accno,
    s.slot_no,
    s.slot_type,
    s.slot_label,
    s.perk_image_url,
    s.perk_title,
    s.perk_description,
    s.reward_value_text,
    s.is_redeem_item,
    s.sort_order,
    p_batch,
    'N',
    NULL,
    NULL,
    NULL,
    NULL
  FROM public.loyalty_program_stampcard_slots s
  WHERE s.loyalty_program_stampcard_id = p_loyalty_program_stampcard_id
  ORDER BY s.sort_order;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
