-- =========================================
-- JTC RLS Redesign Script
-- Run this completely in your Supabase SQL Editor
-- This script fixes infinite recursion bugs and establishes clean admin separation.
-- =========================================

-- 1. Create a secure admin checker function to prevent infinite recursion
create or replace function public.is_admin()
returns boolean as $$
declare
  is_adm boolean;
begin
  select exists(
    select 1 from public.profiles 
    where id = auth.uid() and role = 'admin'
  ) into is_adm;
  return is_adm;
end;
$$ language plpgsql security definer set search_path = public;

-- 2. Enable RLS on all main tables (just to be safe)
alter table if exists public.profiles enable row level security;
alter table if exists public.wallets enable row level security;
alter table if exists public.transactions enable row level security;
alter table if exists public.trades enable row level security;
alter table if exists public.investments enable row level security;
alter table if exists public.default_wallet_addresses enable row level security;

-- 3. Drop all existing policies from these tables to start with a clean slate
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN ('profiles', 'wallets', 'transactions', 'trades', 'investments', 'default_wallet_addresses')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- 4. Apply clean, properly isolated policies

-- ====================
-- PROFILES
-- ====================
create policy "Users can read own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Admins can manage all profiles" 
  on public.profiles for all 
  using (public.is_admin());

-- ====================
-- WALLETS
-- ====================
create policy "Users can read own wallets" 
  on public.wallets for select 
  using (auth.uid() = user_id);

create policy "Users can insert own wallets" 
  on public.wallets for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own wallets" 
  on public.wallets for update 
  using (auth.uid() = user_id);

create policy "Admins can manage all wallets" 
  on public.wallets for all 
  using (public.is_admin());

-- ====================
-- TRANSACTIONS
-- ====================
create policy "Users can read own transactions" 
  on public.transactions for select 
  using (auth.uid() = user_id);

create policy "Users can insert own transactions" 
  on public.transactions for insert 
  with check (auth.uid() = user_id);

create policy "Admins can manage all transactions" 
  on public.transactions for all 
  using (public.is_admin());

-- ====================
-- TRADES
-- ====================
create policy "Users can read own trades" 
  on public.trades for select 
  using (auth.uid() = user_id);

create policy "Users can insert own trades" 
  on public.trades for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own trades" 
  on public.trades for update 
  using (auth.uid() = user_id);

create policy "Admins can manage all trades" 
  on public.trades for all 
  using (public.is_admin());

-- ====================
-- INVESTMENTS
-- ====================
create policy "Users can read own investments" 
  on public.investments for select 
  using (auth.uid() = user_id);

create policy "Users can insert own investments" 
  on public.investments for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own investments" 
  on public.investments for update 
  using (auth.uid() = user_id);

create policy "Admins can manage all investments" 
  on public.investments for all 
  using (public.is_admin());

-- ====================
-- DEFAULT WALLET ADDRESSES
-- ====================
create policy "Users can read default addresses"
  on public.default_wallet_addresses for select
  using (true);

create policy "Admins can manage default addresses" 
  on public.default_wallet_addresses for all 
  using (public.is_admin());
