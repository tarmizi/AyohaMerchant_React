-- Allow authenticated merchants to read and update stamp subscriber slots for their cards.
-- SELECT: needed for Stamp Card Detail page to load progress.
-- UPDATE: needed for Stamp Card Now button to stamp a slot.

CREATE POLICY "Merchants can read stamp subscriber slots for their cards"
ON public.loyalty_program_stamp_subscriber
FOR SELECT
TO authenticated
USING (merchant_account_id = auth.uid());

CREATE POLICY "Merchants can update stamp subscriber slots for their cards"
ON public.loyalty_program_stamp_subscriber
FOR UPDATE
TO authenticated
USING (merchant_account_id = auth.uid())
WITH CHECK (merchant_account_id = auth.uid());
