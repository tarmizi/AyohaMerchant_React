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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CreditCard, Crown, CalendarDays, ArrowLeft, X,
  Stamp, Star, Percent, Trophy, Ticket, CalendarCheck, Tag, Users,
  Plus, Search, PackageOpen, Check,
} from "lucide-react";
import { useMembershipCard } from "@/hooks/useMembershipCards";
import {
  useAllLoyaltyPrograms, useLinkProgram,
  type LoyaltyProgramModuleType, type LoyaltyProgramMasterRecord,
} from "@/hooks/useLoyaltyPrograms";
import { format } from "date-fns";

const PROGRAM_TYPES: { key: LoyaltyProgramModuleType; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { key: "stamp",    label: "Loyalty Stamp",        icon: Stamp,         color: "text-rose-600",    bg: "bg-rose-50 border-rose-100" },
  { key: "point",    label: "Loyalty Point",        icon: Star,          color: "text-amber-600",   bg: "bg-amber-50 border-amber-100" },
  { key: "discount", label: "Membership Discount",  icon: Percent,       color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
  { key: "voucher",  label: "Membership Voucher",   icon: Ticket,        color: "text-blue-600",    bg: "bg-blue-50 border-blue-100" },
  { key: "contest",  label: "Membership Contest",   icon: Trophy,        color: "text-purple-600",  bg: "bg-purple-50 border-purple-100" },
  { key: "event",    label: "Membership Event",     icon: CalendarCheck, color: "text-indigo-600",  bg: "bg-indigo-50 border-indigo-100" },
  { key: "coupon",   label: "Membership Coupon",    icon: Tag,           color: "text-orange-600",  bg: "bg-orange-50 border-orange-100" },
  { key: "referral", label: "Membership Referral",  icon: Users,         color: "text-teal-600",    bg: "bg-teal-50 border-teal-100" },
];

const TYPE_MAP = Object.fromEntries(PROGRAM_TYPES.map((t) => [t.key, t]));

const AddLoyaltyProgram: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: card, isLoading: cardLoading } = useMembershipCard(id);
  const { data: allPrograms = [], isLoading: programsLoading } = useAllLoyaltyPrograms();
  const linkMut = useLinkProgram();

  const [activeType, setActiveType] = useState<LoyaltyProgramModuleType>("stamp");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter programs by active type, search, and status from the master source list
  const filteredPrograms = useMemo(() => {
    let list = allPrograms.filter((p) => p.loyalty_program_type === activeType);
    if (statusFilter !== "all") list = list.filter((p) => p.program_status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => (p.program_name || "").toLowerCase().includes(q));
    }
    return list;
  }, [allPrograms, activeType, statusFilter, search]);

  // Count per type for badges
  const countByType = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of PROGRAM_TYPES) {
      counts[t.key] = allPrograms.filter((p) => p.loyalty_program_type === t.key).length;
    }
    return counts;
  }, [allPrograms]);

  const activeMeta = TYPE_MAP[activeType];
  const isLoading = cardLoading || programsLoading;

  if (isLoading) {
    return (
      <AppShell>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-lg" />
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
        title="Add Loyalty Program to Membership Card"
        description="Select and add existing loyalty programs to this Membership Card."
        breadcrumbs={[
          { label: "Card Management" },
          { label: "Membership Card Setting", href: "/cards/settings" },
          { label: card.card_name, href: `/cards/${card.id}` },
          { label: "Add Loyalty Program" },
        ]}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate(`/cards/${card.id}`)}>
            <X className="h-4 w-4" />
          </Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Card Summary */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="flex gap-2 shrink-0">
              {[card.card_image_front_url, card.card_image_back_url].map((url: string | null, i: number) => (
                <div key={i} className="w-20 h-[50px] rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
                  {url ? (
                    <img src={url} alt={i === 0 ? "Front" : "Back"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="gradient-primary w-full h-full flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-primary-foreground/70" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <h2 className="text-sm font-semibold text-foreground truncate">{card.card_name}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                {card.card_level && (
                  <span className="flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{card.card_level}</Badge>
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

        {/* Type Navigation Tabs */}
        <Tabs value={activeType} onValueChange={(v) => { setActiveType(v as LoyaltyProgramModuleType); setSearch(""); setStatusFilter("all"); }}>
          <TabsList className="w-full h-auto flex-wrap gap-1 bg-muted/50 p-1.5 rounded-xl">
            {PROGRAM_TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger
                  key={t.key}
                  value={t.key}
                  className="text-[11px] gap-1.5 px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
                >
                  <Icon className={`h-3.5 w-3.5 ${activeType === t.key ? t.color : ""}`} />
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className="sm:hidden">{t.key.charAt(0).toUpperCase() + t.key.slice(1)}</span>
                  {countByType[t.key] > 0 && (
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 ml-0.5 font-medium">
                      {countByType[t.key]}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeMeta.label} programs...`}
              className="h-9 pl-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-32 text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Program List */}
        <div className="border border-border rounded-xl bg-card overflow-hidden min-h-[320px]">
          {filteredPrograms.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={countByType[activeType] === 0 ? PackageOpen : Search}
                title={countByType[activeType] === 0
                  ? `No ${activeMeta.label} programs created yet`
                  : "No matching programs found"
                }
                description={countByType[activeType] === 0
                  ? `Create a ${activeMeta.label} program first, then assign it here.`
                  : "Try adjusting your search or filter."
                }
                className="py-12"
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredPrograms.map((prog) => {
                const Icon = activeMeta.icon;
                return (
                  <div
                    key={prog.id}
                    className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-muted/30"
                  >
                    <div className={`h-9 w-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${activeMeta.bg}`}>
                      <Icon className={`h-4 w-4 ${activeMeta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium text-foreground truncate">{prog.program_name || "Unnamed Program"}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                        <span>{activeMeta.label}</span>
                        {prog.program_description && (
                          <span className="truncate max-w-[200px]">{prog.program_description}</span>
                        )}
                        <span>Created {format(new Date(prog.created_at), "d MMM yyyy")}</span>
                      </div>
                    </div>
                    <StatusBadge variant={prog.program_status === "Active" ? "success" : "default"} className="shrink-0 mt-1">
                      {prog.program_status}
                    </StatusBadge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5 shrink-0 mt-0.5 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                      disabled={linkMut.isPending}
                      onClick={() => linkMut.mutate({ cardId: id!, programId: prog.loyalty_program_record_id, programType: activeType })}
                    >
                      <Plus className="h-3 w-3" /> Add to Card
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default AddLoyaltyProgram;
