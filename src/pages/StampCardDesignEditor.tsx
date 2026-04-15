import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import StampCardPreview, { type StampCardDesign, type SlotConfig } from "@/components/stampcard-editor/StampCardPreview";
import DesignSettingsPanel from "@/components/stampcard-editor/DesignSettingsPanel";
import SlotEditorPanel from "@/components/stampcard-editor/SlotEditorPanel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Eye, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const DEFAULT_DESIGN: StampCardDesign = {
  stampcard_title: "Stamp Card",
  enterprise_name_display: "",
  campaign_name_display: "",
  expiry_text_display: "",
  background_image_url: "",
  logo_image_url: "",
  primary_theme_color: "#7c3aed",
  secondary_theme_color: "#db2777",
  is_nfc_enabled: false,
  is_qr_enabled: true,
  stamp_rule_note_text: "",
  contact_us_title: "Contact Us",
  facebook_url: "",
  instagram_url: "",
  whatsapp_url: "",
  show_facebook: true,
  show_instagram: true,
  show_whatsapp: true,
  total_stamp_slots: 11,
  reward_box_label: "Reward",
  qr_box_label: "QR Code",
  slots: [],
};

function buildDefaultSlots(count: number, existing: SlotConfig[]): SlotConfig[] {
  return Array.from({ length: count }, (_, i) => {
    const slotNo = i + 1;
    const prev = existing.find((s) => s.slot_no === slotNo);
    return prev ?? { slot_no: slotNo, slot_type: "sequence" as const };
  });
}

const StampCardDesignEditor: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [searchParams] = useSearchParams();
  const designId = searchParams.get("design");
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [campaignInfo, setCampaignInfo] = useState<any>(null);
  const [design, setDesign] = useState<StampCardDesign>({ ...DEFAULT_DESIGN });
  const [initialDesign, setInitialDesign] = useState<StampCardDesign>({ ...DEFAULT_DESIGN });
  const [existingDesignId, setExistingDesignId] = useState<string | null>(designId);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPerk, setUploadingPerk] = useState(false);
  const [fullPreview, setFullPreview] = useState(false);

  useEffect(() => {
    if (!campaignId || !user) return;
    (async () => {
      const { data: camp } = await supabase
        .from("loyalty_program_stamp")
        .select("*")
        .eq("id", campaignId)
        .maybeSingle();
      if (!camp) {
        toast.error("Stamp campaign not found");
        navigate("/campaigns/stamp-loyalty");
        return;
      }
      setCampaignInfo(camp);

      const { data: dc } = await supabase
        .from("loyalty_program_stampcard" as any)
        .select("*")
        .eq("loyalty_program_stamp_id", campaignId)
        .maybeSingle();

      if (dc) {
        const row = dc as any;
        setExistingDesignId(row.id);
        const d: StampCardDesign = {
          stampcard_title: row.stampcard_title || "",
          enterprise_name_display: row.enterprise_name_display || "",
          campaign_name_display: row.campaign_name_display || "",
          expiry_text_display: row.expiry_text_display || "",
          background_image_url: row.background_image_url || "",
          logo_image_url: row.logo_image_url || "",
          primary_theme_color: row.primary_theme_color || "#7c3aed",
          secondary_theme_color: row.secondary_theme_color || "#db2777",
          is_nfc_enabled: row.is_nfc_enabled ?? false,
          is_qr_enabled: row.is_qr_enabled ?? true,
          stamp_rule_note_text: row.stamp_rule_note_text || "",
          contact_us_title: row.contact_us_title || "Contact Us",
          facebook_url: row.facebook_url || "",
          instagram_url: row.instagram_url || "",
          whatsapp_url: row.whatsapp_url || "",
          show_facebook: row.show_facebook ?? true,
          show_instagram: row.show_instagram ?? true,
          show_whatsapp: row.show_whatsapp ?? true,
          total_stamp_slots: row.total_stamp_slots ?? 11,
          reward_box_label: row.reward_box_label || "Reward",
          qr_box_label: row.qr_box_label || "QR Code",
          slots: [],
        };

        const { data: slotsData } = await supabase
          .from("loyalty_program_stampcard_slots" as any)
          .select("*")
          .eq("loyalty_program_stampcard_id", row.id)
          .order("sort_order", { ascending: true });

        if (slotsData) {
          d.slots = (slotsData as any[]).map((s) => ({
            slot_no: s.slot_no,
            slot_type: s.slot_type,
            slot_label: s.slot_label || "",
            perk_image_url: s.perk_image_url || "",
            perk_title: s.perk_title || "",
            reward_value_text: s.reward_value_text || "",
          }));
        }

        d.slots = buildDefaultSlots(d.total_stamp_slots, d.slots);
        setDesign(d);
        setInitialDesign(JSON.parse(JSON.stringify(d)));
      } else {
        const d: StampCardDesign = {
          ...DEFAULT_DESIGN,
          campaign_name_display: (camp as any).program_name || "",
          total_stamp_slots: 11,
          slots: buildDefaultSlots(11, []),
        };
        setDesign(d);
        setInitialDesign(JSON.parse(JSON.stringify(d)));
      }

      setLoading(false);
    })();
  }, [campaignId, user]);

  useEffect(() => {
    setDesign((prev) => ({
      ...prev,
      slots: buildDefaultSlots(prev.total_stamp_slots, prev.slots),
    }));
  }, [design.total_stamp_slots]);

  const updateDesign = useCallback((updates: Partial<StampCardDesign>) => {
    setDesign((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateSlot = useCallback((updated: SlotConfig) => {
    setDesign((prev) => ({
      ...prev,
      slots: prev.slots.map((s) => (s.slot_no === updated.slot_no ? updated : s)),
    }));
  }, []);

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("stampcard-assets").upload(path, file);
    if (error) {
      toast.error("Upload failed: " + error.message);
      return null;
    }
    const { data } = supabase.storage.from("stampcard-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleUploadBg = async (file: File) => {
    setUploadingBg(true);
    const url = await uploadFile(file, "backgrounds");
    if (url) updateDesign({ background_image_url: url });
    setUploadingBg(false);
  };

  const handleUploadLogo = async (file: File) => {
    setUploadingLogo(true);
    const url = await uploadFile(file, "logos");
    if (url) updateDesign({ logo_image_url: url });
    setUploadingLogo(false);
  };

  const handleUploadPerk = async (slotNo: number, file: File) => {
    setUploadingPerk(true);
    const url = await uploadFile(file, `perks/slot-${slotNo}`);
    if (url) {
      const slot = design.slots.find((s) => s.slot_no === slotNo);
      if (slot) updateSlot({ ...slot, perk_image_url: url });
    }
    setUploadingPerk(false);
  };

  const handleSave = async (isDraft = false) => {
    if (!user || !campaignId) return;
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        merchant_account_id: user.id,
        loyalty_program_stamp_id: campaignId,
        stampcard_name: design.stampcard_title || "Stamp Card",
        stampcard_title: design.stampcard_title || "",
        enterprise_name_display: design.enterprise_name_display || null,
        campaign_name_display: design.campaign_name_display || null,
        expiry_text_display: design.expiry_text_display || null,
        background_image_url: design.background_image_url || null,
        logo_image_url: design.logo_image_url || null,
        primary_theme_color: design.primary_theme_color || null,
        secondary_theme_color: design.secondary_theme_color || null,
        is_nfc_enabled: design.is_nfc_enabled,
        is_qr_enabled: design.is_qr_enabled,
        stamp_rule_note_text: design.stamp_rule_note_text || null,
        contact_us_title: design.contact_us_title || null,
        facebook_url: design.facebook_url || null,
        instagram_url: design.instagram_url || null,
        whatsapp_url: design.whatsapp_url || null,
        show_facebook: design.show_facebook,
        show_instagram: design.show_instagram,
        show_whatsapp: design.show_whatsapp,
        total_stamp_slots: design.total_stamp_slots,
        reward_box_label: design.reward_box_label || "Reward",
        qr_box_label: design.qr_box_label || "QR Code",
        status: isDraft ? "Draft" : "Active",
      };

      let cardId = existingDesignId;

      if (existingDesignId) {
        const { error } = await supabase
          .from("loyalty_program_stampcard" as any)
          .update(payload)
          .eq("id", existingDesignId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("loyalty_program_stampcard" as any)
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        cardId = (data as any).id;
        setExistingDesignId(cardId);
      }

      if (cardId) {
        await supabase
          .from("loyalty_program_stampcard_slots" as any)
          .delete()
          .eq("loyalty_program_stampcard_id", cardId);

        const slotRows = design.slots.map((s, i) => ({
          merchant_account_id: user.id,
          loyalty_program_stampcard_id: cardId,
          slot_no: s.slot_no,
          slot_type: s.slot_type,
          slot_label: s.slot_label || null,
          perk_image_url: s.perk_image_url || null,
          perk_title: s.perk_title || null,
          perk_description: null,
          reward_value_text: s.reward_value_text || null,
          sort_order: i + 1,
        }));

        const { error: slotErr } = await supabase
          .from("loyalty_program_stampcard_slots" as any)
          .insert(slotRows);
        if (slotErr) throw slotErr;
      }

      setInitialDesign(JSON.parse(JSON.stringify(design)));
      toast.success(isDraft ? "Draft saved" : "Design saved successfully");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save design");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setDesign(JSON.parse(JSON.stringify(initialDesign)));
    setSelectedSlot(null);
    toast.info("Changes reset");
  };

  if (loading) {
    return (
      <AppShell>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-72" />
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-[600px] rounded-xl" />
            <Skeleton className="h-[600px] rounded-xl" />
            <Skeleton className="h-[400px] rounded-xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  const selectedSlotData = selectedSlot ? design.slots.find((s) => s.slot_no === selectedSlot) ?? null : null;

  return (
    <AppShell>
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/campaigns/stamp-loyalty")} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">StampCard Design Editor</h1>
              <p className="text-xs text-muted-foreground">
                {campaignInfo?.program_name || "Stamp Campaign"} • {(campaignInfo as any)?.stamp_campaign_code || ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setFullPreview(!fullPreview)}>
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              {fullPreview ? "Editor" : "Preview"}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => handleSave(true)} disabled={saving}>
              Save Draft
            </Button>
            <Button type="button" size="sm" onClick={() => handleSave(false)} disabled={saving}>
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {saving ? "Saving..." : "Save Design"}
            </Button>
          </div>
        </div>

        {campaignInfo && (
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground bg-muted/40 rounded-lg px-4 py-2.5">
            <span><strong className="text-foreground">Campaign:</strong> {campaignInfo.program_name}</span>
            <span>•</span>
            <span><strong className="text-foreground">Type:</strong> {(campaignInfo as any).stamp_card_type}</span>
            {(campaignInfo as any).campaign_end_date && (
              <>
                <span>•</span>
                <span><strong className="text-foreground">Ends:</strong> {(campaignInfo as any).campaign_end_date}</span>
              </>
            )}
          </div>
        )}
      </div>

      {fullPreview ? (
        <div className="flex items-center justify-center p-10 bg-muted/30 min-h-[calc(100vh-160px)]">
          <StampCardPreview design={design} className="scale-125 origin-center" />
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-0 min-h-[calc(100vh-160px)]">
          <div className="col-span-3 border-r border-border bg-card p-5">
            <DesignSettingsPanel
              design={design}
              onChange={updateDesign}
              onUploadBackground={handleUploadBg}
              onUploadLogo={handleUploadLogo}
              uploadingBg={uploadingBg}
              uploadingLogo={uploadingLogo}
            />
          </div>

          <div className="col-span-6 flex items-start justify-center p-8 bg-muted/20">
            <div className="sticky top-8">
              <p className="text-xs text-muted-foreground text-center mb-4">Live Preview — Click a slot to edit</p>
              <StampCardPreview
                design={design}
                onSlotClick={setSelectedSlot}
                selectedSlot={selectedSlot}
              />
            </div>
          </div>

          <div className="col-span-3 border-l border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Slot Configuration</h2>
            <SlotEditorPanel
              slot={selectedSlotData}
              onUpdate={updateSlot}
              onUploadPerk={handleUploadPerk}
              uploadingPerk={uploadingPerk}
              onClose={() => setSelectedSlot(null)}
            />
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default StampCardDesignEditor;
