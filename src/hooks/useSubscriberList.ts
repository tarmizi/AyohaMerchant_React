import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CustomerProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_no: string | null;
  profile_image_url: string | null;
}

export interface MembershipCard {
  id: string;
  card_name: string | null;
  card_image_front_url: string | null;
}

export interface MerchantMembership {
  id: string;
  merchant_id: string;
  customer_profile_id: string | null;
  membership_card_id: string | null;
  membership_status: string | null;
  membership_no: string | null;
  card_level: string | null;
  card_type: string | null;
  membership_date: string | null;
  fee_payment_cycle: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_deleted: boolean | null;
  customer_profile: CustomerProfile | null;
  membership_card: MembershipCard | null;
}

export function useSubscriberList() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["merchant_memberships", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Step 1: fetch memberships
      const { data: memberships, error: mErr } = await (supabase as any)
        .from("merchant_memberships")
        .select("id, merchant_id, customer_profile_id, membership_card_id, membership_status, membership_no, card_level, card_type, membership_date, fee_payment_cycle, notes, created_at, updated_at, is_deleted")
        .eq("merchant_id", user.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (mErr) throw mErr;
      if (!memberships || memberships.length === 0) return [];

      // Step 2: collect unique IDs for both lookups
      const profileIds: string[] = [
        ...new Set(memberships.map((m: any) => m.customer_profile_id).filter(Boolean) as string[]),
      ];
      const cardIds: string[] = [
        ...new Set(memberships.map((m: any) => m.membership_card_id).filter(Boolean) as string[]),
      ];

      // Step 3a: fetch customer profiles
      const profileMap = new Map<string, CustomerProfile>();
      if (profileIds.length > 0) {
        const { data: profiles, error: pErr } = await (supabase as any)
          .from("customer_profiles")
          .select("id, full_name, email, phone_no, profile_image_url")
          .in("id", profileIds);
        if (pErr) throw pErr;
        for (const p of profiles ?? []) profileMap.set(p.id, p as CustomerProfile);
      }

      // Step 3b: fetch membership cards
      const cardMap = new Map<string, MembershipCard>();
      if (cardIds.length > 0) {
        const { data: cards, error: cErr } = await (supabase as any)
          .from("membership_cards")
          .select("id, card_name, card_image_front_url")
          .in("id", cardIds);
        if (cErr) throw cErr;
        for (const c of cards ?? []) cardMap.set(c.id, c as MembershipCard);
      }

      // Step 4: merge
      return memberships.map((m: any) => ({
        ...m,
        customer_profile: m.customer_profile_id ? (profileMap.get(m.customer_profile_id) ?? null) : null,
        membership_card: m.membership_card_id ? (cardMap.get(m.membership_card_id) ?? null) : null,
      })) as MerchantMembership[];
    },
    enabled: !!user,
  });
}
