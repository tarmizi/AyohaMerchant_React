import React from "react";
import ContentCard from "@/components/layout/ContentCard";
import { Stamp, Star, Percent, Trophy, Ticket, CalendarCheck } from "lucide-react";

const metrics = [
  { label: "Total Stamped", value: 18, icon: Stamp, updated: "3/25/2026 1:58:51 AM" },
  { label: "Total Contestant", value: 0, icon: Trophy, updated: "" },
  { label: "Total Points", value: 30, icon: Star, updated: "3/25/2026 1:58:51 AM" },
  { label: "Total Voucher Used", value: 0, icon: Ticket, updated: "" },
  { label: "Membership Discount Used", value: 0, icon: Percent, updated: "" },
  { label: "Total Event Responded", value: 0, icon: CalendarCheck, updated: "" },
];

const LoyaltyCampaignActivity: React.FC = () => {
  return (
    <ContentCard title="Loyalty Campaign Activity">
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="border border-border rounded-lg p-3 flex flex-col items-center text-center"
          >
            <m.icon className="h-5 w-5 text-primary mb-1.5" />
            <p className="text-xl font-bold text-foreground">{m.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{m.label}</p>
            {m.updated && (
              <p className="text-[10px] text-muted-foreground/60 mt-1">Updated: {m.updated}</p>
            )}
          </div>
        ))}
      </div>
    </ContentCard>
  );
};

export default LoyaltyCampaignActivity;
