---
name: Merchant quota system
description: Free tier defaults (1 card, 1 program), quota checks on create flows, monetization-ready tables for future Central Admin
type: feature
---
- Default free tier: 1 membership card, 1 loyalty program
- Counts: membership_cards (active, non-deleted) for cards; loyalty_program_master (non-deleted) for programs
- membership_card_loyalty_programs is NOT a monetization source
- merchant_quotas table holds per-merchant overrides with entitlement_status
- monetization_config table holds system-wide defaults (resource_type, default_free_quota, extra_unit_price, currency)
- merchant_quota_overrides table holds per-merchant pricing/quota overrides with effective dates
- Quota enforced in: AddMembershipCard, MembershipCardList, StampCardSetting, StampLoyaltyList, CreateLoyaltyProgram, LoyaltyProgramList
- Quota exceeded message: "Your current plan allows only 1 X. Please upgrade or contact admin to add more."
- No payment gateway or billing flow yet — monetization-ready only
- Future: Ayoha Central Admin sets merchant_quotas/overrides rows
- DB trigger sync_loyalty_program_master auto-inserts/updates loyalty_program_master on source table changes
- Soft delete on source table auto-syncs to loyalty_program_master via trigger
