import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MemberPrivilege {
  id: string;
  loyalty_program_record_id: string;
  loyalty_program_type: string;
  status: string | null;
  program_name: string;
  program_description: string | null;
}

export interface MemberDetailsData {
  membership: {
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
    payment_method: string | null;
    fee_paid: number | null;
    valid_until: string | null;
    payment_reference: string | null;
    payment_status: string | null;
    notes: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  profile: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone_no: string | null;
    profile_image_url: string | null;
    username: string | null;
    status: string | null;
    created_at: string | null;
  } | null;
  card: {
    id: string;
    card_name: string | null;
    card_image_front_url: string | null;
    card_level: string | null;
    card_type: string | null;
    fee_payment_cycle: string | null;
    card_description: string | null;
  } | null;
  privileges: MemberPrivilege[];
}

// Tables that store program details, each with program_name + program_description
const PROGRAM_TABLES: Record<string, string> = {
  stamp:    "loyalty_program_stamp",
  point:    "loyalty_program_point",
  discount: "loyalty_program_discount",
  voucher:  "loyalty_program_voucher",
  contest:  "loyalty_program_contest",
  event:    "loyalty_program_event",
  coupon:   "loyalty_program_coupon",
  referral: "loyalty_program_referral",
};

export function useMemberDetails(membershipId: string | undefined) {
  return useQuery({
    queryKey: ["member_details", membershipId],
    queryFn: async (): Promise<MemberDetailsData> => {
      if (!membershipId) throw new Error("No ID");

      // Step 1: fetch membership
      const { data: membership, error: mErr } = await (supabase as any)
        .from("merchant_memberships")
        .select("id, merchant_id, customer_profile_id, membership_card_id, membership_status, membership_no, card_level, card_type, membership_date, fee_payment_cycle, payment_method, fee_paid, valid_until, payment_reference, payment_status, notes, created_at, updated_at")
        .eq("id", membershipId)
        .single();
      if (mErr) throw mErr;
      console.log("[useMemberDetails] Step1 membership:", membership);

      // Step 2: fetch customer profile
      let profile = null;
      if (membership.customer_profile_id) {
        const { data: p } = await (supabase as any)
          .from("customer_profiles")
          .select("id, full_name, email, phone_no, profile_image_url, username, status, created_at")
          .eq("id", membership.customer_profile_id)
          .single();
        profile = p ?? null;
      }
      console.log("[useMemberDetails] Step2 profile:", profile);

      // Step 3: fetch membership card
      let card = null;
      if (membership.membership_card_id) {
        const { data: c } = await (supabase as any)
          .from("membership_cards")
          .select("id, card_name, card_image_front_url, card_level, card_type, fee_payment_cycle, card_description")
          .eq("id", membership.membership_card_id)
          .single();
        card = c ?? null;
      }
      console.log("[useMemberDetails] Step3 card:", card);
      console.log("[useMemberDetails] Step3 membership_card_id being used:", membership.membership_card_id);

      // Step 4: fetch linked loyalty programs for the subscribed card
      let privileges: MemberPrivilege[] = [];
      const cardId = membership.membership_card_id;

      if (!cardId) {
        console.warn("[useMemberDetails] Step4 SKIPPED — membership_card_id is null");
      } else {
        console.log("[useMemberDetails] Step4 querying membership_card_loyalty_programs for card_id:", cardId);

        const { data: links, error: linksErr } = await (supabase as any)
          .from("membership_card_loyalty_programs")
          .select("id, membership_card_id, loyalty_program_record_id, loyalty_program_type, status")
          .eq("membership_card_id", cardId);

        console.log("[useMemberDetails] Step4 links raw result:", links);
        console.log("[useMemberDetails] Step4 links error:", linksErr);

        const activeLinks = (links ?? []).filter((l: any) =>
          !l.status || l.status.toLowerCase() === "active"
        );
        console.log("[useMemberDetails] Step4 active links:", activeLinks);

        if (activeLinks.length > 0) {
          const byType: Record<string, { linkId: string; recordId: string; status: string }[]> = {};
          for (const link of activeLinks) {
            const t = link.loyalty_program_type;
            if (!byType[t]) byType[t] = [];
            byType[t].push({ linkId: link.id, recordId: link.loyalty_program_record_id, status: link.status });
          }
          console.log("[useMemberDetails] Step4 grouped by type:", byType);

          const detailMap = new Map<string, { program_name: string; program_description: string | null }>();
          await Promise.all(
            Object.entries(byType).map(async ([type, items]) => {
              const table = PROGRAM_TABLES[type];
              if (!table) {
                console.warn("[useMemberDetails] Step4 unknown program type, no table mapping:", type);
                return;
              }
              const ids = items.map((i) => i.recordId);
              console.log(`[useMemberDetails] Step4 fetching from ${table} for ids:`, ids);
              const { data: programs, error: pErr } = await (supabase as any)
                .from(table)
                .select("id, program_name, program_description")
                .in("id", ids);
              console.log(`[useMemberDetails] Step4 ${table} result:`, programs, "error:", pErr);
              for (const p of programs ?? []) {
                detailMap.set(p.id, { program_name: p.program_name, program_description: p.program_description });
              }
            })
          );

          privileges = activeLinks.map((link: any) => {
            const detail = detailMap.get(link.loyalty_program_record_id);
            return {
              id: link.id,
              loyalty_program_record_id: link.loyalty_program_record_id,
              loyalty_program_type: link.loyalty_program_type,
              status: link.status,
              program_name: detail?.program_name ?? "—",
              program_description: detail?.program_description ?? null,
            };
          });
          console.log("[useMemberDetails] Step4 final privileges:", privileges);
        } else {
          console.warn("[useMemberDetails] Step4 no active links found for card_id:", cardId);
        }
      }

      return { membership, profile, card, privileges };
    },
    enabled: !!membershipId,
  });
}
