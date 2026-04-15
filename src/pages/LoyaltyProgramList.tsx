import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/layout/EmptyState";
import StatusBadge from "@/components/layout/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Stamp, Star, Percent, Trophy, Ticket, CalendarCheck, Tag, Users,
  Plus, Search, PackageOpen, Trash2, ShieldAlert,
} from "lucide-react";
import { useAllLoyaltyPrograms, type LoyaltyProgramModuleType, type LoyaltyProgramMasterRecord } from "@/hooks/useLoyaltyPrograms";
import { useMerchantQuota } from "@/hooks/useMerchantQuota";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import PermissionGate from "@/components/auth/PermissionGate";

const PROGRAM_TYPES: { key: LoyaltyProgramModuleType; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { key: "stamp",    label: "Stamp",     icon: Stamp,         color: "text-rose-600",    bg: "bg-rose-50 border-rose-100" },
  { key: "point",    label: "Point",     icon: Star,          color: "text-amber-600",   bg: "bg-amber-50 border-amber-100" },
  { key: "discount", label: "Discount",  icon: Percent,       color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
  { key: "voucher",  label: "Voucher",   icon: Ticket,        color: "text-blue-600",    bg: "bg-blue-50 border-blue-100" },
  { key: "contest",  label: "Contest",   icon: Trophy,        color: "text-purple-600",  bg: "bg-purple-50 border-purple-100" },
  { key: "event",    label: "Event",     icon: CalendarCheck, color: "text-indigo-600",  bg: "bg-indigo-50 border-indigo-100" },
  { key: "coupon",   label: "Coupon",    icon: Tag,           color: "text-orange-600",  bg: "bg-orange-50 border-orange-100" },
  { key: "referral", label: "Referral",  icon: Users,         color: "text-teal-600",    bg: "bg-teal-50 border-teal-100" },
];

const TYPE_MAP = Object.fromEntries(PROGRAM_TYPES.map((t) => [t.key, t]));

const TABLE_MAP: Record<LoyaltyProgramModuleType, string> = {
  stamp: "loyalty_program_stamp", point: "loyalty_program_point",
  discount: "loyalty_program_discount", voucher: "loyalty_program_voucher",
  contest: "loyalty_program_contest", event: "loyalty_program_event",
  coupon: "loyalty_program_coupon", referral: "loyalty_program_referral",
};

const LoyaltyProgramList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const quota = useMerchantQuota();
  const { data: allPrograms = [], isLoading } = useAllLoyaltyPrograms();

  const [activeTab, setActiveTab] = useState<"all" | LoyaltyProgramModuleType>("all");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<LoyaltyProgramMasterRecord | null>(null);

  const filtered = useMemo(() => {
    let list = allPrograms;
    if (activeTab !== "all") list = list.filter((p) => p.loyalty_program_type === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => (p.program_name || "").toLowerCase().includes(q));
    }
    return list;
  }, [allPrograms, activeTab, search]);

  const countByType = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of PROGRAM_TYPES) counts[t.key] = allPrograms.filter((p) => p.loyalty_program_type === t.key).length;
    return counts;
  }, [allPrograms]);

  const handleDelete = async () => {
    if (!deleteTarget || !user) return;
    try {
      const table = TABLE_MAP[deleteTarget.loyalty_program_type];
      const { error } = await supabase
        .from(table as any)
        .update({ is_deleted: true } as any)
        .eq("id", deleteTarget.loyalty_program_record_id);
      if (error) throw error;
      // Trigger auto-syncs is_deleted to loyalty_program_master
      qc.invalidateQueries({ queryKey: ["loyalty-programs-master"] });
      qc.invalidateQueries({ queryKey: ["merchant_quota"] });
      toast.success("Loyalty program deleted successfully");
    } catch {
      toast.error("Failed to delete loyalty program");
    }
    setDeleteTarget(null);
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Loyalty Programs"
        description="Manage all your reusable loyalty programs across all types"
        breadcrumbs={[
          { label: "Campaign Setting" },
          { label: "Loyalty Programs" },
        ]}
        actions={
          <Button
            className="gap-2"
            onClick={() => {
              if (!quota.can_create_program) {
                toast.error("Your current plan allows only 1 Loyalty Program. Please upgrade or contact admin to add more.");
                return;
              }
              navigate("/campaigns/loyalty-programs/new");
            }}
          >
            <Plus className="h-4 w-4" /> Create Program
          </Button>
        }
      />

      <div className="p-6 space-y-5">
        {!quota.isLoading && !quota.can_create_program && (
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              Your current plan allows only {quota.max_loyalty_programs} Loyalty Program.
              You are using {quota.current_loyalty_programs} of {quota.max_loyalty_programs} allowed.
              Please upgrade or contact admin to add more.
            </AlertDescription>
          </Alert>
        )}

        {/* Type Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as any); setSearch(""); }}>
          <TabsList className="w-full h-auto flex-wrap gap-1 bg-muted/50 p-1.5 rounded-xl">
            <TabsTrigger value="all" className="text-[11px] gap-1.5 px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
              All <Badge variant="secondary" className="text-[9px] px-1 py-0 ml-0.5">{allPrograms.length}</Badge>
            </TabsTrigger>
            {PROGRAM_TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger key={t.key} value={t.key} className="text-[11px] gap-1.5 px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
                  <Icon className={`h-3.5 w-3.5 ${activeTab === t.key ? t.color : ""}`} />
                  {t.label}
                  {countByType[t.key] > 0 && <Badge variant="secondary" className="text-[9px] px-1 py-0 ml-0.5">{countByType[t.key]}</Badge>}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search programs..." className="pl-9 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* Program List */}
        <div className="border border-border rounded-xl bg-card overflow-hidden min-h-[280px]">
          {filtered.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={allPrograms.length === 0 ? PackageOpen : Search}
                title={allPrograms.length === 0 ? "No loyalty programs yet" : "No matching programs"}
                description={allPrograms.length === 0 ? "Create your first loyalty program to get started." : "Try adjusting your search or filter."}
                className="py-12"
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((prog) => {
                const meta = TYPE_MAP[prog.loyalty_program_type];
                const Icon = meta?.icon || Star;
                return (
                  <div key={prog.id} className="flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors">
                    <div className={`h-9 w-9 rounded-lg border flex items-center justify-center shrink-0 ${meta?.bg || ""}`}>
                      <Icon className={`h-4 w-4 ${meta?.color || ""}`} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-sm font-medium text-foreground truncate">{prog.program_name || "Unnamed"}</p>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span>{meta?.label || prog.loyalty_program_type}</span>
                        {prog.program_description && <span className="truncate max-w-[200px]">{prog.program_description}</span>}
                        <span>Created {format(new Date(prog.created_at), "d MMM yyyy")}</span>
                      </div>
                    </div>
                    <StatusBadge variant={prog.program_status === "Active" ? "success" : "default"} className="shrink-0">
                      {prog.program_status || prog.status}
                    </StatusBadge>
                    <PermissionGate permission="programs:delete">
                      <Button
                        variant="ghost" size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive shrink-0"
                        onClick={() => setDeleteTarget(prog)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </PermissionGate>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{filtered.length}</span> program{filtered.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Loyalty Program</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.program_name}"? This will soft-delete the program and it will no longer count toward your quota.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
};

export default LoyaltyProgramList;
