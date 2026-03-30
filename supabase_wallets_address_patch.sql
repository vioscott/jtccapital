-- =========================================
-- JTC Wallets Address Column Patch
-- Run this in your Supabase SQL Editor
-- =========================================

-- Add 'address' column to wallets table so admins can
-- set per-user, per-asset deposit addresses.
alter table public.wallets
  add column if not exists address text default null;

-- (Optional) If you want to pre-populate addresses for existing wallets,
-- you can do so here, e.g.:
-- update public.wallets set address = 'YOUR_BTC_ADDRESS' where asset = 'BTC';
