import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface StampProgramRecord {
  id: string;
  merchant_account_id: string;
  program_name: string;
  program_description: string | null;
  program_status: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  stamp_campaign_code: string | null;
  stamp_card_type: string;
  stamp_rule_amount: number;
  stamp_rule_descriptions: string | null;
  is_popup_stamp_rule: boolean;
  is_campaign_date_required: boolean;
  campaign_start_date: string | null;
  campaign_end_date: string | null;
  subscribers_count: number;
  // runtime enrichment
  _has_stampcard_design?: boolean;
}

/** Fetch all stamp programs for current merchant with design existence check */
export function useStampPrograms() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["stamp-programs-full", user?.id],
    queryFn: async () => {
      if (!user?.id) return [] as StampProgramRecord[];

      const { data: masterRows, error: masterError } = await supabase
        .from("loyalty_program_master")
        .select("loyalty_program_record_id")
        .eq("merchant_account_id", user.id)
        .eq("loyalty_program_type", "stamp")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
      if (masterError) throw masterError;

      const stampIds = (masterRows || []).map((row: any) => row.loyalty_program_record_id);
      if (stampIds.length === 0) return [] as StampProgramRecord[];

      const { data, error } = await supabase
        .from("loyalty_program_stamp")
        .select("*")
        .eq("merchant_account_id", user.id)
        .eq("is_deleted", false)
        .in("id", stampIds);
      if (error) throw error;

      const stampMap = new Map((data as StampProgramRecord[]).map((program) => [program.id, program]));
      const programs = stampIds
        .map((stampId) => stampMap.get(stampId))
        .filter((program): program is StampProgramRecord => !!program);

      // Check which ones have a stampcard design
      const ids = programs.map((p) => p.id);
      if (ids.length > 0) {
        const { data: designs } = await supabase
          .from("loyalty_program_stampcard")
          .select("loyalty_program_stamp_id")
          .in("loyalty_program_stamp_id", ids);
        const designSet = new Set((designs || []).map((d: any) => d.loyalty_program_stamp_id));
        for (const p of programs) {
          p._has_stampcard_design = designSet.has(p.id);
        }
      }

      return programs;
    },
    enabled: !!user,
  });
}

export interface StampCardLink {
  id: string;
  merchant_account_id: string;
  membership_card_id: string;
  loyalty_program_type: string;
  loyalty_program_record_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  _stamp_program?: StampProgramRecord;
}

/** Fetch stamp programs linked to a specific membership card */
export function useLinkedStampPrograms(cardId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["linked-stamp-programs", cardId],
    queryFn: async () => {
      if (!user?.id || !cardId) return [] as StampCardLink[];

      const { data, error } = await supabase
        .from("membership_card_loyalty_programs")
        .select("*")
        .eq("merchant_account_id", user.id)
        .eq("membership_card_id", cardId!)
        .eq("loyalty_program_type", "stamp");
      if (error) throw error;

      const links = data as unknown as StampCardLink[];
      const stampIds = links.map((l) => l.loyalty_program_record_id);

      if (stampIds.length > 0) {
        const { data: stamps } = await supabase
          .from("loyalty_program_stamp")
          .select("*")
          .eq("merchant_account_id", user.id)
          .eq("is_deleted", false)
          .in("id", stampIds);

        const stampMap = new Map((stamps || []).map((s: any) => [s.id, s as StampProgramRecord]));

        // Also check for stampcard designs
        const { data: designs } = await supabase
          .from("loyalty_program_stampcard")
          .select("loyalty_program_stamp_id")
          .in("loyalty_program_stamp_id", stampIds);
        const designSet = new Set((designs || []).map((d: any) => d.loyalty_program_stamp_id));

        for (const link of links) {
          const prog = stampMap.get(link.loyalty_program_record_id);
          if (prog) {
            prog._has_stampcard_design = designSet.has(prog.id);
            link._stamp_program = prog;
          }
        }
      }

      return links;
    },
    enabled: !!user && !!cardId,
  });
}
