import React from "react";
import ContentCard from "@/components/layout/ContentCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const redemptions = [
  { member: "Farah", item: "50% Discount untuk satu rest", datetime: "3/18/2026 1:06:20 PM" },
  { member: "Zatty", item: "Kopi O", datetime: "3/14/2026 2:22:27 AM" },
  { member: "Ahmad", item: "Free Nasi Lemak", datetime: "3/12/2026 9:15:00 AM" },
  { member: "Asyura", item: "Kopi O", datetime: "3/10/2026 4:30:00 PM" },
  { member: "Sue", item: "Birthday Voucher RM10", datetime: "3/8/2026 11:00:00 AM" },
];

const LatestRedemptions: React.FC = () => {
  return (
    <ContentCard
      title={`Latest Redemptions (${redemptions.length})`}
      actions={<Button variant="ghost" size="sm" className="text-xs">View All</Button>}
      noPadding
    >
      <div className="divide-y divide-border">
        {redemptions.map((r, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="text-xs font-semibold bg-accent/10 text-accent">
                {r.member.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{r.member}</p>
              <p className="text-xs text-muted-foreground truncate">{r.item}</p>
            </div>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">{r.datetime}</span>
          </div>
        ))}
      </div>
    </ContentCard>
  );
};

export default LatestRedemptions;
