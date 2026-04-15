import React from "react";
import ContentCard from "@/components/layout/ContentCard";
import EmptyState from "@/components/layout/EmptyState";
import { Cake } from "lucide-react";

const birthdays: { member: string; date: string }[] = [];

const MemberBirthday: React.FC = () => {
  return (
    <ContentCard title="Member Birthday">
      {birthdays.length === 0 ? (
        <EmptyState
          icon={Cake}
          title="No Member Birthday"
          description="No members have birthdays this month."
          className="py-10"
        />
      ) : (
        <div className="divide-y divide-border">
          {birthdays.map((b, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5">
              <Cake className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{b.member}</span>
              <span className="text-xs text-muted-foreground ml-auto">{b.date}</span>
            </div>
          ))}
        </div>
      )}
    </ContentCard>
  );
};

export default MemberBirthday;
