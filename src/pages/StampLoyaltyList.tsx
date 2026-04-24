import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useMerchantQuota } from "@/hooks/useMerchantQuota";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Stamp, Search, Eye, Pencil, Plus, Trash2, Palette } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import PermissionGate from "@/components/auth/PermissionGate";

const StampLoyaltyList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const quota = useMerchantQuota();

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ["loyalty-programs", "stamp", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_program_stamp")
        .select("*")
        .eq("merchant_account_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Soft delete — trigger auto-syncs to loyalty_program_master
      const { error } = await supabase
        .from("loyalty_program_stamp")
        .update({ is_deleted: true } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loyalty-programs", "stamp"] });
      qc.invalidateQueries({ queryKey: ["loyalty-programs-master"] });
      qc.invalidateQueries({ queryKey: ["merchant_quota"] });
      toast.success("Stamp campaign deleted successfully");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete stamp campaign"),
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return programs;
    const q = search.toLowerCase();
    return programs.filter((p: any) => (p.program_name ?? "").toLowerCase().includes(q));
  }, [programs, search]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Stamp Loyalty Campaign Management"
        description="Manage your reusable stamp loyalty campaigns"
        breadcrumbs={[
          { label: "Campaign Setting" },
          { label: "Stamp Loyalty" },
        ]}
      />

      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaign name..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Stamp}
            title="No stamp loyalty campaigns found"
            description="Create your first stamp loyalty campaign to get started"
            className="py-16"
          />
        ) : (
          <div className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="grid grid-cols-[1fr_120px_120px_120px_100px_140px] gap-2 px-5 py-3 bg-muted/40 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span>Stamp Campaign Loyalty Name</span>
              <span>Card Type</span>
              <span>Campaign Start</span>
              <span>Campaign End</span>
              <span className="text-center">Subscribers</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y divide-border">
              {filtered.map((item: any) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_120px_120px_120px_100px_140px] gap-2 px-5 py-3.5 items-center hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Stamp className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground truncate">
                      {item.program_name}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.stamp_card_type ?? "—"}</span>
                  <span className="text-sm text-muted-foreground">{item.campaign_start_date ?? "—"}</span>
                  <span className="text-sm text-muted-foreground">{item.campaign_end_date ?? "—"}</span>
                  <span className="text-sm text-foreground text-center font-medium">
                    {item.subscribers_count ?? 0}
                  </span>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5"
                      onClick={() => navigate(`/campaigns/stamp-loyalty/${item.id}`)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5"
                      onClick={() => navigate(`/campaigns/stamp-loyalty/${item.id}/design`)}
                    >
                      <Palette className="h-3.5 w-3.5" />
                      Design Card
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => navigate(`/campaigns/stamp-loyalty/${item.id}/edit`)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <PermissionGate permission="programs:delete">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </PermissionGate>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filtered.length}</span>{" "}
            Record{filtered.length !== 1 ? "s" : ""} Found
          </p>
          <Button
            className="gap-2"
            onClick={() => {
              if (!quota.can_create_program) {
                toast.error("Your current plan allows only 1 Loyalty Program. Please upgrade or contact admin to add more.");
                return;
              }
              navigate("/campaigns/stamp-loyalty/new");
            }}
          >
            <Plus className="h-4 w-4" />
            Add Stamp Loyalty Card
          </Button>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stamp Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this stamp campaign? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
};

export default StampLoyaltyList;
