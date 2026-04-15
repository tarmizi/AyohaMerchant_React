import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Search, Plus, Eye, Pencil, Trash2, CreditCard, Settings2, CalendarDays, Crown } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useMembershipCards, useDeleteMembershipCard } from "@/hooks/useMembershipCards";
import type { MembershipCard } from "@/hooks/useMembershipCards";
import EmptyState from "@/components/layout/EmptyState";
import { useMerchantQuota } from "@/hooks/useMerchantQuota";
import PermissionGate from "@/components/auth/PermissionGate";

const LEVEL_STYLES: Record<string, string> = {
  Bronze: "bg-amber-50 text-amber-700 border-amber-200",
  Silver: "bg-slate-50 text-slate-600 border-slate-200",
  Gold: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Platinum: "bg-indigo-50 text-indigo-600 border-indigo-200",
  Elite: "bg-purple-50 text-purple-700 border-purple-200",
};

const MembershipCardList: React.FC = () => {
  const navigate = useNavigate();
  const { data: cards, isLoading } = useMembershipCards();
  const deleteMutation = useDeleteMembershipCard();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MembershipCard | null>(null);
  const quota = useMerchantQuota();

  const filtered = (cards || []).filter((c) =>
    c.card_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Membership card deleted successfully");
        setDeleteTarget(null);
      },
      onError: () => toast.error("Failed to delete membership card"),
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="Membership Card Setting"
        description="Manage all membership cards and their loyalty programs"
        breadcrumbs={[{ label: "Card Management" }, { label: "Membership Card Setting" }]}
        actions={
          <Button onClick={() => {
              if (!quota.can_create_card) {
                toast.error("Your current plan allows only 1 Membership Card. Please upgrade or contact admin to add more.");
                return;
              }
              navigate("/cards/new");
            }} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add New Membership Card
          </Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Search & count */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by card name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <span className="text-sm text-muted-foreground shrink-0">
            {isLoading ? "Loading..." : `${filtered.length} Record${filtered.length !== 1 ? "s" : ""} Found`}
          </span>
        </div>

        {/* Card List */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No Membership Cards"
            description={search ? "No cards match your search." : "Create your first membership card to get started."}
            action={
              !search ? (
                <Button onClick={() => {
                    if (!quota.can_create_card) {
                      toast.error("Your current plan allows only 1 Membership Card. Please upgrade or contact admin to add more.");
                      return;
                    }
                    navigate("/cards/new");
                  }} size="sm" className="gap-1.5 mt-2">
                  <Plus className="h-4 w-4" /> Add New Membership Card
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((card) => (
              <div
                key={card.id}
                className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Top section with image preview + info */}
                <div className="flex gap-4 p-4">
                  {/* Front card image or placeholder */}
                  <div className="w-28 h-[70px] rounded-lg overflow-hidden border border-border bg-muted shrink-0 flex items-center justify-center">
                    {card.card_image_front_url ? (
                      <img
                        src={card.card_image_front_url}
                        alt={`${card.card_name} front`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="gradient-primary w-full h-full flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-primary-foreground/70" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-foreground truncate">{card.card_name}</h3>
                      <Badge
                        variant="outline"
                        className={
                          card.card_status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0 text-[11px]"
                            : "bg-muted text-muted-foreground border-border shrink-0 text-[11px]"
                        }
                      >
                        {card.card_status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {card.card_level && (
                        <span className="flex items-center gap-1">
                          <Crown className="h-3 w-3" />
                          <Badge variant="outline" className={`text-[11px] px-1.5 py-0 ${LEVEL_STYLES[card.card_level] || "bg-secondary text-secondary-foreground border-border"}`}>
                            {card.card_level}
                          </Badge>
                        </span>
                      )}
                      {card.fee_payment_cycle && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {card.fee_payment_cycle}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-muted-foreground/70">
                      Created {new Date(card.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions bar */}
                <div className="border-t border-border px-4 py-2.5 flex items-center gap-1 bg-muted/30">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost" size="sm" className="h-8 gap-1.5 text-xs"
                        onClick={() => navigate(`/cards/${card.id}`)}
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View card details</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost" size="sm" className="h-8 gap-1.5 text-xs"
                        onClick={() => navigate(`/cards/${card.id}/edit`)}
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit card</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-primary hover:text-primary"
                        onClick={() => navigate(`/cards/${card.id}/programs`)}
                      >
                        <Settings2 className="h-3.5 w-3.5" /> Loyalty Programs
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Manage loyalty programs for this card</TooltipContent>
                  </Tooltip>

                  <div className="flex-1" />

                  <PermissionGate permission="cards:delete">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(card)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete card</TooltipContent>
                    </Tooltip>
                  </PermissionGate>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Membership Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.card_name}"? All linked loyalty programs will also be affected. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
};

export default MembershipCardList;
