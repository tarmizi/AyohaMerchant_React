import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import StampCardViewer from "@/components/stampcard-editor/StampCardViewer";
import { useStampCardDetail } from "@/hooks/useStampCardDetail";
import { useStampNow } from "@/hooks/useStampNow";
import { useResetStampCard } from "@/hooks/useResetStampCard";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { SlotClickInfo } from "@/components/stampcard-editor/StampCardViewer";
import {
  ChevronRight, Stamp, Clock, User2, QrCode, Zap,
  CheckCircle2, AlertTriangle, X, ShieldCheck, Sparkles, RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

// ─── helpers ──────────────────────────────────────────────────────────────────

const fmtDateTime = (v: string | null | undefined) => {
  if (!v) return "—";
  return new Date(v).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const METHOD_ICON: Record<string, React.ElementType> = {
  qr: QrCode, nfc: Zap, manual: Stamp,
};

// ─── Premium Confirmation Dialog ──────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean;
  variant: "stamp" | "cancel" | "reset";
  slotNo?: number;
  onConfirm: () => void;
  onClose: () => void;
}

function ConfirmDialog({ open, variant, slotNo, onConfirm, onClose }: ConfirmDialogProps) {
  if (!open) return null;

  const isStamp = variant === "stamp";
  const isReset = variant === "reset";

  const accentBar = isStamp
    ? "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500"
    : isReset
      ? "bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400"
      : "bg-gradient-to-r from-red-400 via-rose-500 to-orange-400";

  const iconBg = isStamp
    ? "bg-gradient-to-br from-violet-100 to-fuchsia-100"
    : isReset
      ? "bg-gradient-to-br from-amber-50 to-orange-100"
      : "bg-gradient-to-br from-red-50 to-rose-100";

  const noteBg = isStamp
    ? "bg-violet-50 text-violet-700"
    : isReset
      ? "bg-amber-50 text-amber-700"
      : "bg-rose-50 text-rose-700";

  const confirmBtn = isStamp
    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-md shadow-fuchsia-200"
    : isReset
      ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-md shadow-orange-200"
      : "bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-400 hover:to-red-400 shadow-md shadow-rose-200";

  const title = isStamp ? "Confirm Stamp" : isReset ? "Reset Stamp Card" : `Cancel Stamp — Slot #${slotNo}`;
  const body  = isStamp
    ? "You are about to issue a stamp to this member on the next available slot. This action will be recorded in the transaction log."
    : isReset
      ? "This will start a new batch for this member. Fresh unstamped slots will be created from the card design. Previous transaction history is preserved."
      : `You are about to cancel the stamp on Slot #${slotNo}. The slot will be marked as unstamped and this action will be logged.`;
  const note  = isStamp
    ? "Make sure the member meets the stamp eligibility requirement before proceeding."
    : isReset
      ? "A new batch cycle will begin. The member can collect stamps again from Slot #1."
      : "Cancelling a stamp cannot be undone automatically. Use this only to correct errors.";
  const confirmLabel = isStamp ? "Yes, Stamp Now" : isReset ? "Yes, Reset Card" : "Yes, Cancel Stamp";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className={`h-1.5 w-full ${accentBar}`} />

        <div className="p-6">
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 ${iconBg}`}>
            {isStamp ? (
              <ShieldCheck className="h-7 w-7 text-fuchsia-600" />
            ) : isReset ? (
              <RotateCcw className="h-7 w-7 text-orange-500" />
            ) : (
              <AlertTriangle className="h-7 w-7 text-rose-500" />
            )}
          </div>

          <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{body}</p>

          <div className={`mt-4 px-3 py-2 rounded-xl text-xs flex items-start gap-2 ${noteBg}`}>
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>{note}</span>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 ${confirmBtn}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 h-7 w-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <X className="h-3.5 w-3.5 text-gray-500" />
        </button>
      </div>
    </div>
  );
}

// ─── Perks Modal ──────────────────────────────────────────────────────────────

interface PerkInfo {
  perk_image_url?: string | null;
  perk_title?: string | null;
  perk_description?: string | null;
  reward_value_text?: string | null;
}

function PerksModal({ perk, onClose }: { perk: PerkInfo | null; onClose: () => void }) {
  if (!perk) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* purple gradient top */}
        <div className="h-2 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />

        <div className="px-6 pt-5 pb-6 flex flex-col items-center text-center">
          {/* EXCLUSIVE label */}
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Exclusive</p>

          {/* Title */}
          <h2 className="text-lg font-extrabold text-gray-900 mb-5">
            ✨ The Perks ✨
          </h2>

          {/* Image */}
          <div
            className="h-36 w-36 rounded-full mb-5 overflow-hidden shrink-0"
            style={{
              background: "linear-gradient(135deg,#a855f7,#ec4899)",
              padding: 4,
            }}
          >
            <div className="h-full w-full rounded-full overflow-hidden bg-white">
              {perk.perk_image_url ? (
                <img
                  src={perk.perk_image_url}
                  alt={perk.perk_title ?? "Perk"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-fuchsia-50">
                  <Sparkles className="h-10 w-10 text-fuchsia-300" />
                </div>
              )}
            </div>
          </div>

          {/* LIMITED PERK badge */}
          <span className="inline-flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-600 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
            🔥 Limited Perk
          </span>

          {/* Perk title */}
          <p className="text-base font-bold text-gray-900 leading-snug mb-1">
            {perk.perk_title ?? "—"}
          </p>

          {/* Description */}
          {perk.perk_description && (
            <p className="text-xs text-gray-500 mb-1 leading-relaxed">{perk.perk_description}</p>
          )}

          {/* Value */}
          {perk.reward_value_text && (
            <p className="text-sm text-gray-500 mb-5">{perk.reward_value_text}</p>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm transition-colors"
          >
            Close
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 h-7 w-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <X className="h-3.5 w-3.5 text-gray-500" />
        </button>
      </div>
    </div>
  );
}

// ─── skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="p-6 flex gap-6">
      <Skeleton className="w-[380px] h-[680px] rounded-2xl shrink-0" />
      <Skeleton className="w-36 h-36 rounded-full self-center mx-auto shrink-0" />
      <Skeleton className="flex-1 h-[680px] rounded-2xl" />
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

const StampCardDetail: React.FC = () => {
  const { memberId, programId } = useParams<{ memberId: string; programId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [stamping, setStamping]                   = useState(false);
  const [showStampConfirm, setShowStampConfirm]   = useState(false);
  const [cancelTarget, setCancelTarget]           = useState<{ id: string; slotNo: number } | null>(null);
  const [activePerk, setActivePerk]               = useState<PerkInfo | null>(null);
  const [showResetConfirm, setShowResetConfirm]   = useState(false);
  const [selectedBatch, setSelectedBatch]         = useState<number | null>(null);

  const { data, isLoading, isError } = useStampCardDetail(memberId, programId);
  const stampNow    = useStampNow();
  const resetCard   = useResetStampCard();

  // When data refreshes (e.g. after reset), snap back to the latest batch
  React.useEffect(() => {
    if (data) setSelectedBatch(null);
  }, [data?.maxBatch]);

  // Cancel stamp mutation
  const cancelStamp = useMutation({
    mutationFn: async (rowId: string) => {
      const { error } = await supabase
        .from("loyalty_program_stamp_subscriber")
        .update({
          stamped_status: "N",
          stamped_date: null,
          stamped_by: null,
          stamped_method: null,
        })
        .eq("id", rowId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stamp_card_detail", memberId, programId] });
      toast.success("Stamp cancelled successfully.");
    },
    onError: () => toast.error("Failed to cancel stamp. Please try again."),
  });

  if (isLoading) return <AppShell><PageSkeleton /></AppShell>;

  if (isError || !data) {
    return (
      <AppShell>
        <div className="p-6 text-center text-sm text-gray-500">
          Failed to load stamp card details.
        </div>
      </AppShell>
    );
  }

  const { program, design, allSubscriberSlots, availableBatches, maxBatch } = data;
  const stampcardId        = data.stampcard?.id ?? "";
  const customerAuthUserId = data.customerAuthUserId;
  const totalSlots         = design?.total_stamp_slots ?? 11;

  // active batch — defaults to maxBatch on first load
  const activeBatch = selectedBatch ?? maxBatch;
  const isLatestBatch = activeBatch === maxBatch;

  // derive filtered slots for the selected batch
  const subscriberSlots = allSubscriberSlots.filter((s) => s.batch === activeBatch);
  const stampedSlots    = subscriberSlots.filter((s) => {
    const v = s.stamped_status?.toUpperCase();
    return v === "Y" || v === "STAMPED";
  });
  const stampedSlotNos  = stampedSlots.map((s) => s.slot_no);
  const stampedCount    = stampedSlots.length;
  const logEntries      = [...stampedSlots]
    .filter((s) => s.stamped_date)
    .sort((a, b) => new Date(b.stamped_date!).getTime() - new Date(a.stamped_date!).getTime());

  const allStamped  = stampedCount >= totalSlots;
  const progressPct = totalSlots > 0 ? Math.round((stampedCount / totalSlots) * 100) : 0;

  // slots where is_redeem_item = 'Y'
  const redeemableSlotNos = subscriberSlots
    .filter((s) => s.is_redeem_item?.toUpperCase() === "Y")
    .map((s) => s.slot_no);

  const handleSlotClick = (info: SlotClickInfo) => {
    const subSlot = subscriberSlots.find((s) => s.slot_no === info.slot_no);
    if (subSlot?.is_redeem_item?.toUpperCase() !== "Y") return;
    setActivePerk({
      perk_image_url:   subSlot.perk_image_url   ?? info.perk_image_url,
      perk_title:       subSlot.perk_title        ?? info.perk_title,
      perk_description: subSlot.perk_description  ?? null,
      reward_value_text: subSlot.reward_value_text ?? info.reward_value_text,
    });
  };

  const handleLogRowClick = (entry: typeof subscriberSlots[0]) => {
    if (entry.is_redeem_item?.toUpperCase() !== "Y") return;
    setActivePerk({
      perk_image_url:   entry.perk_image_url,
      perk_title:       entry.perk_title,
      perk_description: entry.perk_description,
      reward_value_text: entry.reward_value_text,
    });
  };

  const handleResetCard = async () => {
    if (!stampcardId) return;
    try {
      const result = await resetCard.mutateAsync({
        stampcardId,
        customerAuthUserId,
        subscriberAccno: data.subscriberAccno,
        membershipId: memberId ?? "",
        programId: programId ?? "",
      });
      toast.success(`Card reset! Batch #${result.newBatch} started.`);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to reset card. Please try again.");
    }
  };

  const handleStampNow = async () => {
    if (!stampcardId || allStamped || stamping) return;
    setStamping(true);
    try {
      const result = await stampNow.mutateAsync({
        stampcardId,
        customerAuthUserId,
        membershipId: memberId ?? "",
        programId: programId ?? "",
      });
      toast.success(`Slot #${result.slotNo} stamped successfully!`);
    } catch (err: any) {
      if (err?.message === "NO_SLOTS") {
        toast.error("All slots are already stamped.");
      } else {
        toast.error("Failed to stamp. Please try again.");
      }
    } finally {
      setStamping(false);
    }
  };

  return (
    <AppShell>
      <div className="bg-gray-50 min-h-screen p-6">

        {/* Perks modal */}
        <PerksModal perk={activePerk} onClose={() => setActivePerk(null)} />

        {/* Confirmation dialogs */}
        <ConfirmDialog
          open={showStampConfirm}
          variant="stamp"
          onConfirm={handleStampNow}
          onClose={() => setShowStampConfirm(false)}
        />
        <ConfirmDialog
          open={!!cancelTarget}
          variant="cancel"
          slotNo={cancelTarget?.slotNo}
          onConfirm={() => cancelTarget && cancelStamp.mutate(cancelTarget.id)}
          onClose={() => setCancelTarget(null)}
        />
        <ConfirmDialog
          open={showResetConfirm}
          variant="reset"
          onConfirm={handleResetCard}
          onClose={() => setShowResetConfirm(false)}
        />

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-gray-400 mb-1">
          <span className="cursor-pointer hover:text-gray-600" onClick={() => navigate("/membership/subscribers")}>
            Membership
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="cursor-pointer hover:text-gray-600" onClick={() => navigate("/membership/subscribers")}>
            Subscriber List
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="cursor-pointer hover:text-gray-600" onClick={() => navigate(`/membership/subscribers/${memberId}`)}>
            Member Details
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-700 font-medium">Stamp Card</span>
        </nav>

        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{program.program_name}</h1>
            <p className="text-xs text-gray-500 mt-0.5">{program.program_description}</p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-sm">
            <Stamp className="h-4 w-4 text-fuchsia-500" />
            <span className="text-sm font-bold text-gray-800">{stampedCount}</span>
            <span className="text-xs text-gray-400">/ {totalSlots} stamps</span>
            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden ml-1">
              <div
                className="h-full bg-gradient-to-r from-fuchsia-500 to-pink-400 rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-fuchsia-600">{progressPct}%</span>
          </div>
        </div>

        {/* ── 3-column layout ── */}
        <div className="flex flex-col xl:flex-row gap-6 items-start">

          {/* ── Column 1: Stamp Card Visual ── */}
          <div className="xl:w-[380px] shrink-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Stamp Loyalty Card
            </p>
            {design ? (
              <StampCardViewer
                design={design}
                stampedSlotNos={stampedSlotNos}
                stampedCount={stampedCount}
                redeemableSlotNos={redeemableSlotNos}
                onSlotClick={handleSlotClick}
                className="w-full"
              />
            ) : (
              <div className="rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-700 p-8 text-white text-center">
                <Stamp className="h-12 w-12 mx-auto mb-3 opacity-60" />
                <p className="font-semibold">No card design found</p>
                <p className="text-xs opacity-70 mt-1">Design the card first in stamp campaign settings</p>
              </div>
            )}
          </div>

          {/* ── Column 2: Stamp Now Button ── */}
          <div className="xl:flex-none flex xl:flex-col items-center justify-center xl:pt-16 gap-4 xl:gap-6 xl:px-4">
            <button
              onClick={() => !allStamped && !stamping && isLatestBatch && setShowStampConfirm(true)}
              disabled={allStamped || stamping || !isLatestBatch}
              className={`
                relative group h-36 w-36 xl:h-44 xl:w-44 rounded-full
                transition-all duration-200 flex flex-col items-center justify-center gap-1 active:scale-95
                ${allStamped
                  ? "bg-gradient-to-br from-gray-400 to-gray-500 shadow-lg cursor-not-allowed opacity-70"
                  : "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-500 shadow-2xl shadow-indigo-300 hover:shadow-indigo-400 cursor-pointer"
                }
              `}
            >
              <span className="absolute inset-0 rounded-full ring-4 ring-white/20 group-hover:ring-white/40 transition-all" />
              {stamping ? (
                <>
                  <div className="h-9 w-9 border-4 border-white/40 border-t-white rounded-full animate-spin" />
                  <span className="text-white font-bold text-xs mt-1 drop-shadow">Stamping…</span>
                </>
              ) : allStamped ? (
                <>
                  <CheckCircle2 className="h-10 w-10 text-white drop-shadow" />
                  <span className="text-white font-black text-sm leading-tight text-center px-2 drop-shadow">Completed!</span>
                </>
              ) : (
                <>
                  <Stamp className="h-8 w-8 xl:h-10 xl:w-10 text-white drop-shadow" />
                  <span className="text-white font-black text-sm xl:text-base leading-tight text-center px-2 drop-shadow">
                    Stamp Card<br />NOW!
                  </span>
                </>
              )}
            </button>
            <p className="text-[11px] text-gray-400 text-center max-w-[140px]">
              {allStamped ? "All slots completed" : "Tap to issue a stamp to this member"}
            </p>

            {/* Reset Card button — only visible when all slots completed on latest batch */}
            {allStamped && isLatestBatch && (
              <button
                onClick={() => setShowResetConfirm(true)}
                disabled={resetCard.isPending}
                className="
                  flex items-center gap-2 px-5 py-2.5 rounded-full
                  bg-gradient-to-r from-amber-500 to-orange-500
                  hover:from-amber-400 hover:to-orange-400
                  text-white text-sm font-bold
                  shadow-lg shadow-orange-200
                  transition-all duration-200 active:scale-95
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                <RotateCcw className={`h-4 w-4 ${resetCard.isPending ? "animate-spin" : ""}`} />
                {resetCard.isPending ? "Resetting…" : "Reset Card"}
              </button>
            )}
          </div>

          {/* ── Column 3: Log Transaction ── */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Stamp Loyalty Card Log Transaction
            </p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* header */}
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-fuchsia-50 flex items-center justify-center">
                      <Clock className="h-4.5 w-4.5 text-fuchsia-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Transaction History</p>
                      <p className="text-[11px] text-gray-400">
                        {logEntries.length} stamp{logEntries.length !== 1 ? "s" : ""} recorded
                      </p>
                    </div>
                  </div>
                  <span className="bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100 text-xs font-bold px-3 py-1 rounded-full">
                    {stampedCount}/{totalSlots}
                  </span>
                </div>

                {/* Batch filter — only show if more than 1 batch */}
                {availableBatches.length > 1 && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="text-[11px] text-gray-400 font-medium">Batch:</span>
                    {availableBatches.map((b) => (
                      <button
                        key={b}
                        onClick={() => setSelectedBatch(b)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                          activeBatch === b
                            ? "bg-fuchsia-600 text-white border-fuchsia-600 shadow-sm"
                            : "bg-white text-gray-500 border-gray-200 hover:border-fuchsia-300 hover:text-fuchsia-600"
                        }`}
                      >
                        #{b}{b === maxBatch ? " (Current)" : ""}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* list */}
              <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
                {logEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                    <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                      <Stamp className="h-7 w-7 text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">No stamps yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Use the button on the left to issue the first stamp
                    </p>
                  </div>
                ) : (
                  logEntries.map((entry, idx) => {
                    const MethodIcon   = METHOD_ICON[entry.stamped_method?.toLowerCase() ?? ""] ?? Stamp;
                    const isRedeemable = entry.is_redeem_item?.toUpperCase() === "Y";
                    return (
                      <div
                        key={entry.id}
                        onClick={() => handleLogRowClick(entry)}
                        className={`px-5 py-3.5 flex items-center gap-3 transition-colors group ${isRedeemable ? "cursor-pointer hover:bg-fuchsia-50/60" : "hover:bg-gray-50/70"}`}
                      >
                        {/* index bubble */}
                        <div className="h-8 w-8 rounded-full bg-fuchsia-50 border border-fuchsia-100 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-black text-fuchsia-600">{idx + 1}</span>
                        </div>

                        {/* details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-gray-900">
                              Slot #{entry.slot_no}
                            </span>
                            {entry.perk_title && (
                              <span className="bg-violet-50 text-violet-600 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-violet-100">
                                {entry.perk_title}
                              </span>
                            )}
                            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                              <CheckCircle2 className="h-2.5 w-2.5" /> Stamped
                            </span>
                            {isRedeemable && (
                              <span className="bg-orange-50 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-100">
                                🔥 Perk
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            {entry.stamped_by && (
                              <span className="flex items-center gap-1 text-gray-400 text-[11px]">
                                <User2 className="h-3 w-3" />
                                {entry.stamped_by}
                              </span>
                            )}
                            {entry.stamped_method && (
                              <span className="flex items-center gap-1 text-gray-400 text-[11px]">
                                <MethodIcon className="h-3 w-3" />
                                {entry.stamped_method}
                              </span>
                            )}
                            <span className="text-gray-300 text-[11px]">Batch #{entry.batch}</span>
                          </div>
                        </div>

                        {/* date + cancel */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <p className="text-xs font-semibold text-gray-700 leading-snug">
                              {fmtDateTime(entry.stamped_date)}
                            </p>
                          </div>
                          <button
                            onClick={() => setCancelTarget({ id: entry.id, slotNo: entry.slot_no })}
                            className="
                              opacity-0 group-hover:opacity-100
                              h-7 w-7 rounded-lg
                              bg-rose-50 hover:bg-rose-100
                              border border-rose-100 hover:border-rose-200
                              flex items-center justify-center
                              transition-all duration-150
                            "
                            title="Cancel this stamp"
                          >
                            <X className="h-3.5 w-3.5 text-rose-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* footer */}
              {logEntries.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
                  <p className="text-[11px] text-gray-400">
                    Showing {logEntries.length} of {totalSlots} total slots
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Hover a row to reveal cancel
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default StampCardDetail;
