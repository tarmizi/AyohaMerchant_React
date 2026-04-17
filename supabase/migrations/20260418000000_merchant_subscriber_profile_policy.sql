-- Allow merchants to read customer profiles of their own subscribers.
-- Without this policy, RLS on customer_profiles blocks merchants from seeing
-- any profile other than their own, causing subscriber names/emails to show as "—".

CREATE POLICY "Merchants can view their subscriber profiles"
ON public.customer_profiles
FOR SELECT
USING (
  id IN (
    SELECT customer_profile_id
    FROM public.merchant_memberships
    WHERE merchant_id = auth.uid()
      AND is_deleted = false
      AND customer_profile_id IS NOT NULL
  )
);
