
ALTER TABLE public.membership_cards
ADD COLUMN card_level TEXT,
ADD COLUMN fee_payment_cycle TEXT,
ADD COLUMN card_image_front_url TEXT,
ADD COLUMN card_image_back_url TEXT;
