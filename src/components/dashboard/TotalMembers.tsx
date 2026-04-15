import React from "react";
import ContentCard from "@/components/layout/ContentCard";
import { Users } from "lucide-react";

const TotalMembers: React.FC = () => {
  const totalMembers = 37;
  const feesYTD = "RM 0.00";
  const durationYears = 0;
  const durationMonths = 0;

  return (
    <ContentCard title="Total Members">
      <div className="flex flex-col items-center text-center py-2">
        <div className="relative mb-4">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <div className="h-20 w-20 rounded-full bg-card flex flex-col items-center justify-center">
              <Users className="h-5 w-5 text-primary mb-0.5" />
              <span className="text-2xl font-bold text-foreground">{totalMembers}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Unique Members</p>

        <div className="mt-5 w-full space-y-3 border-t border-border pt-4">
          <div>
            <p className="text-[11px] text-muted-foreground">Total Membership Fee Collection (YTD)</p>
            <p className="text-lg font-bold text-foreground">{feesYTD}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Average Membership Duration</p>
            <p className="text-base font-semibold text-foreground">
              {durationYears} Year, {durationMonths} Month
            </p>
          </div>
        </div>
      </div>
    </ContentCard>
  );
};

export default TotalMembers;
