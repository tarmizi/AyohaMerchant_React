import React from "react";
import { Wifi, QrCode, Facebook, Instagram, MessageCircle, Gift } from "lucide-react";

export interface SlotConfig {
  slot_no: number;
  slot_type: "sequence" | "perk";
  slot_label?: string;
  perk_image_url?: string;
  perk_title?: string;
  reward_value_text?: string;
}

export interface StampCardDesign {
  stampcard_title?: string;
  enterprise_name_display?: string;
  campaign_name_display?: string;
  expiry_text_display?: string;
  background_image_url?: string;
  logo_image_url?: string;
  primary_theme_color?: string;
  secondary_theme_color?: string;
  is_nfc_enabled: boolean;
  is_qr_enabled: boolean;
  stamp_rule_note_text?: string;
  contact_us_title?: string;
  facebook_url?: string;
  instagram_url?: string;
  whatsapp_url?: string;
  show_facebook: boolean;
  show_instagram: boolean;
  show_whatsapp: boolean;
  total_stamp_slots: number;
  reward_box_label?: string;
  qr_box_label?: string;
  slots: SlotConfig[];
}

interface Props {
  design: StampCardDesign;
  onSlotClick?: (slotNo: number) => void;
  selectedSlot?: number | null;
  className?: string;
}

const StampCardPreview: React.FC<Props> = ({ design, onSlotClick, selectedSlot, className = "" }) => {
  const primaryColor = design.primary_theme_color || "#7c3aed";
  const secondaryColor = design.secondary_theme_color || "#db2777";
  const bgGradient = `linear-gradient(145deg, ${primaryColor} 0%, ${secondaryColor} 60%, ${primaryColor}88 100%)`;

  const slots = design.slots.length > 0
    ? design.slots.slice(0, design.total_stamp_slots)
    : Array.from({ length: design.total_stamp_slots }, (_, i) => ({
        slot_no: i + 1,
        slot_type: "sequence" as const,
      }));

  const showFb = design.show_facebook && !!design.facebook_url;
  const showIg = design.show_instagram && !!design.instagram_url;
  const showWa = design.show_whatsapp && !!design.whatsapp_url;
  const hasContact = showFb || showIg || showWa;

  // Compute grid columns: aim for rows of 4, last row centered
  const cols = slots.length <= 3 ? slots.length : 4;

  return (
    <div className={`relative mx-auto ${className}`} style={{ width: 320 }}>
      {/* Phone-card shell */}
      <div
        className="rounded-[20px] overflow-hidden relative"
        style={{
          background: design.background_image_url
            ? `url(${design.background_image_url}) center/cover no-repeat`
            : bgGradient,
          boxShadow: "0 8px 40px -8px rgba(124,58,237,0.35), 0 2px 12px -2px rgba(0,0,0,0.15)",
          aspectRatio: "9 / 16",
        }}
      >
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 rounded-[20px] pointer-events-none"
          style={{
            background: design.background_image_url
              ? "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%)"
              : "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.08) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10 flex flex-col h-full px-5 pt-5 pb-4" style={{ aspectRatio: "9 / 16" }}>
          {/* ─── Top header: logo + branding + NFC ─── */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2.5">
              {design.logo_image_url ? (
                <img
                  src={design.logo_image_url}
                  alt="Logo"
                  className="h-11 w-11 rounded-xl object-cover shadow-sm"
                  style={{ border: "2px solid rgba(255,255,255,0.25)" }}
                />
              ) : (
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "2px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <span className="text-white text-[9px] font-bold tracking-wider">LOGO</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white text-[13px] font-bold leading-tight truncate">
                  {design.enterprise_name_display || "Enterprise Name"}
                </p>
                <p className="text-white/65 text-[10px] leading-tight truncate">
                  {design.campaign_name_display || "Campaign Name"}
                </p>
              </div>
            </div>
            {design.is_nfc_enabled && (
              <div
                className="flex items-center gap-1 rounded-full px-2.5 py-1"
                style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
              >
                <Wifi className="h-3 w-3 text-white/80" />
                <span className="text-white/80 text-[8px] font-semibold tracking-wide">NFC</span>
              </div>
            )}
          </div>

          {/* ─── Title + expiry ─── */}
          <div className="text-center mb-1">
            <h3 className="text-white text-base font-bold tracking-wider uppercase">
              {design.stampcard_title || "Stamp Card"}
            </h3>
            {design.expiry_text_display && (
              <p className="text-white/50 text-[9px] mt-0.5 tracking-wide">
                {design.expiry_text_display}
              </p>
            )}
          </div>

          {/* ─── Divider line ─── */}
          <div className="mx-6 my-2" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }} />

          {/* ─── Stamp slot grid ─── */}
          <div className="flex-1 flex items-center justify-center py-2">
            <div
              className="grid justify-items-center"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: "10px",
                width: "100%",
                maxWidth: 272,
              }}
            >
              {slots.map((slot) => {
                const isSelected = selectedSlot === slot.slot_no;
                const isPerk = slot.slot_type === "perk";
                return (
                  <button
                    key={slot.slot_no}
                    type="button"
                    onClick={() => onSlotClick?.(slot.slot_no)}
                    className="transition-all duration-150"
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      background: isPerk
                        ? "rgba(255,255,255,0.22)"
                        : "rgba(255,255,255,0.1)",
                      border: isSelected
                        ? "2.5px solid rgba(255,255,255,0.9)"
                        : "1.5px solid rgba(255,255,255,0.2)",
                      boxShadow: isSelected
                        ? "0 0 0 3px rgba(255,255,255,0.2), inset 0 1px 3px rgba(0,0,0,0.1)"
                        : "inset 0 1px 3px rgba(0,0,0,0.08)",
                      transform: isSelected ? "scale(1.12)" : "scale(1)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {isPerk && slot.perk_image_url ? (
                      <img
                        src={slot.perk_image_url}
                        alt={slot.perk_title || "Perk"}
                        className="rounded-full object-cover"
                        style={{ width: 38, height: 38 }}
                      />
                    ) : isPerk ? (
                      <Gift className="text-white/75" style={{ width: 20, height: 20 }} />
                    ) : (
                      <span
                        className="text-white font-bold select-none"
                        style={{ fontSize: 18, textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
                      >
                        {slot.slot_no}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── Rule note ─── */}
          {design.stamp_rule_note_text && (
            <p className="text-white/50 text-[9px] text-center mb-2 px-4 leading-relaxed">
              {design.stamp_rule_note_text}
            </p>
          )}

          {/* ─── Bottom: Reward + QR ─── */}
          <div className="space-y-2.5 mt-auto">
            <div className="flex items-stretch gap-2.5">
              {/* Reward box */}
              <div
                className="flex-1 rounded-xl px-3 py-2.5"
                style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)" }}
              >
                <p className="text-white/50 text-[8px] uppercase tracking-widest mb-1">
                  {design.reward_box_label || "Reward"}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🎁</span>
                  <span className="text-white text-[11px] font-semibold">Claim Reward</span>
                </div>
              </div>

              {/* QR box */}
              {design.is_qr_enabled && (
                <div
                  className="rounded-xl px-3 py-2.5 flex flex-col items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(6px)",
                    minWidth: 64,
                  }}
                >
                  <QrCode className="text-white/70" style={{ width: 26, height: 26 }} />
                  <p className="text-white/45 text-[7px] mt-0.5 tracking-wide">
                    {design.qr_box_label || "QR Code"}
                  </p>
                </div>
              )}
            </div>

            {/* ─── Contact section ─── */}
            {hasContact && (
              <div className="text-center pb-1">
                <p className="text-white/40 text-[8px] mb-1.5 uppercase tracking-widest">
                  {design.contact_us_title || "Contact Us"}
                </p>
                <div className="flex items-center justify-center gap-3">
                  {showFb && (
                    <div className="rounded-full p-1.5" style={{ background: "rgba(255,255,255,0.1)" }}>
                      <Facebook className="h-3 w-3 text-white/60" />
                    </div>
                  )}
                  {showIg && (
                    <div className="rounded-full p-1.5" style={{ background: "rgba(255,255,255,0.1)" }}>
                      <Instagram className="h-3 w-3 text-white/60" />
                    </div>
                  )}
                  {showWa && (
                    <div className="rounded-full p-1.5" style={{ background: "rgba(255,255,255,0.1)" }}>
                      <MessageCircle className="h-3 w-3 text-white/60" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StampCardPreview;
