import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/** System-wide default quotas (free tier). Central Admin can override per merchant via merchant_quotas table. */
const DEFAULT_QUOTAS = {
  max_membership_cards: 1,
  max_loyalty_programs: 1,
};

export interface MerchantQuota {
  max_membership_cards: number;
  max_loyalty_programs: number;
  current_membership_cards: number;
  current_loyalty_programs: number;
  can_create_card: boolean;
  can_create_program: boolean;
  cards_remaining: number;
  programs_remaining: number;
  isLoading: boolean;
}

/**
 * Fetch merchant quota limits and current usage counts.
 * - Membership card count: from `membership_cards` (active, non-deleted)
 * - Loyalty program count: from `loyalty_program_master` (non-deleted)
 * - Quota limits: from `merchant_quotas` override, falling back to system defaults
 */
export function useMerchantQuota(): MerchantQuota {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["merchant_quota", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      // Parallel fetch: quota overrides + current counts
      const [quotaRes, cardsRes, programsRes] = await Promise.all([
        supabase
          .from("merchant_quotas")
          .select("max_membership_cards, max_loyalty_programs")
          .eq("merchant_account_id", user.id)
          .maybeSingle(),
        supabase
          .from("membership_cards")
          .select("id", { count: "exact", head: true })
          .eq("merchant_account_id", user.id)
          .eq("is_deleted", false),
        supabase
          .from("loyalty_program_master")
          .select("id", { count: "exact", head: true })
          .eq("merchant_account_id", user.id)
          .eq("is_deleted", false),
      ]);

      const maxCards = quotaRes.data?.max_membership_cards ?? DEFAULT_QUOTAS.max_membership_cards;
      const maxPrograms = quotaRes.data?.max_loyalty_programs ?? DEFAULT_QUOTAS.max_loyalty_programs;
      const currentCards = cardsRes.count ?? 0;
      const currentPrograms = programsRes.count ?? 0;

      return {
        max_membership_cards: maxCards,
        max_loyalty_programs: maxPrograms,
        current_membership_cards: currentCards,
        current_loyalty_programs: currentPrograms,
      };
    },
    enabled: !!user,
  });

  const maxCards = data?.max_membership_cards ?? DEFAULT_QUOTAS.max_membership_cards;
  const maxPrograms = data?.max_loyalty_programs ?? DEFAULT_QUOTAS.max_loyalty_programs;
  const currentCards = data?.current_membership_cards ?? 0;
  const currentPrograms = data?.current_loyalty_programs ?? 0;

  return {
    max_membership_cards: maxCards,
    max_loyalty_programs: maxPrograms,
    current_membership_cards: currentCards,
    current_loyalty_programs: currentPrograms,
    can_create_card: currentCards < maxCards,
    can_create_program: currentPrograms < maxPrograms,
    cards_remaining: Math.max(0, maxCards - currentCards),
    programs_remaining: Math.max(0, maxPrograms - currentPrograms),
    isLoading,
  };
}
