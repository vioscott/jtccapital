-- =========================================
-- JTC Transactions Fee Column Patch
-- Run this in your Supabase SQL Editor
-- =========================================

-- Add 'fee' column to transactions table.
-- Used to store the withdrawal fee (10% of withdrawal amount)
-- and the trading fee (0.1% per trade).
alter table public.transactions
  add column if not exists fee numeric default 0;
