import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface StampNowParams {
  stampcardId: string;
  customerAuthUserId: string;
  membershipId: string;
  programId: string;
}

export function useStampNow() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: StampNowParams) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { stampcardId, customerAuthUserId } = params;

      // Find the unstamped slot with the smallest slot_no
      const { data: unstamped, error: fetchErr } = await supabase
        .from("loyalty_program_stamp_subscriber")
        .select("id, slot_no")
        .eq("loyalty_program_stampcard_id", stampcardId)
        .eq("customer_auth_user_id", customerAuthUserId)
        .eq("merchant_account_id", user.id)
        .eq("stamped_status", "N")
        .order("slot_no", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (fetchErr) throw fetchErr;
      if (!unstamped) throw new Error("NO_SLOTS"); // all slots already stamped or none exist

      // Update that one slot
      const { error: updateErr } = await supabase
        .from("loyalty_program_stamp_subscriber")
        .update({
          stamped_status: "Y",
          stamped_date: new Date().toISOString(),
          stamped_by: user.email ?? user.id,
          stamped_method: "manual",
        })
        .eq("id", (unstamped as any).id);

      if (updateErr) throw updateErr;

      return { slotNo: (unstamped as any).slot_no };
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({
        queryKey: ["stamp_card_detail", params.membershipId, params.programId],
      });
    },
  });
}
