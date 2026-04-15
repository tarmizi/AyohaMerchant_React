# Project Memory

## Core
Ayoha Reward Business Portal — merchant-facing, NOT consumer app.
Purple/pink accent brand. Primary hsl(270,60%,50%), accent hsl(330,70%,55%).
Inter font. Premium, clean, professional UI. No playful design.
RBAC: merchant_owner > merchant_admin > merchant_staff. platform_admin separate (future).

## Memories
- [Design tokens](mem://design/tokens) — Purple/pink gradient system, shadow tokens, HSL palette
- [Auth structure](mem://features/auth) — Login, signup, forgot/reset password, onboarding flow, route protection
- [RBAC foundation](mem://features/rbac) — Roles, user_roles table, permission matrix, PermissionGate, route guards
- [Merchant quota](mem://features/merchant-quota) — Free tier (1 card, 1 program), monetization_config, quota_overrides, trigger auto-sync
- [Loyalty architecture](mem://features/loyalty-architecture) — Master table pattern, source tables, linking table, Available vs Linked
