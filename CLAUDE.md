# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ayoha Reward Business Portal** — a merchant-facing web app for managing loyalty programs, membership cards, and stamp campaigns. This is NOT the consumer app.

Brand: purple/pink accent. Primary `hsl(270,60%,50%)`, accent `hsl(330,70%,55%)`. Inter font. Premium, clean, professional UI — no playful design.

## Commands

```bash
# Development
bun dev           # or: npm run dev

# Build
bun run build     # or: npm run build

# Lint
bun run lint

# Tests
bun run test           # run once
bun run test:watch     # watch mode
```

Required env vars (`.env`):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

## Architecture

### Tech Stack
React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui (Radix) + Supabase + TanStack Query v5 + React Router v6 + Zod + React Hook Form

### Entry Points
- `src/main.tsx` — app bootstrap
- `src/App.tsx` — all route definitions with auth/permission guards
- `src/contexts/AuthContext.tsx` — auth state + RBAC permission matrix (single source of truth for roles/permissions)

### Layout
All authenticated pages are wrapped in `AppShell` (`src/components/layout/AppShell.tsx`), which composes `AppSidebar` + `AppHeader` using shadcn's `SidebarProvider`.

### Data Layer
- Supabase client: `src/integrations/supabase/client.ts`
- Generated DB types: `src/integrations/supabase/types.ts` (do not edit manually)
- Data hooks live in `src/hooks/` — always use TanStack Query (`useQuery`/`useMutation`) via these hooks

### RBAC System

Roles: `merchant_owner > merchant_admin > merchant_staff`. `platform_admin` is future/separate.

- Role stored in `user_roles` table (DB enum `merchant_role`), auto-assigned `merchant_owner` via DB trigger for new users
- `AuthContext` fetches role from `user_roles` on login and exposes the full permission matrix
- **Route-level guard**: `ProtectedRoute` with `requiredPermission` or `allowedRoles` props
- **UI-level guard**: `PermissionGate` component wraps buttons/sections (`permission`, `anyPermission`, `role`, `anyRole` props)
- Owner-only permissions: `users:manage_roles`, `billing:manage`, `quota:manage`, `enterprise:delete`, `cards:delete`, `programs:delete`
- `merchant_staff` is view-only across all modules

### Loyalty Program Architecture

Two distinct concepts — do not confuse them:

| Table | Purpose |
|---|---|
| `loyalty_program_master` | Central reference for ALL merchant programs — use for "Available Programs" lists |
| `loyalty_program_stamp/point/discount/...` | Source/type tables — a DB trigger `sync_loyalty_program_master` auto-syncs changes here to master |
| `membership_card_loyalty_programs` | Linking table only — use for "Linked Programs" on a card |

- **Available Programs** → query `loyalty_program_master` (NOT the linking table)
- **Linked Programs** → query `membership_card_loyalty_programs`
- Soft delete: `is_deleted + deleted_at` on master and source tables

### Quota System

Free tier defaults: 1 membership card, 1 loyalty program per merchant.

- `useMerchantQuota()` hook (`src/hooks/useMerchantQuota.ts`) — exposes `can_create_card`, `can_create_program`, remaining counts
- Quota limits read from `merchant_quotas` table (per-merchant override) falling back to hardcoded defaults
- Card count: `membership_cards` where `is_deleted = false`
- Program count: `loyalty_program_master` where `is_deleted = false`
- `membership_card_loyalty_programs` is NOT a quota source
- Quota gate enforced in: `AddMembershipCard`, `MembershipCardList`, `StampCardSetting`, `StampLoyaltyList`, `CreateLoyaltyProgram`, `LoyaltyProgramList`
- Exceeded message: `"Your current plan allows only 1 X. Please upgrade or contact admin to add more."`

### Route Structure

```
/login, /signup, /forgot-password, /reset-password  → GuestRoute (unauthenticated only)
/onboarding                                          → ProtectedRoute (no onboarding check)
/dashboard                                           → all roles
/account/enterprise-info/*                           → enterprise:view / enterprise:manage
/account/user-list/*                                 → users:view / users:manage
/cards/*                                             → cards:* / programs:*
/campaigns/loyalty-programs/*                        → programs:*
/campaigns/stamp-loyalty/*                           → campaigns:* / programs:*
/membership/subscribers/:memberId/stamp/:programId   → StampCardDetail page
```

## Stamp Card Module (completed 2026-04-18)

### Status: Complete
Full stamp card member detail page with stamp/cancel/perks functionality.

### Files
- `src/pages/StampCardDetail.tsx` — main page: 3-col layout (card viewer | stamp button | transaction log), `PerksModal`, `ConfirmDialog` (stamp + cancel variants)
- `src/components/stampcard-editor/StampCardViewer.tsx` — standalone viewer (NOT the design editor's preview), 3-col grid, `minHeight: 580`, subscriber-aware stamped slot rendering
- `src/hooks/useStampCardDetail.ts` — multi-step fetch: membership → stamp program → stampcard design → stampcard_slots → subscriber slots
- `src/hooks/useStampNow.ts` — mutation: finds smallest `slot_no` where `stamped_status='N'`, updates to `'Y'`
- `src/pages/SubscriberDetails.tsx` — removed "View Card" and "Approval" buttons; stamp privilege navigates to StampCardDetail
- `src/App.tsx` — added route for StampCardDetail

### Database Tables
| Table | Usage |
|---|---|
| `loyalty_program_stamp_subscriber` | Per-member slot stamp state (`stamped_status='Y'/'N'`, `is_redeem_item`, `customer_auth_user_id`, `merchant_account_id`) |
| `loyalty_program_stampcard` | Card design (colors, images, labels) — not in `types.ts`, use `as any` |
| `loyalty_program_stampcard_slots` | Slot design configs (perk images, titles) — not in `types.ts`, use `as any` |
| `loyalty_program_stamp` | Stamp program (rules, descriptions) |
| `merchant_memberships` | Member lookup — `customer_profile_id` = `customer_auth_user_id` in subscriber table |

### Key Implementation Notes
- `stamped_status` DB values: `"Y"` (stamped) and `"N"` (not stamped) — NOT `"stamped"/"empty"`
- `customer_auth_user_id` in subscriber table = `merchant_memberships.customer_profile_id`
- `redeemableSlotNos` = subscriber rows where `is_redeem_item?.toUpperCase() === 'Y'` — only these trigger PerksModal on click
- Cancel stamp: sets `stamped_status='N'`, nulls `stamped_date/by/method`
- Stamp card layout: `minHeight: 580` (not fixed `aspectRatio`), natural flex height

### RLS Policies (apply manually in Supabase Dashboard)
```sql
-- loyalty_program_stamp_subscriber SELECT + UPDATE
-- See: supabase/migrations/20260418000002_stamp_subscriber_read_policy.sql

-- membership_card_loyalty_programs SELECT
-- See: supabase/migrations/20260418000001_merchant_card_loyalty_programs_policy.sql
```

### Next Tasks
1. **Reset stamp card button** — reset ALL slots for a member back to `stamped_status='N'` (bulk update on `loyalty_program_stamp_subscriber` where `loyalty_program_stampcard_id` + `customer_auth_user_id`)
2. **Perks modal polish** — current implementation functional; may need additional fields or design refinements
