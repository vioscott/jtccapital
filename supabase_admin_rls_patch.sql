-- =========================================
-- JTC Admin RLS Patch
-- Run this in your Supabase SQL Editor
-- =========================================

-- Allow admins to read ALL profiles (needed for user management)
drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Allow admins to update ALL profiles (needed for user management)
drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles"
  on public.profiles for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Allow admins to read ALL transactions (fix for admin transactions page)
drop policy if exists "Admins can read all transactions" on public.transactions;
create policy "Admins can read all transactions"
  on public.transactions for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Allow admins to update (approve/reject) ALL transactions
drop policy if exists "Admins can update all transactions" on public.transactions;
create policy "Admins can update all transactions"
  on public.transactions for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Allow admins to read ALL wallets (needed for user management)
drop policy if exists "Admins can read all wallets" on public.wallets;
create policy "Admins can read all wallets"
  on public.wallets for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Allow admins to update (edit balances) ALL wallets
drop policy if exists "Admins can update all wallets" on public.wallets;
create policy "Admins can update all wallets"
  on public.wallets for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

