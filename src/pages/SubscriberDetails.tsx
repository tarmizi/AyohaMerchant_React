import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemberDetails, type MemberPrivilege } from "@/hooks/useMemberDetails";
import {
  ChevronRight, Phone, Mail, Calendar, User, MapPin,
  Globe, Building2, Hash, Briefcase, Heart, Wrench, MessageCircle,
  Stamp, Star, Tag, Ticket, Trophy, CalendarDays, Gift, Users,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

const na = (v: string | number | null | undefined) =>
  v !== null && v !== undefined && v !== "" ? String(v) : "NA";

const fmtDate = (v: string | null | undefined) => {
  if (!v) return "NA";
  return new Date(v).toLocaleDateString("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
};

const fmtDateTime = (v: string | null | undefined) => {
  if (!v) return "NA";
  return new Date(v).toLocaleString("en-GB", {
    day: "2-digit", month: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const getInitials = (name: string | null) => {
  if (!name) return "?";
  return name.split(/[\s-]+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
};

// ─── sub-components ─────────────────────────────────────────────────────────


const PRIVILEGE_ICONS: Record<string, React.ElementType> = {
  stamp: Stamp, point: Star, discount: Tag, voucher: Ticket,
  contest: Trophy, event: CalendarDays, coupon: Gift, referral: Users,
};

const PRIVILEGE_COLORS: Record<string, string> = {
  stamp: "bg-pink-50 text-pink-500", point: "bg-yellow-50 text-yellow-500",
  discount: "bg-green-50 text-green-500", voucher: "bg-purple-50 text-purple-500",
  contest: "bg-orange-50 text-orange-500", event: "bg-blue-50 text-blue-500",
  coupon: "bg-red-50 text-red-500", referral: "bg-teal-50 text-teal-500",
};

function PrivilegeItem({ p, memberId }: { p: MemberPrivilege; memberId: string }) {
  const navigate = useNavigate();
  const Icon = PRIVILEGE_ICONS[p.loyalty_program_type] ?? Gift;
  const colorClass = PRIVILEGE_COLORS[p.loyalty_program_type] ?? "bg-gray-50 text-gray-500";
  const isStamp = p.loyalty_program_type === "stamp";

  const handleClick = () => {
    if (isStamp) {
      navigate(`/membership/subscribers/${memberId}/stamp/${p.loyalty_program_record_id}`);
    }
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-white transition-colors ${isStamp ? "cursor-pointer hover:border-fuchsia-100 hover:bg-fuchsia-50/30" : ""}`}
      onClick={handleClick}
    >
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 leading-snug">{p.program_name}</p>
        {p.program_description && (
          <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{p.program_description}</p>
        )}
        {isStamp && (
          <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 uppercase tracking-wide">
            Click here to Stamp this Card
          </span>
        )}
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0 mt-1" />
    </div>
  );
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

function InfoRow({ label, value, valueClass = "" }: { label: string; value: React.ReactNode; valueClass?: string }) {
  return (
    <div className="py-1">
      <p className="text-[11px] text-gray-400 leading-tight">{label}</p>
      <p className={`text-xs font-semibold text-gray-800 mt-0.5 ${valueClass}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const approved = (status ?? "").toLowerCase() === "approved" || (status ?? "").toLowerCase() === "active";
  return (
    <span className={`inline-block text-xs font-bold px-3 py-1 rounded ${approved ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}`}>
      {(status ?? "NA").toUpperCase()}
    </span>
  );
}

// ─── skeleton loader ─────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-[320px_1fr] gap-4">
        <Skeleton className="h-[420px] rounded-xl" />
        <Skeleton className="h-[420px] rounded-xl" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="col-span-2 h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}

// ─── empty section ────────────────────────────────────────────────────────────

function EmptyCell({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-10 text-xs text-gray-400">{message}</div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

const SubscriberDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useMemberDetails(id);

  if (isLoading) return <AppShell><PageSkeleton /></AppShell>;

  if (isError || !data) {
    return (
      <AppShell>
        <div className="p-6 text-center text-sm text-gray-500">
          Failed to load member details.
        </div>
      </AppShell>
    );
  }

  const { membership, profile, card, privileges } = data;

  return (
    <AppShell>
      <div className="bg-gray-50 min-h-screen p-6 space-y-4">
        {/* Breadcrumb + Title */}
        <nav className="flex items-center gap-1 text-xs text-gray-400 mb-1">
          <span
            className="cursor-pointer hover:text-gray-600"
            onClick={() => navigate("/membership/subscribers")}
          >
            Membership
          </span>
          <ChevronRight className="h-3 w-3" />
          <span
            className="cursor-pointer hover:text-gray-600"
            onClick={() => navigate("/membership/subscribers")}
          >
            Subscriber List
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-700 font-medium">Member Details</span>
        </nav>
        <h1 className="text-xl font-bold text-gray-900">Member Details</h1>

        {/* ── Section 1: Member Profile (full-width horizontal) ── */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">

            {/* ── Left: Gradient identity panel ── */}
            <div className="relative md:w-64 shrink-0 bg-gradient-to-b from-pink-400 via-fuchsia-500 to-purple-700 flex flex-col items-center justify-center px-6 py-8 gap-3">
              {/* decorative blobs */}
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />

              <span className="relative text-[10px] font-bold uppercase tracking-widest text-white/70 self-start">
                Member Profile
              </span>

              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-white/80 shadow-2xl">
                  {profile?.profile_image_url ? (
                    <AvatarImage src={profile.profile_image_url} alt={profile?.full_name ?? ""} />
                  ) : null}
                  <AvatarFallback className="text-2xl font-extrabold bg-white text-fuchsia-600">
                    {getInitials(profile?.full_name ?? null)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-white shadow" />
              </div>

              {/* Name */}
              <div className="relative text-center">
                <h2 className="text-base font-bold text-white leading-snug">
                  {na(profile?.full_name)}
                </h2>
                <p className="text-[11px] text-white/60 mt-0.5">
                  Last Access: {fmtDate(profile?.created_at)}
                </p>
              </div>

              {/* Membership no */}
              {membership.membership_no && (
                <span className="relative inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-white/30">
                  <Hash className="h-2.5 w-2.5" />
                  {membership.membership_no}
                </span>
              )}

              {/* Action buttons */}
              <div className="relative flex gap-2 w-full mt-1">
                <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-white border border-white/40 bg-white/10 hover:bg-white/20 rounded-lg py-2 transition-colors">
                  <Wrench className="h-3.5 w-3.5" /> Tools
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-fuchsia-700 bg-white hover:bg-white/90 rounded-lg py-2 transition-opacity shadow-sm">
                  <MessageCircle className="h-3.5 w-3.5" /> Message
                </button>
              </div>
            </div>

            {/* ── Right: Fields in 3-column grid ── */}
            <div className="flex-1 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-0 divide-y sm:divide-y-0 divide-gray-50">

                {/* Col 1: Contact */}
                <div className="space-y-3 py-4 sm:py-0 sm:border-r border-gray-100 sm:pr-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Contact Info</p>
                  {[
                    { icon: Phone, label: "Mobile Phone No", value: na(profile?.phone_no) },
                    { icon: Mail,  label: "Email",           value: na(profile?.email), blue: true },
                    { icon: Calendar, label: "Date of Birth", value: "NA" },
                    { icon: User,     label: "Gender",        value: "NA" },
                  ].map(({ icon: Icon, label, value, blue }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-fuchsia-50 flex items-center justify-center shrink-0">
                        <Icon className="h-3.5 w-3.5 text-fuchsia-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 leading-none">{label}</p>
                        <p className={`text-xs font-semibold mt-0.5 truncate ${blue ? "text-blue-600" : "text-gray-800"}`}>
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Col 2: Address */}
                <div className="space-y-3 py-4 sm:py-0 sm:border-r border-gray-100 sm:px-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Address</p>
                  {[
                    { icon: MapPin,    label: "Postage Address", value: "NA" },
                    { icon: Globe,     label: "Country",         value: "NA" },
                    { icon: Building2, label: "State",           value: "NA" },
                    { icon: Hash,      label: "Postcode",        value: "NA" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                        <Icon className="h-3.5 w-3.5 text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 leading-none">{label}</p>
                        <p className="text-xs font-semibold text-gray-800 mt-0.5">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Col 3: Lifestyle + Platform */}
                <div className="space-y-3 py-4 sm:py-0 sm:pl-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Lifestyle</p>
                  {[
                    { icon: Briefcase, label: "Profession",       value: "NA" },
                    { icon: Heart,     label: "Hobby / Interested",value: "NA" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-pink-50 flex items-center justify-center shrink-0">
                        <Icon className="h-3.5 w-3.5 text-pink-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 leading-none">{label}</p>
                        <p className="text-xs font-semibold text-gray-800 mt-0.5">{value}</p>
                      </div>
                    </div>
                  ))}

                  <div className="pt-3 border-t border-dashed border-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">Access Platform</p>
                    <div className="flex items-center gap-2">
                      {/* Facebook */}
                      <div className="h-8 w-8 rounded-xl bg-[#1877F2] flex items-center justify-center shadow-sm" title="Facebook">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                        </svg>
                      </div>
                      {/* Instagram */}
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-sm" title="Instagram">
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                          <circle cx="12" cy="12" r="4"/>
                          <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
                        </svg>
                      </div>
                      {/* TikTok */}
                      <div className="h-8 w-8 rounded-xl bg-black flex items-center justify-center shadow-sm" title="TikTok">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
                        </svg>
                      </div>
                      {/* WhatsApp */}
                      <div className="h-8 w-8 rounded-xl bg-[#25D366] flex items-center justify-center shadow-sm" title="WhatsApp">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12 2a10 10 0 00-8.593 15.172L2 22l4.978-1.38A10 10 0 1012 2z"/>
                        </svg>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5 italic">No platform linked</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2: Membership Card Info ── */}
        <div className="grid grid-cols-1 gap-4">

          {/* ── SECTION 2: Membership Card Info ── */}
          <SectionCard className="p-5 col-span-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

              {/* Col 1 – Membership Card + Privileges */}
              <div className="space-y-3">
                {/* ── Card Visual ── */}
                <div
                  className="relative w-full rounded-2xl overflow-hidden shadow-lg"
                  style={{ aspectRatio: "1.586" }}
                >
                  {/* Background image */}
                  {card?.card_image_front_url ? (
                    <img
                      src={card.card_image_front_url}
                      alt={card.card_name ?? "Card"}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 to-purple-700" />
                  )}
                  {/* Dark overlay for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

                  {/* Top row: logo + card name + level badge */}
                  <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 pt-3">
                    <div className="flex items-center gap-1.5">
                      {card?.card_image_front_url && (
                        <img
                          src={card.card_image_front_url}
                          alt=""
                          className="h-7 w-7 rounded-full object-cover border-2 border-white/60 shadow"
                        />
                      )}
                      <span className="text-white text-[11px] font-bold drop-shadow leading-tight max-w-[120px] truncate">
                        {card?.card_name ?? "—"}
                      </span>
                    </div>
                    {(membership.card_level ?? card?.card_level) && (
                      <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-white/20">
                        {(membership.card_level ?? card?.card_level ?? "").toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Bottom: member info */}
                  <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                    <p className="text-white/60 text-[9px] font-semibold uppercase tracking-widest mb-0.5">
                      Member
                    </p>
                    <p className="text-white text-xs font-bold leading-snug truncate drop-shadow">
                      {profile?.full_name ?? "—"}
                    </p>
                    <p className="text-white/70 text-[10px] mt-0.5 font-mono tracking-wide">
                      {membership.membership_no ?? "—"}
                    </p>
                  </div>
                </div>

                {/* ── Membership Privilege ── */}
                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-xs font-bold text-gray-800">Membership Privilege</p>
                    <div className="h-5 w-5 rounded-full bg-fuchsia-100 flex items-center justify-center">
                      <svg className="h-3 w-3 text-fuchsia-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                  </div>
                  {privileges.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Gift className="h-6 w-6 text-gray-300 mb-1.5" />
                      <p className="text-[11px] text-gray-400">No privileges linked</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {privileges.map((p) => (
                        <PrivilegeItem key={p.id} p={p} memberId={id ?? ""} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Col 2 – Card Info */}
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-900 mb-3">Membership Card Info</p>
                <InfoRow label="Membership Card Name" value={na(card?.card_name)} />
                <InfoRow
                  label="Membership Card Level"
                  value={(membership.card_level ?? card?.card_level ?? "NA").toUpperCase()}
                  valueClass="uppercase"
                />
                <InfoRow label="Membership Card Fee" value={na(membership.fee_paid)} />
                <InfoRow
                  label="Fee Payment Cycle"
                  value={na(membership.fee_payment_cycle ?? card?.fee_payment_cycle)}
                />
                <InfoRow
                  label="Membership Card Expired Date"
                  value={membership.valid_until ? fmtDate(membership.valid_until) : "No End Date"}
                />
                <InfoRow label="Is Membership Card Required Approval?" value="NA" />
                <InfoRow label="Membership Card Code" value="NA" />
                <InfoRow label="Membership Referral By" value="NA" />
              </div>

              {/* Col 3 – Status + Payment */}
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-900 mb-1">Status</p>
                <div className="mb-1">
                  <p className="text-[11px] text-gray-400">Membership Status</p>
                  <StatusBadge status={membership.membership_status} />
                </div>
                <InfoRow label="Membership Status Created By" value="NA" />
                <InfoRow
                  label="Membership Status Created Date"
                  value={fmtDateTime(membership.created_at)}
                />

                <hr className="border-gray-100 my-2" />

                <p className="text-sm font-bold text-gray-900">Membership Card Payment Info</p>
                <InfoRow label="Payment Method" value={na(membership.payment_method)} />
                <InfoRow
                  label="Payment Document/Link"
                  value={
                    membership.payment_reference ? (
                      <a
                        href={membership.payment_reference}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline break-all"
                      >
                        {membership.payment_reference}
                      </a>
                    ) : (
                      "NA"
                    )
                  }
                />
                <InfoRow label="Received Amount" value={na(membership.fee_paid)} />
                <InfoRow label="Remarks" value={na(membership.notes)} />
              </div>

              {/* Col 4 – Dates */}
              <div>
                <p className="text-sm font-bold text-gray-900 mb-3">Membership Date</p>
                <p className="text-xs font-semibold text-gray-800">
                  {fmtDate(membership.membership_date)}
                </p>

                <div className="mt-8">
                  <p className="text-[11px] text-gray-400">Payment Date</p>
                  <p className="text-xs font-semibold text-gray-800">
                    {fmtDateTime(membership.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Row 2: Activity + Redemption ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* SECTION 3: Latest Membership Activity */}
          <SectionCard className="lg:col-span-2 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-900 underline">Latest Membership Activity</p>
              <button className="text-xs text-blue-600 hover:underline">View All</button>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-2 text-gray-500 font-semibold w-10">No</th>
                  <th className="text-left px-3 py-2 text-gray-500 font-semibold">Campaign Name</th>
                  <th className="text-left px-3 py-2 text-gray-500 font-semibold">Activity</th>
                  <th className="text-left px-3 py-2 text-gray-500 font-semibold">DateTime</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4}>
                    <EmptyCell message="No Activity History" />
                  </td>
                </tr>
              </tbody>
            </table>
          </SectionCard>

          {/* SECTION 4: UnClaim Redemption */}
          <SectionCard className="p-5">
            <p className="text-sm font-bold text-gray-900 underline mb-3">UnClaim Redemption</p>
            <EmptyCell message="No Redemption" />
          </SectionCard>
        </div>

        {/* ── Row 3: Notification + Review ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* SECTION 5: Latest Notification */}
          <SectionCard className="lg:col-span-2 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-900 underline">Latest Notification</p>
              <button className="text-xs text-blue-600 hover:underline">View All</button>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-2 text-gray-500 font-semibold w-10">No</th>
                  <th className="text-left px-3 py-2 text-gray-500 font-semibold">Messaging Tool</th>
                  <th className="text-left px-3 py-2 text-gray-500 font-semibold">Message</th>
                  <th className="text-left px-3 py-2 text-gray-500 font-semibold">IsRead</th>
                  <th className="text-left px-3 py-2 text-gray-500 font-semibold">DateTime</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5}>
                    <EmptyCell message="No Notification History" />
                  </td>
                </tr>
              </tbody>
            </table>
          </SectionCard>

          {/* SECTION 6: Review And Rate */}
          <SectionCard className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-900 underline">Review And Rate</p>
              <button className="text-xs text-blue-600 hover:underline">View All</button>
            </div>
            <EmptyCell message="No Review Yet" />
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
};

export default SubscriberDetails;
