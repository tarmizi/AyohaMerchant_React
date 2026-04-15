import React from "react";
import { useAuth, type Permission, type MerchantRole } from "@/contexts/AuthContext";

interface PermissionGateProps {
  children: React.ReactNode;
  /** Required permission — child shown only if user has it */
  permission?: Permission;
  /** Any of these permissions suffices */
  anyPermission?: Permission[];
  /** Required role */
  role?: MerchantRole;
  /** Any of these roles suffices */
  anyRole?: MerchantRole[];
  /** What to render when access denied (defaults to nothing) */
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children based on the current user's role/permissions.
 * Use this to hide buttons, sections, or actions from unauthorized users.
 *
 * @example
 * <PermissionGate permission="cards:delete">
 *   <Button variant="destructive">Delete Card</Button>
 * </PermissionGate>
 *
 * @example
 * <PermissionGate role="merchant_owner" fallback={<p>Owner access required</p>}>
 *   <BillingSettings />
 * </PermissionGate>
 */
const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  anyPermission,
  role,
  anyRole,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, hasRole, hasAnyRole } = useAuth();

  if (permission && !hasPermission(permission)) return <>{fallback}</>;
  if (anyPermission && !hasAnyPermission(anyPermission)) return <>{fallback}</>;
  if (role && !hasRole(role)) return <>{fallback}</>;
  if (anyRole && !hasAnyRole(anyRole)) return <>{fallback}</>;

  return <>{children}</>;
};

export default PermissionGate;
