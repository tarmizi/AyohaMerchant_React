import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type MerchantRole, type Permission } from "@/contexts/AuthContext";
import { ShieldAlert } from "lucide-react";

/** @deprecated Use MerchantRole — kept for backward compat */
export type { MerchantRole as UserRole };

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If true (default), redirects un-onboarded users to /onboarding */
  requireOnboarding?: boolean;
  /** Restrict to specific roles */
  allowedRoles?: MerchantRole[];
  /** Restrict to users with specific permission */
  requiredPermission?: Permission;
  /** Where to redirect on access denied (defaults to showing denied page) */
  fallbackPath?: string;
  /** Show inline access-denied instead of redirect */
  showDeniedPage?: boolean;
}

const AccessDeniedPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-6 bg-background">
    <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
      <ShieldAlert className="h-8 w-8 text-destructive" />
    </div>
    <h1 className="text-xl font-semibold text-foreground">Access Denied</h1>
    <p className="text-sm text-muted-foreground max-w-md">
      You do not have permission to access this section.
    </p>
  </div>
);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireOnboarding = true,
  allowedRoles,
  requiredPermission,
  fallbackPath,
  showDeniedPage = false,
}) => {
  const { isAuthenticated, user, hasAnyRole, hasPermission } = useAuth();
  const location = useLocation();

  // 1. Not logged in → login with return URL
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // 2. Needs onboarding
  if (requireOnboarding && user && !user.isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  // 3. Role check
  if (allowedRoles && !hasAnyRole(allowedRoles)) {
    if (showDeniedPage) return <AccessDeniedPage />;
    return <Navigate to={fallbackPath ?? "/dashboard"} replace />;
  }

  // 4. Permission check
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (showDeniedPage) return <AccessDeniedPage />;
    return <Navigate to={fallbackPath ?? "/dashboard"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
