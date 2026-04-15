import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type LoyaltyProgramModuleType =
  | "stamp" | "point" | "discount" | "voucher"
  | "contest" | "event" | "coupon" | "referral";

const TABLE_MAP: Record<LoyaltyProgramModuleType, string> = {
  stamp: "loyalty_program_stamp",
  point: "loyalty_program_point",
  discount: "loyalty_program_discount",
  voucher: "loyalty_program_voucher",
  contest: "loyalty_program_contest",
  event: "loyalty_program_event",
  coupon: "loyalty_program_coupon",
  referral: "loyalty_program_referral",
};

export interface LoyaltyProgramMasterRecord {
  id: string;
  merchant_account_id: string;
  loyalty_program_type: LoyaltyProgramModuleType;
  loyalty_program_record_id: string;
  status: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  // Resolved from source table at runtime
  program_name?: string;
  program_description?: string | null;
  program_status?: string;
}

export interface LoyaltyProgramRecord {
  id: string;
  merchant_account_id: string;
  program_name: string;
  program_description: string | null;
  program_status: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  _program_type?: LoyaltyProgramModuleType;
}

export interface CardProgramLink {
  id: string;
  merchant_account_id: string;
  membership_card_id: string;
  loyalty_program_type: LoyaltyProgramModuleType;
  loyalty_program_record_id: string;
  status: string;
  linked_at: string | null;
  created_at: string;
  updated_at: string;
  _program?: LoyaltyProgramRecord;
}

/**
 * Fetch ALL available programs from loyalty_program_master,
 * enriched with source table details (program_name etc).
 * This is the ONLY source for "Available Programs".
 */
export const useAllLoyaltyPrograms = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["loyalty-programs-master", user?.id],
    queryFn: async () => {
      if (!user?.id) return [] as LoyaltyProgramMasterRecord[];

      // 1. Get all master records (non-deleted)
      const { data: masterRows, error } = await supabase
        .from("loyalty_program_master" as any)
        .select("*")
        .eq("merchant_account_id", user.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!masterRows || masterRows.length === 0) return [] as LoyaltyProgramMasterRecord[];

      const records = masterRows as unknown as LoyaltyProgramMasterRecord[];

      // 2. Group by type to batch-fetch source details
      const byType: Record<string, LoyaltyProgramMasterRecord[]> = {};
      for (const r of records) {
        (byType[r.loyalty_program_type] ||= []).push(r);
      }

      // 3. Enrich with source table fields
      for (const [type, items] of Object.entries(byType)) {
        const table = TABLE_MAP[type as LoyaltyProgramModuleType];
        if (!table) continue;
        const ids = items.map((i) => i.loyalty_program_record_id);
        const { data: sourceRows } = await supabase
          .from(table as any)
          .select("id, program_name, program_description, program_status")
          .eq("merchant_account_id", user.id)
          .eq("is_deleted", false)
          .in("id", ids);
        if (sourceRows) {
          const map = new Map(sourceRows.map((s: any) => [s.id, s]));
          for (const item of items) {
            const src = map.get(item.loyalty_program_record_id);
            if (src) {
              item.program_name = src.program_name;
              item.program_description = src.program_description;
              item.program_status = src.program_status;
            }
          }
        }
      }

      return records.filter((record) => !!record.program_name);
    },
    enabled: !!user,
  });
};

/** Fetch linked programs for a specific membership card (from membership_card_loyalty_programs) */
export const useLinkedPrograms = (cardId: string | undefined) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["linked-programs", cardId],
    queryFn: async () => {
      if (!user?.id || !cardId) return [] as CardProgramLink[];

      const { data, error } = await supabase
        .from("membership_card_loyalty_programs" as any)
        .select("*")
        .eq("merchant_account_id", user.id)
        .eq("membership_card_id", cardId!);
      if (error) throw error;

      const links = data as unknown as CardProgramLink[];

      // Resolve each program record from source table
      const resolved: CardProgramLink[] = [];
      const byType: Record<string, CardProgramLink[]> = {};
      for (const link of links) {
        (byType[link.loyalty_program_type] ||= []).push(link);
      }

      for (const [type, items] of Object.entries(byType)) {
        const table = TABLE_MAP[type as LoyaltyProgramModuleType];
        if (!table) continue;
        const ids = items.map((i) => i.loyalty_program_record_id);
        const { data: sourceRows } = await supabase
          .from(table as any)
          .select("*")
          .eq("merchant_account_id", user.id)
          .eq("is_deleted", false)
          .in("id", ids);
        const map = new Map((sourceRows || []).map((s: any) => [s.id, s]));
        for (const link of items) {
          const prog = map.get(link.loyalty_program_record_id);
          resolved.push({
            ...link,
            _program: prog
              ? { ...(prog as unknown as LoyaltyProgramRecord), _program_type: link.loyalty_program_type }
              : undefined,
          });
        }
      }
      return resolved;
    },
    enabled: !!user && !!cardId,
  });
};

/** Link a program to a membership card */
export const useLinkProgram = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      cardId,
      programId,
      programType,
    }: {
      cardId: string;
      programId: string;
      programType: LoyaltyProgramModuleType;
    }) => {
      if (!user?.id) throw new Error("Authentication required");

      const { data: existing, error: existingError } = await supabase
        .from("membership_card_loyalty_programs" as any)
        .select("id")
        .eq("merchant_account_id", user.id)
        .eq("membership_card_id", cardId)
        .eq("loyalty_program_type", programType)
        .eq("loyalty_program_record_id", programId)
        .maybeSingle();

      if (existingError && existingError.code !== "PGRST116") throw existingError;

      if (existing) {
        const duplicateError = new Error("This Program Already add In This Membership Card") as Error & { code?: string };
        duplicateError.code = "DUPLICATE_PROGRAM_LINK";
        throw duplicateError;
      }

      const { error } = await supabase
        .from("membership_card_loyalty_programs" as any)
        .insert({
          merchant_account_id: user!.id,
          membership_card_id: cardId,
          loyalty_program_type: programType,
          loyalty_program_record_id: programId,
          linked_at: new Date().toISOString(),
        } as any);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["linked-programs", vars.cardId] });
      qc.invalidateQueries({ queryKey: ["linked-stamp-programs", vars.cardId] });
      qc.invalidateQueries({ queryKey: ["loyalty-programs-master"] });
      toast.success("Program linked to membership card");
    },
    onError: (err: any) => {
      if (err?.code === "DUPLICATE_PROGRAM_LINK" || err?.code === "23505") {
        toast.info("This Program Already add In This Membership Card");
      } else {
        toast.error("Failed to link program");
      }
    },
  });
};

/** Unlink a program from a membership card */
export const useUnlinkProgram = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ linkId, cardId }: { linkId: string; cardId: string }) => {
      const { error } = await supabase
        .from("membership_card_loyalty_programs" as any)
        .delete()
        .eq("id", linkId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["linked-programs", vars.cardId] });
      qc.invalidateQueries({ queryKey: ["linked-stamp-programs", vars.cardId] });
      qc.invalidateQueries({ queryKey: ["loyalty-programs-master"] });
      toast.success("Program removed from membership card");
    },
    onError: () => toast.error("Failed to remove program"),
  });
};

// Keep backward compat for pages that use these
export const useLoyaltyProgramsByType = (type: LoyaltyProgramModuleType) => {
  const { user } = useAuth();
  const table = TABLE_MAP[type] as any;
  return useQuery({
    queryKey: ["loyalty-programs", type, user?.id],
    queryFn: async () => {
      if (!user?.id) return [] as LoyaltyProgramRecord[];

      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("merchant_account_id", user.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as LoyaltyProgramRecord[]).map((p) => ({ ...p, _program_type: type }));
    },
    enabled: !!user,
  });
};
