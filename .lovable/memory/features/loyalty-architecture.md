---
name: Loyalty program architecture
description: Master table pattern — loyalty_program_master is central source for Available Programs, membership_card_loyalty_programs is linking/holding table only
type: feature
---
- loyalty_program_master = centralized master reference for all merchant loyalty programs
- Source tables: loyalty_program_stamp/point/discount/voucher/contest/event/coupon/referral
- membership_card_loyalty_programs = holding/linking table for attached programs only
- Available Programs → read from loyalty_program_master (NOT from linking table)
- Linked Programs → read from membership_card_loyalty_programs
- Duplicate error message: "This Program Already add In This Membership Card"
- membership_card_loyalty_programs has linked_at column
- Soft delete pattern: is_deleted + deleted_at on master table
