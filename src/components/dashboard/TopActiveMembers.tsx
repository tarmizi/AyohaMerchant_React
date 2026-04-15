import React from "react";
import ContentCard from "@/components/layout/ContentCard";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";

const data = [
  { name: "Akma", activity: 346 },
  { name: "Mohd Aslam", activity: 327 },
  { name: "Helmi", activity: 197 },
  { name: "Asyura", activity: 158 },
  { name: "Asfanizam", activity: 60 },
];

const config: ChartConfig = {
  activity: { label: "Activity", color: "hsl(270, 60%, 50%)" },
};

const TopActiveMembers: React.FC = () => {
  return (
    <ContentCard title="Top 5 Active Membership!">
      <ChartContainer config={config} className="h-[220px] w-full">
        <BarChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="activity" fill="hsl(270, 60%, 50%)" radius={[4, 4, 0, 0]} maxBarSize={40}>
            <LabelList dataKey="activity" position="top" className="fill-foreground text-[10px] font-medium" />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ContentCard>
  );
};

export default TopActiveMembers;
