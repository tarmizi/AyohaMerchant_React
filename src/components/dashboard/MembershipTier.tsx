import React from "react";
import ContentCard from "@/components/layout/ContentCard";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Legend } from "recharts";

const tiers = [
  { name: "Platinum", count: 37, color: "hsl(45, 80%, 45%)" },
  { name: "Gold", count: 12, color: "hsl(38, 92%, 55%)" },
  { name: "Silver", count: 8, color: "hsl(0, 0%, 65%)" },
  { name: "Bronze", count: 5, color: "hsl(25, 60%, 50%)" },
];

const config: ChartConfig = Object.fromEntries(
  tiers.map((t) => [t.name, { label: t.name, color: t.color }])
);

const MembershipTier: React.FC = () => {
  return (
    <ContentCard title="Membership Tier">
      <ChartContainer config={config} className="h-[240px] w-full">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
          <Pie
            data={tiers}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            strokeWidth={3}
            stroke="hsl(var(--card))"
          >
            {tiers.map((t, i) => (
              <Cell key={i} fill={t.color} />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-xs text-foreground ml-1">{value}</span>}
          />
        </PieChart>
      </ChartContainer>
    </ContentCard>
  );
};

export default MembershipTier;
