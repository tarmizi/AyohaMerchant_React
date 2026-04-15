---
name: RBAC foundation
description: Merchant roles (owner/admin/staff), user_roles table, permission matrix, PermissionGate component, route guards
type: feature
---
- Roles: merchant_owner, merchant_admin, merchant_staff (DB enum merchant_role)
- Future: platform_admin (separate from merchant roles, not in current enum)
- Roles stored in user_roles table (user_id + merchant_account_id + role, unique per merchant)
- Auto-assign: new auth.users get merchant_owner via DB trigger
- Security definer functions: has_merchant_role(), get_merchant_role()
- RLS: only merchant_owner can insert/update/delete roles
- AuthContext fetches role from user_roles on login
- Permission matrix in AuthContext (ROLE_PERMISSIONS map)
- PermissionGate component for action-level UI hiding
- ProtectedRoute supports requiredPermission and allowedRoles props
- AccessDeniedPage shows "You do not have permission to access this section."
- Owner-only actions: users:manage_roles, billing:manage, quota:manage, enterprise:delete, cards:delete, programs:delete
- merchant_admin: broad operational access, no billing/ownership/role-management
- merchant_staff: view-only for most modules, no create/edit/delete
