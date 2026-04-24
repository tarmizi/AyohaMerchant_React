import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ResetParams {
  stampcardId: string;
  customerAuthUserId: string;
  subscriberAccno: string;
  membershipId: string;
  programId: string;
}

export function useResetStampCard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ResetParams) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { stampcardId, customerAuthUserId, subscriberAccno } = params;

      // Step 1: get current max batch for this member's card
      const { data: existing } = await supabase
        .from("loyalty_program_stamp_subscriber")
        .select("batch")
        .eq("loyalty_program_stampcard_id", stampcardId)
        .eq("customer_auth_user_id", customerAuthUserId)
        .order("batch", { ascending: false })
        .limit(1)
        .maybeSingle();

      const currentBatch = (existing as any)?.batch ?? 1;
      const newBatch = currentBatch + 1;

      // Step 2: fetch slot configs from stampcard_slots
      const { data: slots, error: slotErr } = await (supabase as any)
        .from("loyalty_program_stampcard_slots")
        .select("slot_no, slot_type, slot_label, perk_image_url, perk_title, reward_value_text, is_redeem_item")
        .eq("loyalty_program_stampcard_id", stampcardId)
        .order("slot_no", { ascending: true });

      if (slotErr) throw slotErr;
      if (!slots || slots.length === 0) throw new Error("No slot configuration found");

      // Step 3: insert new subscriber rows for next batch
      const newRows = (slots as any[]).map((s) => ({
        loyalty_program_stampcard_id: stampcardId,
        customer_auth_user_id: customerAuthUserId,
        merchant_account_id: user.id,
        subscriber_accno: subscriberAccno,
        slot_no: s.slot_no,
        slot_type: s.slot_type ?? "sequence",
        slot_label: s.slot_label ?? null,
        perk_image_url: s.perk_image_url ?? null,
        perk_title: s.perk_title ?? null,
        reward_value_text: s.reward_value_text ?? null,
        is_redeem_item: s.is_redeem_item ?? "N",
        stamped_status: "N",
        stamped_date: null,
        stamped_by: null,
        stamped_method: null,
        batch: newBatch,
      }));

      const { error: insertErr } = await supabase
        .from("loyalty_program_stamp_subscriber")
        .insert(newRows as any);

      if (insertErr) throw insertErr;

      return { newBatch };
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({
        queryKey: ["stamp_card_detail", params.membershipId, params.programId],
      });
    },
  });
}
