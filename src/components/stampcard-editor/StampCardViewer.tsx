import React from "react";
import { QrCode, Facebook, Instagram, MessageCircle, Gift, Stamp } from "lucide-react";
import type { StampCardDesign } from "./StampCardPreview";

export interface SlotClickInfo {
  slot_no: number;
  slot_type: string;
  perk_image_url?: string;
  perk_title?: string;
  reward_value_text?: string;
}

interface Props {
  design: StampCardDesign;
  stampedSlotNos: number[];
  stampedCount: number;
  redeemableSlotNos?: number[];   // slots where is_redeem_item = 'Y'
  onSlotClick?: (info: SlotClickInfo) => void;
  className?: string;
}

const StampCardViewer: React.FC<Props> = ({
  design, stampedSlotNos, stampedCount, redeemableSlotNos = [], onSlotClick, className = "",
}) => {
  const primaryColor   = design.primary_theme_color   || "#7c3aed";
  const secondaryColor = design.secondary_theme_color || "#db2777";
  const bgGradient     = `linear-gradient(145deg, ${primaryColor} 0%, ${secondaryColor} 60%, ${primaryColor}88 100%)`;
  const total          = design.total_stamp_slots || 11;

  const slots = design.slots.length > 0
    ? design.slots.slice(0, total)
    : Array.from({ length: total }, (_, i) => ({ slot_no: i + 1, slot_type: "sequence" as const }));

  const showFb = design.show_facebook && !!design.facebook_url;
  const showIg = design.show_instagram && !!design.instagram_url;
  const showWa = design.show_whatsapp && !!design.whatsapp_url;
  const hasContact = showFb || showIg || showWa;

  const progressLabel = stampedCount >= total
    ? "🏆 Completed! Claim your reward"
    : `🎁 ${stampedCount}/${total} — keep collecting!`;

  return (
    <div className={`mx-auto ${className}`} style={{ width: 320 }}>
      <div
        className="rounded-[20px] overflow-hidden relative"
        style={{
          background: design.background_image_url
            ? `url(${design.background_image_url}) center/cover no-repeat`
            : bgGradient,
          boxShadow: "0 8px 40px -8px rgba(124,58,237,0.35), 0 2px 12px -2px rgba(0,0,0,0.15)",
          minHeight: 580,
        }}
      >
        {/* overlay */}
        <div
          className="absolute inset-0 rounded-[20px] pointer-events-none"
          style={{
            background: design.background_image_url
              ? "linear-gradient(180deg,rgba(0,0,0,0.18) 0%,rgba(0,0,0,0.38) 100%)"
              : "radial-gradient(circle at 30% 20%,rgba(255,255,255,0.12) 0%,transparent 50%)",
          }}
        />

        <div className="relative z-10 flex flex-col px-5 pt-5 pb-5">

          {/* ── Header: logo + names ── */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              {design.logo_image_url ? (
                <img
                  src={design.logo_image_url}
                  alt="Logo"
                  className="h-11 w-11 rounded-full object-cover shadow"
                  style={{ border: "2px solid rgba(255,255,255,0.4)" }}
                />
              ) : (
                <div
                  className="h-11 w-11 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.25)" }}
                >
                  <span className="text-white text-[8px] font-bold">LOGO</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white text-[13px] font-bold leading-tight truncate">
                  {design.enterprise_name_display || "Enterprise"}
                </p>
                <p className="text-white/65 text-[10px] leading-tight truncate">
                  {design.campaign_name_display || design.stampcard_title || "Campaign"}
                </p>
              </div>
            </div>
          </div>

          {/* ── Title ── */}
          <div className="text-center mb-2">
            <h3 className="text-white font-black tracking-widest uppercase" style={{ fontSize: 17 }}>
              {design.stampcard_title || "STAMP CARD"}
            </h3>
          </div>

          {/* ── Divider ── */}
          <div className="mx-4 mb-3" style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }} />

          {/* ── Slot grid (3 columns) ── */}
          <div className="flex items-center justify-center py-3">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                width: "100%",
                maxWidth: 270,
                justifyItems: "center",
              }}
            >
              {slots.map((slot) => {
                const isStamped    = stampedSlotNos.includes(slot.slot_no);
                const isPerk       = slot.slot_type === "perk";
                const isRedeemable = redeemableSlotNos.includes(slot.slot_no);
                const isClickable  = isPerk && isRedeemable && !!onSlotClick;

                return (
                  <div
                    key={slot.slot_no}
                    onClick={() => isClickable && onSlotClick({ slot_no: slot.slot_no, slot_type: slot.slot_type, perk_image_url: slot.perk_image_url, perk_title: slot.perk_title, reward_value_text: slot.reward_value_text })}
                    style={{
                      cursor: isClickable ? "pointer" : "default",
                      width: 68,
                      height: 68,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      background: isStamped
                        ? "linear-gradient(135deg,#fff5 0%,#fff3 100%)"
                        : isPerk
                          ? "rgba(255,255,255,0.22)"
                          : "rgba(255,255,255,0.12)",
                      border: isStamped
                        ? "2.5px solid rgba(255,255,255,0.9)"
                        : "1.5px solid rgba(255,255,255,0.25)",
                      boxShadow: isStamped
                        ? "0 0 14px 4px rgba(255,255,255,0.25), inset 0 1px 3px rgba(255,255,255,0.2)"
                        : "inset 0 1px 3px rgba(0,0,0,0.1)",
                      backdropFilter: "blur(6px)",
                      transition: "all 0.25s ease",
                    }}
                  >
                    {/* perk slot: always show design image */}
                    {isPerk && slot.perk_image_url && !isStamped ? (
                      <img
                        src={slot.perk_image_url}
                        alt={slot.perk_title || ""}
                        className="rounded-full object-cover"
                        style={{ width: 50, height: 50 }}
                      />
                    ) : isPerk && !isStamped ? (
                      <Gift style={{ width: 22, height: 22, color: "rgba(255,255,255,0.75)" }} />
                    ) : isStamped ? (
                      /* ── Premium stamp mark ── */
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <div
                          style={{
                            background: "radial-gradient(circle,rgba(255,255,255,0.95) 60%,rgba(255,255,255,0.6) 100%)",
                            borderRadius: "50%",
                            width: 36,
                            height: 36,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          }}
                        >
                          <Stamp style={{ width: 20, height: 20, color: primaryColor }} />
                        </div>
                      </div>
                    ) : (
                      <span
                        className="font-bold select-none"
                        style={{ fontSize: 20, color: "white", textShadow: "0 1px 3px rgba(0,0,0,0.25)" }}
                      >
                        {slot.slot_no}
                      </span>
                    )}

                    {/* gold badge on stamped perk slot */}
                    {isPerk && isStamped && (
                      <div
                        className="absolute inset-0 rounded-full flex flex-col items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(2px)" }}
                      >
                        <div
                          style={{
                            background: "radial-gradient(circle,rgba(255,255,255,0.95) 60%,rgba(255,255,255,0.6) 100%)",
                            borderRadius: "50%", width: 36, height: 36,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          }}
                        >
                          <Stamp style={{ width: 20, height: 20, color: primaryColor }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Rule note ── */}
          {design.stamp_rule_note_text && (
            <div
              className="mx-1 mb-2 px-3 py-2 rounded-xl text-center"
              style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)" }}
            >
              <p className="text-white/80 text-[10px] leading-snug">
                🛒 {design.stamp_rule_note_text}
              </p>
            </div>
          )}

          {/* ── Bottom: Progress + QR ── */}
          <div className="flex items-stretch gap-2.5 mt-2">
            {/* Progress box */}
            <div
              className="flex-1 rounded-xl px-3 py-2"
              style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)" }}
            >
              <p className="text-white/50 text-[8px] uppercase tracking-widest mb-1">
                {design.reward_box_label || "Stamp Progress"}
              </p>
              <p className="text-white text-[11px] font-semibold">{progressLabel}</p>
            </div>

            {/* QR box */}
            {design.is_qr_enabled && (
              <div
                className="rounded-xl px-3 py-2 flex flex-col items-center justify-center shrink-0"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(6px)",
                  minWidth: 60,
                }}
              >
                <QrCode style={{ width: 26, height: 26, color: "rgba(255,255,255,0.75)" }} />
                <p className="text-white/45 text-[7px] mt-0.5 tracking-wide">
                  {design.qr_box_label || "QR Code"}
                </p>
              </div>
            )}
          </div>

          {/* ── Contact ── */}
          {hasContact && (
            <div className="text-center pt-2.5">
              <p className="text-white/40 text-[8px] mb-1.5 uppercase tracking-widest">
                {design.contact_us_title || "Contact Us"}
              </p>
              <div className="flex items-center justify-center gap-3">
                {showIg && (
                  <div className="rounded-full p-1.5" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <Instagram className="h-3.5 w-3.5 text-white/60" />
                  </div>
                )}
                {showFb && (
                  <div className="rounded-full p-1.5" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <Facebook className="h-3.5 w-3.5 text-white/60" />
                  </div>
                )}
                {showWa && (
                  <div className="rounded-full p-1.5" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <MessageCircle className="h-3.5 w-3.5 text-white/60" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StampCardViewer;
