import React, { useState, useMemo } from "react";
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CreditCard, Crown, CalendarDays, ArrowLeft, Stamp,
  Plus, Search, Eye, Unlink, Palette, Pencil, PackageOpen, Users,
} from "lucide-react";
import { useMembershipCard } from "@/hooks/useMembershipCards";
import { useStampPrograms, useLinkedStampPrograms, type StampProgramRecord, type StampCardLink } from "@/hooks/useStampPrograms";
import { useLinkProgram, useUnlinkProgram } from "@/hooks/useLoyaltyPrograms";
import { format } from "date-fns";

/* ── Card Summary ── */
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

/* ── Stamp Program Row (available) ── */
function AvailableRow({ prog, onAdd, isPending }: { prog: StampProgramRecord; onAdd: () => void; isPending: boolean }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors">
      <div className="h-9 w-9 rounded-lg border bg-rose-50 border-rose-100 flex items-center justify-center shrink-0 mt-0.5">
        <Stamp className="h-4 w-4 text-rose-600" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">{prog.program_name}</p>
          {prog._has_stampcard_design && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary gap-0.5">
              <Palette className="h-2.5 w-2.5" /> Design
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
          {prog.stamp_campaign_code && <span>Code: {prog.stamp_campaign_code}</span>}
          <span>{prog.stamp_card_type}</span>
          <span>Rule: {prog.stamp_rule_amount} stamps</span>
          {prog.subscribers_count > 0 && (
            <span className="flex items-center gap-0.5"><Users className="h-3 w-3" /> {prog.subscribers_count}</span>
          )}
        </div>
        {prog.is_campaign_date_required && (prog.campaign_start_date || prog.campaign_end_date) && (
          <p className="text-[10px] text-muted-foreground">
            {prog.campaign_start_date && format(new Date(prog.campaign_start_date), "d MMM yyyy")}
            {prog.campaign_start_date && prog.campaign_end_date && " – "}
            {prog.campaign_end_date && format(new Date(prog.campaign_end_date), "d MMM yyyy")}
          </p>
        )}
      </div>
      <StatusBadge variant={prog.program_status === "Active" ? "success" : "default"} className="shrink-0 mt-1">
        {prog.program_status}
      </StatusBadge>
      <Button
        variant="outline" size="sm"
        className="h-8 text-xs gap-1 shrink-0 mt-0.5 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
        disabled={isPending}
        onClick={onAdd}
      >
        <Plus className="h-3 w-3" /> Add to Card
      </Button>
    </div>
  );
}

/* ── Stamp Program Row (linked) ── */
function LinkedRow({
  link,
  onRemove,
  onView,
  onEdit,
  onPreviewDesign,
}: {
  link: StampCardLink;
  onRemove: () => void;
  onView: () => void;
  onEdit: () => void;
  onPreviewDesign: () => void;
}) {
  const prog = link._stamp_program;
  if (!prog) return null;
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors">
      <div className="h-9 w-9 rounded-lg border bg-rose-50 border-rose-100 flex items-center justify-center shrink-0 mt-0.5">
        <Stamp className="h-4 w-4 text-rose-600" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">{prog.program_name}</p>
          {prog._has_stampcard_design && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary gap-0.5">
              <Palette className="h-2.5 w-2.5" /> Design
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
          {prog.stamp_campaign_code && <span>Code: {prog.stamp_campaign_code}</span>}
          <span>{prog.stamp_card_type}</span>
          <span>Linked {format(new Date(link.created_at), "d MMM yyyy")}</span>
        </div>
      </div>
      <StatusBadge variant={prog.program_status === "Active" ? "success" : "default"} className="shrink-0 mt-1">
        {prog.program_status}
      </StatusBadge>
      <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="View Program" onClick={onView}>
          <Eye className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Edit Program" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        {prog._has_stampcard_design && (
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-primary" title="Preview Stamp Card Design" onClick={onPreviewDesign}>
            <Palette className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost" size="sm"
          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          title="Remove from card"
          onClick={onRemove}
        >
          <Unlink className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

/* ── Main Page ── */
const AssignStampLoyalty: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: card, isLoading: cardLoading } = useMembershipCard(id);
  const { data: allStamps = [], isLoading: stampsLoading } = useStampPrograms();
  const { data: linkedData = [], isLoading: linkedLoading } = useLinkedStampPrograms(id);
  const linkMut = useLinkProgram();
  const unlinkMut = useUnlinkProgram();

  const [searchAvail, setSearchAvail] = useState("");
  const [searchLinked, setSearchLinked] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [unlinkTarget, setUnlinkTarget] = useState<{ linkId: string; name: string } | null>(null);

  // Available programs always come from the master-backed source list
  const availablePrograms = useMemo(() => {
    let list = allStamps;
    if (statusFilter !== "all") list = list.filter((p) => p.program_status === statusFilter);
    if (searchAvail.trim()) {
      const q = searchAvail.toLowerCase();
      list = list.filter((p) => p.program_name.toLowerCase().includes(q) || p.stamp_campaign_code?.toLowerCase().includes(q));
    }
    return list;
  }, [allStamps, statusFilter, searchAvail]);

  // Filtered linked
  const filteredLinked = useMemo(() => {
    let list = linkedData.filter((l) => l._stamp_program);
    if (searchLinked.trim()) {
      const q = searchLinked.toLowerCase();
      list = list.filter((l) =>
        l._stamp_program?.program_name?.toLowerCase().includes(q) ||
        l._stamp_program?.stamp_campaign_code?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [linkedData, searchLinked]);

  const isLoading = cardLoading || stampsLoading || linkedLoading;

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
        title="Assign Stamp Loyalty Programs"
        description="Link or remove stamp loyalty campaigns for this membership card"
        breadcrumbs={[
          { label: "Card Management" },
          { label: "Membership Card Setting", href: "/cards/settings" },
          { label: card.card_name, href: `/cards/${card.id}` },
          { label: "Stamp Programs" },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(`/cards/${card.id}`)}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Card
          </Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Card Summary */}
        <CardSummary card={card} />

        {/* Two-zone grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* ── LINKED ── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
              <h3 className="text-sm font-semibold text-foreground">Linked Stamp Programs</h3>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                {filteredLinked.length}
              </Badge>
            </div>

            {linkedData.length > 0 && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search linked stamp programs..."
                  className="h-8 pl-8 text-xs"
                  value={searchLinked}
                  onChange={(e) => setSearchLinked(e.target.value)}
                />
              </div>
            )}

            <div className="border border-border rounded-xl bg-card overflow-hidden min-h-[300px]">
              {filteredLinked.length === 0 ? (
                <EmptyState
                  icon={Stamp}
                  title="No stamp programs linked"
                  description="Add stamp programs from the available list →"
                  className="py-14"
                />
              ) : (
                <div className="divide-y divide-border">
                  {filteredLinked.map((link) => (
                    <LinkedRow
                      key={link.id}
                      link={link}
                      onRemove={() => setUnlinkTarget({ linkId: link.id, name: link._stamp_program!.program_name })}
                      onView={() => navigate(`/campaigns/stamp-loyalty/${link.loyalty_program_record_id}`)}
                      onEdit={() => navigate(`/campaigns/stamp-loyalty/${link.loyalty_program_record_id}/edit`)}
                      onPreviewDesign={() => navigate(`/campaigns/stamp-loyalty/${link.loyalty_program_record_id}/design`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── AVAILABLE ── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/40 shrink-0" />
              <h3 className="text-sm font-semibold text-foreground">Available Stamp Programs</h3>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                {availablePrograms.length}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or code..."
                  className="h-8 pl-8 text-xs"
                  value={searchAvail}
                  onChange={(e) => setSearchAvail(e.target.value)}
                />
              </div>
            </div>

            <div className="border border-border rounded-xl bg-card overflow-hidden min-h-[300px]">
              {availablePrograms.length === 0 && allStamps.length === 0 ? (
                <div className="p-6 space-y-4">
                  <EmptyState
                    icon={PackageOpen}
                    title="No stamp loyalty programs yet"
                    description="Create a stamp loyalty campaign first, then assign it here"
                    className="py-8"
                  />
                  <div className="flex justify-center">
                    <Button
                      variant="outline" size="sm"
                      className="gap-1.5 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => navigate("/campaigns/stamp-loyalty/new")}
                    >
                      <Plus className="h-3.5 w-3.5" /> Create Stamp Campaign
                    </Button>
                  </div>
                </div>
              ) : availablePrograms.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No matching programs"
                  description="No stamp programs match the current search or filter"
                  className="py-14"
                />
              ) : (
                <div className="divide-y divide-border">
                  {availablePrograms.map((prog) => (
                    <AvailableRow
                      key={prog.id}
                      prog={prog}
                      isPending={linkMut.isPending}
                      onAdd={() => linkMut.mutate({ cardId: id!, programId: prog.id, programType: "stamp" })}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Unlink dialog */}
      <AlertDialog open={!!unlinkTarget} onOpenChange={() => setUnlinkTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Stamp Program?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-medium text-foreground">{unlinkTarget?.name}</span> from this membership card?
              The stamp program itself will not be deleted.
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

export default AssignStampLoyalty;
