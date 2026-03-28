-- =========================================
-- JTC Admin RLS Patch
-- Run this in your Supabase SQL Editor
-- =========================================

-- Allow admins to read ALL transactions (fix for admin transactions page)
create policy "Admins can read all transactions"
  on public.transactions for select
  using (public.get_role(auth.uid()) = 'admin');

-- Allow admins to update (approve/reject) ALL transactions
create policy "Admins can update all transactions"
  on public.transactions for update
  using (public.get_role(auth.uid()) = 'admin');

-- Allow admins to read ALL wallets (needed for user management)
create policy "Admins can read all wallets"
  on public.wallets for select
  using (public.get_role(auth.uid()) = 'admin');

-- Allow admins to update (edit balances) ALL wallets
create policy "Admins can update all wallets"
  on public.wallets for update
  using (public.get_role(auth.uid()) = 'admin');
