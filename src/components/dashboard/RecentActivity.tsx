import React from "react";
import ContentCard from "@/components/layout/ContentCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type ActivityType =
  | "Check In"
  | "Got Stamp"
  | "Got Point"
  | "Purchase"
  | "Make Redemption"
  | "Respond Event"
  | "Respond Contest"
  | "Comment"
  | "Check Out"
  | "Others";

interface Activity {
  member: string;
  type: ActivityType;
  description: string;
  datetime: string;
  avatar?: string;
}

const activityColors: Record<ActivityType, string> = {
  "Check In": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Got Stamp": "bg-purple-50 text-purple-700 border-purple-200",
  "Got Point": "bg-pink-50 text-pink-700 border-pink-200",
  "Purchase": "bg-blue-50 text-blue-700 border-blue-200",
  "Make Redemption": "bg-amber-50 text-amber-700 border-amber-200",
  "Respond Event": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Respond Contest": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Comment": "bg-gray-50 text-gray-700 border-gray-200",
  "Check Out": "bg-orange-50 text-orange-700 border-orange-200",
  "Others": "bg-muted text-muted-foreground border-border",
};

const activities: Activity[] = [
  { member: "Sue", type: "Got Stamp", description: "Stamp Collected - 2/11", datetime: "25/3/2026 1:58:51 AM" },
  { member: "Yam", type: "Got Stamp", description: "Stamp Collected - 2/11", datetime: "21/3/2026 12:03:16 AM" },
  { member: "Asyura", type: "Got Stamp", description: "Stamp Collected - 2/11", datetime: "18/3/2026 1:06:20 PM" },
  { member: "Farah", type: "Got Stamp", description: "Stamp Collected - 2/11", datetime: "18/3/2026 3:19:03 AM" },
  { member: "Ahmad", type: "Check In", description: "Checked in at outlet", datetime: "17/3/2026 10:22:00 AM" },
];

const RecentActivity: React.FC = () => {
  return (
    <ContentCard
      title={`Recent Activity (${activities.length})`}
      actions={<Button variant="ghost" size="sm" className="text-xs">View All</Button>}
      noPadding
    >
      <div className="divide-y divide-border">
        {activities.map((a, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                  {a.member.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{a.member}</p>
                <p className="text-xs text-muted-foreground truncate">{a.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${activityColors[a.type]}`}>
                {a.type}
              </span>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">{a.datetime}</span>
            </div>
          </div>
        ))}
      </div>
    </ContentCard>
  );
};

export default RecentActivity;
