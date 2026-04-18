import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users } from "lucide-react";
import { useSubscriberList } from "@/hooks/useSubscriberList";

const STATUS_STYLES: Record<string, string> = {
  active:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-secondary text-secondary-foreground border-border",
  pending:  "bg-amber-50 text-amber-700 border-amber-200",
  expired:  "bg-red-50 text-red-700 border-red-200",
};

const getInitials = (name: string | null) => {
  if (!name) return "?";
  return name.split(/[\s-]+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
};

const SubscriberList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: subscribers = [], isLoading, isError } = useSubscriberList();

  const filtered = subscribers.filter((s) => {
    const term = search.toLowerCase();
    const profile = s.customer_profile;
    return (
      (profile?.full_name ?? "").toLowerCase().includes(term) ||
      (profile?.email ?? "").toLowerCase().includes(term) ||
      (profile?.phone_no ?? "").toLowerCase().includes(term) ||
      (s.membership_no ?? "").toLowerCase().includes(term) ||
      (s.membership_status ?? "").toLowerCase().includes(term) ||
      (s.card_level ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <AppShell>
      <PageHeader
        title="Subscriber List"
        description="View all members subscribed to your merchant account"
        breadcrumbs={[{ label: "Membership" }, { label: "Subscriber List" }]}
      />

      <div className="p-6 space-y-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, membership no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-card border-border"
          />
        </div>

        {/* List card */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          {isLoading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-destructive" />
              </div>
              <p className="text-sm font-medium text-foreground">Failed to load subscribers</p>
              <p className="text-xs text-muted-foreground mt-1">Please try again later</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No subscribers found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {search
                  ? "Try adjusting your search"
                  : "Subscribers will appear here once members join"}
              </p>
            </div>
          ) : (
            <>
              {/* Header row */}
              <div className="hidden lg:grid grid-cols-[2fr_2fr_1.5fr_1.5fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-2.5 border-b border-border bg-muted/40">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Member</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Email</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Phone No</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Membership Card</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Membership No</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Card Level</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Membership Date</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Membership Plan</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
              </div>

              <div className="divide-y divide-border">
                {filtered.map((s) => {
                  const profile = s.customer_profile;
                  const statusKey = (s.membership_status ?? "").toLowerCase();
                  const statusStyle =
                    STATUS_STYLES[statusKey] ??
                    "bg-secondary text-secondary-foreground border-border";

                  return (
                    <div
                      key={s.id}
                      className="flex flex-col lg:grid lg:grid-cols-[2fr_2fr_1.5fr_1.5fr_1fr_1fr_1fr_1fr_auto] items-start lg:items-center gap-3 lg:gap-4 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/membership/subscribers/${s.id}`)}
                    >
                      {/* Avatar + Full Name */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-9 w-9 shrink-0">
                          {profile?.profile_image_url ? (
                            <AvatarImage src={profile.profile_image_url} alt={profile.full_name ?? ""} />
                          ) : null}
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {getInitials(profile?.full_name ?? null)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {profile?.full_name ?? <span className="text-muted-foreground">—</span>}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate lg:hidden">
                            {profile?.email ?? "—"}
                          </p>
                        </div>
                      </div>

                      {/* Email */}
                      <p className="hidden lg:block text-sm text-muted-foreground truncate">
                        {profile?.email ?? "—"}
                      </p>

                      {/* Phone No */}
                      <p className="text-sm text-muted-foreground">
                        {profile?.phone_no ?? "—"}
                      </p>

                      {/* Membership Card */}
                      <div className="flex items-center gap-2 min-w-0">
                        {s.membership_card?.card_image_front_url ? (
                          <img
                            src={s.membership_card.card_image_front_url}
                            alt={s.membership_card.card_name ?? ""}
                            className="h-8 w-12 object-cover rounded shrink-0"
                          />
                        ) : (
                          <div className="h-8 w-12 rounded bg-muted shrink-0" />
                        )}
                        <p className="text-xs text-muted-foreground truncate">
                          {s.membership_card?.card_name ?? "—"}
                        </p>
                      </div>

                      {/* Membership No */}
                      <p className="text-sm text-foreground font-medium">
                        {s.membership_no ?? "—"}
                      </p>

                      {/* Card Level */}
                      <p className="text-sm text-muted-foreground capitalize">
                        {s.card_level ?? "—"}
                      </p>

                      {/* Membership Date */}
                      <p className="text-sm text-muted-foreground">
                        {s.membership_date
                          ? new Date(s.membership_date).toLocaleDateString()
                          : "—"}
                      </p>

                      {/* Membership Plan (fee_payment_cycle) */}
                      <p className="text-sm text-muted-foreground capitalize">
                        {s.fee_payment_cycle ?? "—"}
                      </p>

                      {/* Status badge */}
                      <Badge
                        variant="outline"
                        className={`text-[11px] px-2 py-0.5 shrink-0 capitalize ${statusStyle}`}
                      >
                        {s.membership_status ?? "—"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground">
              Record Found:{" "}
              <span className="font-semibold text-foreground">{filtered.length}</span>
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default SubscriberList;
