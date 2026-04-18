-- membership_card_loyalty_programs is a configuration table (which programs are
-- attached to which cards). Any authenticated user in the merchant portal needs
-- to read it. Drop any restrictive policy and replace with an open read policy.

-- Drop previous versions if already applied
DROP POLICY IF EXISTS "Merchants can view loyalty programs linked to their cards" ON public.membership_card_loyalty_programs;
DROP POLICY IF EXISTS "Merchants can view loyalty programs for subscribed cards"  ON public.membership_card_loyalty_programs;

-- Allow all authenticated users to read — no row-level restriction needed here.
CREATE POLICY "Authenticated users can read membership_card_loyalty_programs"
ON public.membership_card_loyalty_programs
FOR SELECT
TO authenticated
USING (true);
