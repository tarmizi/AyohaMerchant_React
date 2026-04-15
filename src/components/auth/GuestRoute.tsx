import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return null;
  if (!isAuthenticated) return <>{children}</>;

  // Preserve redirect param from login
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect");

  // Authenticated but not onboarded → onboarding
  if (user && !user.isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  // Authenticated and onboarded → dashboard (or redirect target)
  return <Navigate to={redirect || "/dashboard"} replace />;
};

export default GuestRoute;
