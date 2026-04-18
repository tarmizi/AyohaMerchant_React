import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SlotConfig, StampCardDesign } from "@/components/stampcard-editor/StampCardPreview";

export interface StampSubscriberSlot {
  id: string;
  slot_no: number;
  slot_type: string;
  stamped_status: string;
  stamped_date: string | null;
  stamped_by: string | null;
  stamped_method: string | null;
  batch: number;
  is_redeem_item: string;
  perk_title: string | null;
  perk_image_url: string | null;
  reward_value_text: string | null;
  slot_label: string | null;
}

export interface StampCardDetailData {
  stampedSlotNos: number[];
  customerAuthUserId: string;
  program: {
    id: string;
    program_name: string;
    program_description: string | null;
    stamp_rule_amount: number;
    stamp_rule_descriptions: string | null;
  };
  stampcard: {
    id: string;
    total_stamp_slots: number;
    stampcard_name: string;
    primary_theme_color: string | null;
    secondary_theme_color: string | null;
    background_image_url: string | null;
    logo_image_url: string | null;
    enterprise_name_display: string | null;
    campaign_name_display: string | null;
    stamp_rule_note_text: string | null;
    instagram_url: string | null;
    facebook_url: string | null;
    whatsapp_url: string | null;
    show_instagram: boolean;
    show_facebook: boolean;
    show_whatsapp: boolean;
    is_qr_enabled: boolean;
    is_nfc_enabled: boolean;
    qr_box_label: string | null;
    reward_box_label: string | null;
  } | null;
  design: StampCardDesign | null;
  subscriberSlots: StampSubscriberSlot[];
  subscriberAccno: string;
  stampedCount: number;
  logEntries: StampSubscriberSlot[];
}

export function useStampCardDetail(
  membershipId: string | undefined,
  programId: string | undefined,
) {
  return useQuery({
    queryKey: ["stamp_card_detail", membershipId, programId],
    queryFn: async (): Promise<StampCardDetailData> => {
      if (!membershipId || !programId) throw new Error("Missing IDs");

      // Step 1: fetch membership — get customer_profile_id (= customer_auth_user_id)
      const { data: membership, error: mErr } = await supabase
        .from("merchant_memberships" as any)
        .select("id, membership_no, merchant_id, customer_profile_id")
        .eq("id", membershipId)
        .single();
      if (mErr) throw mErr;
      const subscriberAccno: string   = (membership as any).membership_no ?? "";
      const customerAuthUserId: string = (membership as any).customer_profile_id ?? "";

      // Step 2: fetch stamp program
      const { data: program, error: pErr } = await supabase
        .from("loyalty_program_stamp")
        .select("id, program_name, program_description, stamp_rule_amount, stamp_rule_descriptions")
        .eq("id", programId)
        .single();
      if (pErr) throw pErr;

      // Step 3: fetch stampcard design
      const { data: stampcardRaw } = await supabase
        .from("loyalty_program_stampcard" as any)
        .select("*")
        .eq("loyalty_program_stamp_id", programId)
        .maybeSingle();
      const stampcard = (stampcardRaw as any) ?? null;

      // Step 4: fetch slot configurations
      let slotConfigs: SlotConfig[] = [];
      if (stampcard?.id) {
        const { data: slotsData } = await supabase
          .from("loyalty_program_stampcard_slots" as any)
          .select("slot_no, slot_type, slot_label, perk_image_url, perk_title, reward_value_text")
          .eq("loyalty_program_stampcard_id", stampcard.id)
          .order("slot_no", { ascending: true });

        slotConfigs = ((slotsData as any[]) ?? []).map((s: any) => ({
          slot_no: s.slot_no,
          slot_type: s.slot_type ?? "sequence",
          slot_label: s.slot_label ?? "",
          perk_image_url: s.perk_image_url ?? "",
          perk_title: s.perk_title ?? "",
          reward_value_text: s.reward_value_text ?? "",
        }));

        // fill in missing slots
        const total = stampcard.total_stamp_slots ?? 11;
        for (let i = 1; i <= total; i++) {
          if (!slotConfigs.find((s) => s.slot_no === i)) {
            slotConfigs.push({ slot_no: i, slot_type: "sequence" });
          }
        }
        slotConfigs.sort((a, b) => a.slot_no - b.slot_no);
      }

      // Step 5: build StampCardDesign object
      const design: StampCardDesign | null = stampcard
        ? {
            stampcard_title: stampcard.stampcard_title ?? stampcard.stampcard_name,
            enterprise_name_display: stampcard.enterprise_name_display ?? "",
            campaign_name_display: stampcard.campaign_name_display ?? (program as any).program_name,
            expiry_text_display: stampcard.expiry_text_display ?? "",
            background_image_url: stampcard.background_image_url ?? "",
            logo_image_url: stampcard.logo_image_url ?? "",
            primary_theme_color: stampcard.primary_theme_color ?? "#7c3aed",
            secondary_theme_color: stampcard.secondary_theme_color ?? "#db2777",
            is_nfc_enabled: stampcard.is_nfc_enabled ?? false,
            is_qr_enabled: stampcard.is_qr_enabled ?? false,
            stamp_rule_note_text: stampcard.stamp_rule_note_text ?? (program as any).stamp_rule_descriptions ?? "",
            contact_us_title: stampcard.contact_us_title ?? "",
            facebook_url: stampcard.facebook_url ?? "",
            instagram_url: stampcard.instagram_url ?? "",
            whatsapp_url: stampcard.whatsapp_url ?? "",
            show_facebook: stampcard.show_facebook ?? false,
            show_instagram: stampcard.show_instagram ?? false,
            show_whatsapp: stampcard.show_whatsapp ?? false,
            total_stamp_slots: stampcard.total_stamp_slots ?? 11,
            reward_box_label: stampcard.reward_box_label ?? "",
            qr_box_label: stampcard.qr_box_label ?? "",
            slots: slotConfigs,
          }
        : null;

      // Step 6: fetch subscriber slots filtered by stampcard_id + customer_auth_user_id
      let subscriberSlots: StampSubscriberSlot[] = [];
      if (stampcard?.id && customerAuthUserId) {
        const { data: subSlots } = await supabase
          .from("loyalty_program_stamp_subscriber")
          .select("id, slot_no, slot_type, stamped_status, stamped_date, stamped_by, stamped_method, batch, is_redeem_item, perk_title, perk_image_url, reward_value_text, slot_label")
          .eq("loyalty_program_stampcard_id", stampcard.id)
          .eq("customer_auth_user_id", customerAuthUserId)
          .order("slot_no", { ascending: true });

        subscriberSlots = ((subSlots as any[]) ?? []) as StampSubscriberSlot[];

        // fallback: try subscriber_accno if no results
        if (subscriberSlots.length === 0 && subscriberAccno) {
          const { data: fallbackSlots } = await supabase
            .from("loyalty_program_stamp_subscriber")
            .select("id, slot_no, slot_type, stamped_status, stamped_date, stamped_by, stamped_method, batch, is_redeem_item, perk_title, perk_image_url, reward_value_text, slot_label")
            .eq("loyalty_program_stampcard_id", stampcard.id)
            .eq("subscriber_accno", subscriberAccno)
            .order("slot_no", { ascending: true });
          subscriberSlots = ((fallbackSlots as any[]) ?? []) as StampSubscriberSlot[];
        }
      }

      const stampedSlots = subscriberSlots.filter((s) => {
        const v = s.stamped_status?.toUpperCase();
        return v === "Y" || v === "STAMPED";
      });
      const stampedSlotNos = stampedSlots.map((s) => s.slot_no);
      const stampedCount   = stampedSlots.length;

      const logEntries = [...stampedSlots]
        .filter((s) => s.stamped_date)
        .sort((a, b) => new Date(b.stamped_date!).getTime() - new Date(a.stamped_date!).getTime());

      return {
        program: program as any,
        stampcard,
        design,
        subscriberSlots,
        stampedSlotNos,
        subscriberAccno,
        customerAuthUserId,
        stampedCount,
        logEntries,
      };
    },
    enabled: !!membershipId && !!programId,
  });
}
