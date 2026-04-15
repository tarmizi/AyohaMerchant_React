import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type MembershipCard = {
  id: string;
  merchant_account_id: string;
  card_name: string;
  card_description: string | null;
  card_image_url: string | null;
  card_image_front_url: string | null;
  card_image_back_url: string | null;
  card_status: "Active" | "Inactive";
  card_type: string | null;
  card_level: string | null;
  fee_payment_cycle: string | null;
  validity_start: string | null;
  validity_end: string | null;
  terms_conditions: string | null;
  max_members: number | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
};

const QUERY_KEY = "membership_cards";

export function useMembershipCards() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEY, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("membership_cards")
        .select("*")
        .eq("merchant_account_id", user.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MembershipCard[];
    },
    enabled: !!user,
  });
}

export function useMembershipCard(id: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id || !user) return null;
      const { data, error } = await supabase
        .from("membership_cards")
        .select("*")
        .eq("id", id)
        .eq("is_deleted", false)
        .single();
      if (error) throw error;
      return data as MembershipCard;
    },
    enabled: !!id && !!user,
  });
}

export function useCreateMembershipCard() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (card: Omit<MembershipCard, "id" | "merchant_account_id" | "is_deleted" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("membership_cards")
        .insert({ ...card, merchant_account_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateMembershipCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MembershipCard> & { id: string }) => {
      const { data, error } = await supabase
        .from("membership_cards")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteMembershipCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("membership_cards")
        .update({ is_deleted: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export async function uploadCardImage(file: File, cardId: string): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `cards/${cardId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("merchant-avatars")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("merchant-avatars").getPublicUrl(path);
  return data.publicUrl;
}
