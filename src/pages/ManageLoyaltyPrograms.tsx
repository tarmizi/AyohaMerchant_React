import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/layout/EmptyState";
import StatusBadge from "@/components/layout/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CreditCard, Crown, CalendarDays, ArrowLeft,
  Stamp, Star, Percent, Trophy, Ticket, CalendarCheck, Tag, Users,
  Plus, Search, Link2, Unlink, Eye, PackageOpen,
} from "lucide-react";
import { useMembershipCard } from "@/hooks/useMembershipCards";
import {
  useAllLoyaltyPrograms, useLinkedPrograms,
  useLinkProgram, useUnlinkProgram,
  type LoyaltyProgramModuleType, type LoyaltyProgramMasterRecord, type LoyaltyProgramRecord, type CardProgramLink,
} from "@/hooks/useLoyaltyPrograms";
import StampCardPreview, { type StampCardDesign, type SlotConfig } from "@/components/stampcard-editor/StampCardPreview";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const PROGRAM_META: Record<LoyaltyProgramModuleType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  stamp:    { label: "Stamp Loyalty",      icon: Stamp,         color: "text-rose-600",    bg: "bg-rose-50 border-rose-100" },
  point:    { label: "Point Loyalty",      icon: Star,          color: "text-amber-600",   bg: "bg-amber-50 border-amber-100" },
  discount: { label: "Card Discount",      icon: Percent,       color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
  voucher:  { label: "Voucher Setting",    icon: Ticket,        color: "text-blue-600",    bg: "bg-blue-50 border-blue-100" },
  contest:  { label: "Contest Management", icon: Trophy,        color: "text-purple-600",  bg: "bg-purple-50 border-purple-100" },
  event:    { label: "Event Setting",      icon: CalendarCheck, color: "text-indigo-600",  bg: "bg-indigo-50 border-indigo-100" },
  coupon:   { label: "Coupon Setting",     icon: Tag,           color: "text-orange-600",  bg: "bg-orange-50 border-orange-100" },
  referral: { label: "Referral Program",   icon: Users,         color: "text-teal-600",    bg: "bg-teal-50 border-teal-100" },
};

const ALL_TYPES = Object.keys(PROGRAM_META) as LoyaltyProgramModuleType[];

const ManageLoyaltyPrograms: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: card, isLoading: cardLoading } = useMembershipCard(id);
  const { data: allPrograms = [], isLoading: programsLoading } = useAllLoyaltyPrograms();
  const { data: linkedData = [], isLoading: linkedLoading } = useLinkedPrograms(id);
  const linkMut = useLinkProgram();
  const unlinkMut = useUnlinkProgram();

  const [searchAvail, setSearchAvail] = useState("");
  const [searchLinked, setSearchLinked] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [unlinkTarget, setUnlinkTarget] = useState<{ linkId: string; name: string } | null>(null);
  const [previewProgram, setPreviewProgram] = useState<{ id: string; name: string; type: string } | null>(null);
  const [previewDesign, setPreviewDesign] = useState<StampCardDesign | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const availablePrograms = useMemo(() => {
    let list = allPrograms;
    if (typeFilter !== "all") list = list.filter((p) => p.loyalty_program_type === typeFilter);
    if (searchAvail.trim()) {
      const q = searchAvail.toLowerCase();
      list = list.filter((p) => (p.program_name || "").toLowerCase().includes(q));
    }
    return list;
  }, [allPrograms, typeFilter, searchAvail]);

  const filteredLinked = useMemo(() => {
    let list = linkedData.filter((l) => l._program);
    if (searchLinked.trim()) {
      const q = searchLinked.toLowerCase();
      list = list.filter((l) => l._program?.program_name?.toLowerCase().includes(q));
    }
    return list;
  }, [linkedData, searchLinked]);

  // Fetch stampcard design when preview is opened
  useEffect(() => {
    if (!previewProgram) { setPreviewDesign(null); return; }
    if (previewProgram.type !== "stamp") return;
    let cancelled = false;
    setPreviewLoading(true);
    (async () => {
      const { data: sc } = await supabase
        .from("loyalty_program_stampcard")
        .select("*")
        .eq("loyalty_program_stamp_id", previewProgram.id)
        .maybeSingle();
      if (cancelled) return;
      if (!sc) { setPreviewDesign(null); setPreviewLoading(false); return; }
      const { data: slotsData } = await supabase
        .from("loyalty_program_stampcard_slots")
        .select("*")
        .eq("loyalty_program_stampcard_id", sc.id)
        .order("sort_order", { ascending: true });
      if (cancelled) return;
      const slots: SlotConfig[] = (slotsData || []).map((s: any) => ({
        slot_no: s.slot_no,
        slot_type: s.slot_type as "sequence" | "perk",
        slot_label: s.slot_label,
        perk_image_url: s.perk_image_url,
        perk_title: s.perk_title,
        reward_value_text: s.reward_value_text,
      }));
      setPreviewDesign({
        stampcard_title: sc.stampcard_title || "Stamp Card",
        enterprise_name_display: sc.enterprise_name_display || "",
        campaign_name_display: sc.campaign_name_display || "",
        expiry_text_display: sc.expiry_text_display || "",
        background_image_url: sc.background_image_url || "",
        logo_image_url: sc.logo_image_url || "",
        primary_theme_color: sc.primary_theme_color || "#7c3aed",
        secondary_theme_color: sc.secondary_theme_color || "#db2777",
        is_nfc_enabled: sc.is_nfc_enabled,
        is_qr_enabled: sc.is_qr_enabled,
        stamp_rule_note_text: sc.stamp_rule_note_text || "",
        contact_us_title: sc.contact_us_title || "",
        facebook_url: sc.facebook_url || "",
        instagram_url: sc.instagram_url || "",
        whatsapp_url: sc.whatsapp_url || "",
        show_facebook: sc.show_facebook,
        show_instagram: sc.show_instagram,
        show_whatsapp: sc.show_whatsapp,
        total_stamp_slots: sc.total_stamp_slots,
        reward_box_label: sc.reward_box_label || "Reward",
        qr_box_label: sc.qr_box_label || "QR Code",
        slots,
      });
      setPreviewLoading(false);
    })();
    return () => { cancelled = true; };
  }, [previewProgram]);

  const isLoading = cardLoading || programsLoading || linkedLoading;

  if (isLoading) {
    return (
      <AppShell>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (!card) {
    return (
      <AppShell>
        <div className="p-6 text-center text-muted-foreground">
          <p>Membership card not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/cards/settings")}>
            Back to Card List
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Manage Loyalty Programs"
        description="Add or remove loyalty programs for this membership card"
        breadcrumbs={[
          { label: "Card Management" },
          { label: "Membership Card Setting", href: "/cards/settings" },
          { label: card.card_name, href: `/cards/${card.id}` },
          { label: "Loyalty Programs" },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/cards/settings")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Cards
          </Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Sticky Card Summary */}
        <div className="sticky top-0 z-10 -mx-6 px-6 pb-4 pt-0 bg-background/95 backdrop-blur-sm border-b border-border">
          <CardSummary card={card} />
          <p className="text-xs text-muted-foreground mt-2">
            Add or remove existing loyalty programs for this membership card.
          </p>
        </div>

        {/* Two-zone grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* ── ZONE 1: Linked Programs ── */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                <h3 className="text-sm font-semibold text-foreground">Linked Programs</h3>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                  {filteredLinked.length}
                </Badge>
              </div>
            </div>

            {linkedData.length > 0 && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search linked programs..."
                  className="h-8 pl-8 text-xs"
                  value={searchLinked}
                  onChange={(e) => setSearchLinked(e.target.value)}
                />
              </div>
            )}

            <div className="border border-border rounded-xl bg-card overflow-hidden min-h-[280px]">
              {filteredLinked.length === 0 ? (
                <EmptyState
                  icon={Link2}
                  title="No programs linked yet"
                  description="Add programs from the available list →"
                  className="py-12"
                />
              ) : (
                <div className="divide-y divide-border">
                  {filteredLinked.map((link) => {
                    const prog = link._program!;
                    const type = link.loyalty_program_type;
                    const meta = PROGRAM_META[type];
                    const Icon = meta?.icon || Star;
                    return (
                      <div key={link.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                        <div className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${meta.bg}`}>
                          <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{prog.program_name}</p>
                          <p className="text-[10px] text-muted-foreground">{meta.label} · Linked {format(new Date(link.created_at), "d MMM yyyy")}</p>
                        </div>
                        <StatusBadge variant={prog.program_status === "Active" ? "success" : "default"}>
                          {prog.program_status}
                        </StatusBadge>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Button
                            variant="ghost" size="sm" className="h-7 w-7 p-0"
                            title="View Program"
                            onClick={() => {
                              if (type === "stamp") {
                                setPreviewProgram({ id: prog.id, name: prog.program_name, type });
                              } else {
                                navigate(`/campaigns/${type}/${prog.id}`);
                              }
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            title="Remove from card"
                            onClick={() => setUnlinkTarget({ linkId: link.id, name: prog.program_name })}
                          >
                            <Unlink className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* ── ZONE 2: Available Programs ── */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/40 shrink-0" />
                <h3 className="text-sm font-semibold text-foreground">Available Programs</h3>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                  {availablePrograms.length}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {ALL_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{PROGRAM_META[t].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search available programs..."
                  className="h-8 pl-8 text-xs"
                  value={searchAvail}
                  onChange={(e) => setSearchAvail(e.target.value)}
                />
              </div>
            </div>

            <div className="border border-border rounded-xl bg-card overflow-hidden min-h-[280px]">
              {availablePrograms.length === 0 && allPrograms.length === 0 ? (
                <div className="p-5 space-y-4">
                  <EmptyState
                    icon={PackageOpen}
                    title="No loyalty programs created yet"
                    description="Create programs first, then link them here"
                    className="py-6"
                  />
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {ALL_TYPES.map((t) => {
                      const m = PROGRAM_META[t];
                      const TIcon = m.icon;
                      return (
                        <Button
                          key={t} variant="outline" size="sm"
                          className="h-7 text-[10px] gap-1 px-2"
                          onClick={() => navigate(`/programs/new?type=${t}`)}
                        >
                          <TIcon className={`h-3 w-3 ${m.color}`} />
                          {m.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ) : availablePrograms.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No matching programs"
                  description="No programs match the current search or filter"
                  className="py-12"
                />
              ) : (
                <div className="divide-y divide-border">
                {availablePrograms.map((prog) => {
                    const type = prog.loyalty_program_type;
                    const meta = PROGRAM_META[type];
                    const Icon = meta?.icon || Star;
                    return (
                      <div key={`${type}:${prog.loyalty_program_record_id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                        <div className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${meta.bg}`}>
                          <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{prog.program_name || "Unnamed Program"}</p>
                          <p className="text-[10px] text-muted-foreground">{meta.label} · {format(new Date(prog.created_at), "d MMM yyyy")}</p>
                        </div>
                        <StatusBadge variant={prog.program_status === "Active" ? "success" : "default"}>
                          {prog.program_status}
                        </StatusBadge>
                        <Button
                          variant="outline" size="sm"
                          className="h-7 text-[11px] gap-1 shrink-0 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                          disabled={linkMut.isPending}
                          onClick={() => linkMut.mutate({ cardId: id!, programId: prog.loyalty_program_record_id, programType: type })}
                        >
                          <Plus className="h-3 w-3" /> Add
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Stamp Card Preview Dialog */}
      <Dialog open={!!previewProgram} onOpenChange={(open) => !open && setPreviewProgram(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-0">
            <DialogTitle className="text-base">{previewProgram?.name} — Stamp Card Preview</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 pt-3 flex items-center justify-center">
            {previewLoading ? (
              <div className="py-16 text-center text-sm text-muted-foreground">Loading preview…</div>
            ) : previewDesign ? (
              <StampCardPreview design={previewDesign} className="scale-[0.85] origin-top" />
            ) : (
              <div className="py-16 text-center text-sm text-muted-foreground">
                No stamp card design found for this program.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Unlink confirmation dialog */}
      <AlertDialog open={!!unlinkTarget} onOpenChange={() => setUnlinkTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Program?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-medium text-foreground">{unlinkTarget?.name}</span> from this membership card?
              The program itself will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (unlinkTarget) {
                  unlinkMut.mutate({ linkId: unlinkTarget.linkId, cardId: id! });
                  setUnlinkTarget(null);
                }
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
};

/* ── Sub-components ── */

function CardSummary({ card }: { card: any }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-4">
        <div className="flex gap-2 shrink-0">
          {[card.card_image_front_url, card.card_image_back_url].map((url: string | null, i: number) => (
            <div key={i} className="w-24 h-[60px] rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
              {url ? (
                <img src={url} alt={i === 0 ? "Front" : "Back"} className="w-full h-full object-cover" />
              ) : (
                <div className="gradient-primary w-full h-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary-foreground/70" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <h2 className="text-base font-semibold text-foreground truncate">{card.card_name}</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {card.card_level && (
              <span className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                <Badge variant="outline" className="text-[11px] px-1.5 py-0">{card.card_level}</Badge>
              </span>
            )}
            {card.fee_payment_cycle && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" /> {card.fee_payment_cycle}
              </span>
            )}
          </div>
        </div>
        <StatusBadge variant={card.card_status === "Active" ? "success" : "default"}>
          {card.card_status}
        </StatusBadge>
      </div>
    </div>
  );
}

export default ManageLoyaltyPrograms;
