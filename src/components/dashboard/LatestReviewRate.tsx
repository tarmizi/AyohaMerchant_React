import React from "react";
import ContentCard from "@/components/layout/ContentCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const avgRating = 4.1;
const totalReviews = 10;

const reviews = [
  { member: "Sue", rating: 4, text: "", datetime: "25/3/2026 2:04:41 AM" },
  { member: "Fadli Shaaro", rating: 3, text: "dfhfstf", datetime: "5/2/2026 11:08:44 PM" },
  { member: "Ahmad", rating: 5, text: "Excellent service and rewards!", datetime: "1/2/2026 3:00:00 PM" },
];

const Stars: React.FC<{ count: number; max?: number }> = ({ count, max = 5 }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${i < count ? "fill-amber-400 text-amber-400" : "text-border"}`}
      />
    ))}
  </div>
);

const LatestReviewRate: React.FC = () => {
  return (
    <ContentCard
      title="Latest Review and Rate"
      actions={<Button variant="ghost" size="sm" className="text-xs">View All</Button>}
      noPadding
    >
      {/* Summary */}
      <div className="px-5 py-4 border-b border-border flex items-center gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-foreground">{avgRating}</p>
          <Stars count={Math.round(avgRating)} />
          <p className="text-[11px] text-muted-foreground mt-1">{totalReviews} Reviews</p>
        </div>
        {/* Mini bar chart for rating distribution */}
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const counts: Record<number, number> = { 5: 6, 4: 1, 3: 1, 2: 2, 1: 0 };
            const pct = totalReviews > 0 ? (counts[star] / totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground w-3 text-right">{star}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review list */}
      <div className="divide-y divide-border">
        {reviews.map((r, i) => (
          <div key={i} className="px-5 py-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                  {r.member.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{r.member}</p>
                <div className="flex items-center gap-2">
                  <Stars count={r.rating} />
                  <span className="text-[10px] text-muted-foreground">{r.datetime}</span>
                </div>
              </div>
            </div>
            {r.text && <p className="text-xs text-muted-foreground mt-1.5 ml-11">{r.text}</p>}
          </div>
        ))}
      </div>
    </ContentCard>
  );
};

export default LatestReviewRate;
