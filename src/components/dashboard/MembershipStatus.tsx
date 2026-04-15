import React from "react";
import ContentCard from "@/components/layout/ContentCard";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList } from "recharts";

const data = [
  { status: "Approved", count: 37, fill: "hsl(142, 71%, 45%)" },
  { status: "New", count: 5, fill: "hsl(270, 60%, 50%)" },
  { status: "Expired", count: 2, fill: "hsl(38, 92%, 50%)" },
  { status: "Cancel", count: 1, fill: "hsl(0, 72%, 51%)" },
];

const config: ChartConfig = {
  count: { label: "Members" },
};

const MembershipStatus: React.FC = () => {
  return (
    <ContentCard title="Membership Status">
      <ChartContainer config={config} className="h-[200px] w-full">
        <BarChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="status" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
            <LabelList dataKey="count" position="top" className="fill-foreground text-xs font-medium" />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ContentCard>
  );
};

export default MembershipStatus;
