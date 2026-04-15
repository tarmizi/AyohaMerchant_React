import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import RecentActivity from "@/components/dashboard/RecentActivity";
import TotalMembers from "@/components/dashboard/TotalMembers";
import MembershipStatus from "@/components/dashboard/MembershipStatus";
import MembershipGrowth from "@/components/dashboard/MembershipGrowth";
import MembershipTier from "@/components/dashboard/MembershipTier";
import LoyaltyCampaignActivity from "@/components/dashboard/LoyaltyCampaignActivity";
import LatestRedemptions from "@/components/dashboard/LatestRedemptions";
import MemberBirthday from "@/components/dashboard/MemberBirthday";
import LatestReviewRate from "@/components/dashboard/LatestReviewRate";
import TopActiveMembers from "@/components/dashboard/TopActiveMembers";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <AppShell>
      <PageHeader
        title={`Welcome back, ${user?.name ?? "Merchant"}`}
        description="Here's an overview of your merchant performance today."
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      <div className="p-6 space-y-6">
        {/* Row 1: Recent Activity | Total Members | Membership Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentActivity />
          <TotalMembers />
          <MembershipStatus />
        </div>

        {/* Row 2: Membership Growth | Membership Tier */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MembershipGrowth />
          </div>
          <MembershipTier />
        </div>

        {/* Row 3: Top Active Members | Loyalty Campaign Activity | Latest Redemptions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TopActiveMembers />
          <LoyaltyCampaignActivity />
          <LatestRedemptions />
        </div>

        {/* Row 4: Member Birthday | Latest Review and Rate */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MemberBirthday />
          <LatestReviewRate />
        </div>
      </div>
    </AppShell>
  );
};

export default Dashboard;
