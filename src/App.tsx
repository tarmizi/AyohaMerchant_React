import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import GuestRoute from "@/components/auth/GuestRoute";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import EnterpriseInfo from "./pages/EnterpriseInfo";
import EnterpriseDetails from "./pages/EnterpriseDetails";
import AddEnterprise from "./pages/AddEnterprise";
import EditEnterprise from "./pages/EditEnterprise";
import UserList from "./pages/UserList";
import UserDetails from "./pages/UserDetails";
import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";
import MembershipCardList from "./pages/MembershipCardList";
import MembershipCardDetails from "./pages/MembershipCardDetails";
import AddMembershipCard from "./pages/AddMembershipCard";
import EditMembershipCard from "./pages/EditMembershipCard";
import ManageLoyaltyPrograms from "./pages/ManageLoyaltyPrograms";
import AddLoyaltyProgram from "./pages/AddLoyaltyProgram";
import StampLoyaltyList from "./pages/StampLoyaltyList";
import StampCardSetting from "./pages/StampCardSetting";
import StampCardDesignEditor from "./pages/StampCardDesignEditor";
import AssignStampLoyalty from "./pages/AssignStampLoyalty";
import LoyaltyProgramList from "./pages/LoyaltyProgramList";
import CreateLoyaltyProgram from "./pages/CreateLoyaltyProgram";
import SubscriberList from "./pages/SubscriberList";
import SubscriberDetails from "./pages/SubscriberDetails";
import StampCardDetail from "./pages/StampCardDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<GuestRoute><Navigate to="/login" replace /></GuestRoute>} />

            {/* Guest-only routes */}
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected: requires auth but NOT onboarding */}
            <Route path="/onboarding" element={<ProtectedRoute requireOnboarding={false}><Onboarding /></ProtectedRoute>} />

            {/* Dashboard — all roles */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* Enterprise — owner + admin */}
            <Route path="/account/enterprise-info" element={<ProtectedRoute requiredPermission="enterprise:view"><EnterpriseInfo /></ProtectedRoute>} />
            <Route path="/account/enterprise-info/new" element={<ProtectedRoute requiredPermission="enterprise:manage"><AddEnterprise /></ProtectedRoute>} />
            <Route path="/account/enterprise-info/:id" element={<ProtectedRoute requiredPermission="enterprise:view"><EnterpriseDetails /></ProtectedRoute>} />
            <Route path="/account/enterprise-info/:id/edit" element={<ProtectedRoute requiredPermission="enterprise:manage"><EditEnterprise /></ProtectedRoute>} />

            {/* User Management — owner + admin (view), owner only (manage roles) */}
            <Route path="/account/user-list" element={<ProtectedRoute requiredPermission="users:view"><UserList /></ProtectedRoute>} />
            <Route path="/account/user-list/new" element={<ProtectedRoute requiredPermission="users:manage"><AddUser /></ProtectedRoute>} />
            <Route path="/account/user-list/:id" element={<ProtectedRoute requiredPermission="users:view"><UserDetails /></ProtectedRoute>} />
            <Route path="/account/user-list/:id/edit" element={<ProtectedRoute requiredPermission="users:manage"><EditUser /></ProtectedRoute>} />

            {/* Membership — Subscribers */}
            <Route path="/membership/subscribers" element={<ProtectedRoute><SubscriberList /></ProtectedRoute>} />
            <Route path="/membership/subscribers/:id" element={<ProtectedRoute><SubscriberDetails /></ProtectedRoute>} />
            <Route path="/membership/subscribers/:memberId/stamp/:programId" element={<ProtectedRoute><StampCardDetail /></ProtectedRoute>} />

            {/* Membership Card Management */}
            <Route path="/cards/settings" element={<ProtectedRoute requiredPermission="cards:view"><MembershipCardList /></ProtectedRoute>} />
            <Route path="/cards/new" element={<ProtectedRoute requiredPermission="cards:create"><AddMembershipCard /></ProtectedRoute>} />
            <Route path="/cards/:id" element={<ProtectedRoute requiredPermission="cards:view"><MembershipCardDetails /></ProtectedRoute>} />
            <Route path="/cards/:id/edit" element={<ProtectedRoute requiredPermission="cards:edit"><EditMembershipCard /></ProtectedRoute>} />
            <Route path="/cards/:id/programs" element={<ProtectedRoute requiredPermission="programs:view"><ManageLoyaltyPrograms /></ProtectedRoute>} />
            <Route path="/cards/:id/programs/add" element={<ProtectedRoute requiredPermission="programs:assign"><AddLoyaltyProgram /></ProtectedRoute>} />
            <Route path="/cards/:id/stamp-programs" element={<ProtectedRoute requiredPermission="programs:assign"><AssignStampLoyalty /></ProtectedRoute>} />

            {/* All Loyalty Programs */}
            <Route path="/campaigns/loyalty-programs" element={<ProtectedRoute requiredPermission="programs:view"><LoyaltyProgramList /></ProtectedRoute>} />
            <Route path="/campaigns/loyalty-programs/new" element={<ProtectedRoute requiredPermission="programs:create"><CreateLoyaltyProgram /></ProtectedRoute>} />

            {/* Stamp Loyalty Campaign */}
            <Route path="/campaigns/stamp-loyalty" element={<ProtectedRoute requiredPermission="campaigns:view"><StampLoyaltyList /></ProtectedRoute>} />
            <Route path="/campaigns/stamp-loyalty/new" element={<ProtectedRoute requiredPermission="programs:create"><StampCardSetting /></ProtectedRoute>} />
            <Route path="/campaigns/stamp-loyalty/:id" element={<ProtectedRoute requiredPermission="campaigns:view"><StampCardSetting /></ProtectedRoute>} />
            <Route path="/campaigns/stamp-loyalty/:id/edit" element={<ProtectedRoute requiredPermission="programs:edit"><StampCardSetting /></ProtectedRoute>} />
            <Route path="/campaigns/stamp-loyalty/:campaignId/design" element={<ProtectedRoute requiredPermission="programs:edit"><StampCardDesignEditor /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
