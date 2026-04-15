import React from "react";
import ContentCard from "@/components/layout/ContentCard";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const data = [
  { month: "Jan", members: 5 },
  { month: "Feb", members: 8 },
  { month: "Mar", members: 12 },
  { month: "Apr", members: 15 },
  { month: "May", members: 18 },
  { month: "Jun", members: 22 },
  { month: "Jul", members: 25 },
  { month: "Aug", members: 28 },
  { month: "Sep", members: 30 },
  { month: "Oct", members: 33 },
  { month: "Nov", members: 35 },
  { month: "Dec", members: 37 },
];

const config: ChartConfig = {
  members: { label: "Members", color: "hsl(270, 60%, 50%)" },
};

const MembershipGrowth: React.FC = () => {
  return (
    <ContentCard title="Membership Growth">
      <ChartContainer config={config} className="h-[220px] w-full">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="members"
            stroke="hsl(270, 60%, 50%)"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "hsl(270, 60%, 50%)", strokeWidth: 2, stroke: "white" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ChartContainer>
    </ContentCard>
  );
};

export default MembershipGrowth;
