
-- Stamp Card Design Master Table
CREATE TABLE public.loyalty_program_stampcard (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_account_id uuid NOT NULL,
  loyalty_program_stamp_id uuid NOT NULL REFERENCES public.loyalty_program_stamp(id) ON DELETE RESTRICT,
  stampcard_name text NOT NULL,
  stampcard_title text,
  enterprise_name_display text,
  campaign_name_display text,
  expiry_text_display text,
  background_image_url text,
  logo_image_url text,
  primary_theme_color text,
  secondary_theme_color text,
  is_nfc_enabled boolean NOT NULL DEFAULT false,
  is_qr_enabled boolean NOT NULL DEFAULT true,
  stamp_rule_note_text text,
  contact_us_title text,
  facebook_url text,
  instagram_url text,
  whatsapp_url text,
  total_stamp_slots integer NOT NULL DEFAULT 11,
  reward_box_label text DEFAULT 'Reward',
  qr_box_label text DEFAULT 'QR Code',
  status text NOT NULL DEFAULT 'Active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT total_stamp_slots_range CHECK (total_stamp_slots >= 1 AND total_stamp_slots <= 11),
  CONSTRAINT unique_stamp_design_per_campaign UNIQUE (loyalty_program_stamp_id)
);

-- Enable RLS
ALTER TABLE public.loyalty_program_stampcard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "merchant_select" ON public.loyalty_program_stampcard FOR SELECT USING (auth.uid() = merchant_account_id);
CREATE POLICY "merchant_insert" ON public.loyalty_program_stampcard FOR INSERT WITH CHECK (auth.uid() = merchant_account_id);
CREATE POLICY "merchant_update" ON public.loyalty_program_stampcard FOR UPDATE USING (auth.uid() = merchant_account_id);
CREATE POLICY "merchant_delete" ON public.loyalty_program_stampcard FOR DELETE USING (auth.uid() = merchant_account_id);

-- Updated_at trigger
CREATE TRIGGER update_loyalty_program_stampcard_updated_at
  BEFORE UPDATE ON public.loyalty_program_stampcard
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Stamp Card Slots Detail Table
CREATE TABLE public.loyalty_program_stampcard_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loyalty_program_stampcard_id uuid NOT NULL REFERENCES public.loyalty_program_stampcard(id) ON DELETE CASCADE,
  slot_no integer NOT NULL,
  slot_type text NOT NULL DEFAULT 'sequence',
  slot_label text,
  perk_image_url text,
  perk_title text,
  perk_description text,
  reward_value_text text,
  sort_order integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT slot_no_range CHECK (slot_no >= 1 AND slot_no <= 11),
  CONSTRAINT slot_type_values CHECK (slot_type IN ('sequence', 'perk')),
  CONSTRAINT unique_slot_per_stampcard UNIQUE (loyalty_program_stampcard_id, slot_no)
);

-- Enable RLS (access via parent's merchant_account_id)
ALTER TABLE public.loyalty_program_stampcard_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "merchant_select" ON public.loyalty_program_stampcard_slots FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.loyalty_program_stampcard sc WHERE sc.id = loyalty_program_stampcard_id AND sc.merchant_account_id = auth.uid()));
CREATE POLICY "merchant_insert" ON public.loyalty_program_stampcard_slots FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.loyalty_program_stampcard sc WHERE sc.id = loyalty_program_stampcard_id AND sc.merchant_account_id = auth.uid()));
CREATE POLICY "merchant_update" ON public.loyalty_program_stampcard_slots FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.loyalty_program_stampcard sc WHERE sc.id = loyalty_program_stampcard_id AND sc.merchant_account_id = auth.uid()));
CREATE POLICY "merchant_delete" ON public.loyalty_program_stampcard_slots FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.loyalty_program_stampcard sc WHERE sc.id = loyalty_program_stampcard_id AND sc.merchant_account_id = auth.uid()));

-- Updated_at trigger
CREATE TRIGGER update_loyalty_program_stampcard_slots_updated_at
  BEFORE UPDATE ON public.loyalty_program_stampcard_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast lookups
CREATE INDEX idx_stampcard_merchant ON public.loyalty_program_stampcard(merchant_account_id);
CREATE INDEX idx_stampcard_campaign ON public.loyalty_program_stampcard(loyalty_program_stamp_id);
CREATE INDEX idx_stampcard_slots_card ON public.loyalty_program_stampcard_slots(loyalty_program_stampcard_id);
