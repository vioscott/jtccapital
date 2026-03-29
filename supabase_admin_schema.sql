-- JTC management INC Admin Schema
-- 1. Add role to profiles
alter table public.profiles add column if not exists role text default 'user';

-- 2. Security function to check roles without recursion
-- Using SECURITY DEFINER bypasses RLS for the internal query
create or replace function public.get_role(user_id uuid)
returns text as $$
begin
  return (select role from public.profiles where id = user_id);
end;
$$ language plpgsql security definer;

-- 3. Update RLS policies to allow admins full access
-- Note: (public.get_role(auth.uid()) = 'admin') replaces the recursive subquery

-- Profiles
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select 
using (auth.uid() = id OR public.get_role(auth.uid()) = 'admin');

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update 
using (auth.uid() = id OR public.get_role(auth.uid()) = 'admin');

-- Wallets
drop policy if exists "Users can read own wallets" on public.wallets;
create policy "Users can read own wallets" on public.wallets for select 
using (auth.uid() = user_id OR public.get_role(auth.uid()) = 'admin');

drop policy if exists "Users can update own wallets" on public.wallets;
create policy "Users can update own wallets" on public.wallets for update 
using (auth.uid() = user_id OR public.get_role(auth.uid()) = 'admin');

-- Transactions
drop policy if exists "Users can read own transactions" on public.transactions;
create policy "Users can read own transactions" on public.transactions for select 
using (auth.uid() = user_id OR public.get_role(auth.uid()) = 'admin');

drop policy if exists "Users can update own transactions" on public.transactions;
create policy "Users can update own transactions" on public.transactions for update 
using (auth.uid() = user_id OR public.get_role(auth.uid()) = 'admin');

-- Trades
drop policy if exists "Users can read own trades" on public.trades;
create policy "Users can read own trades" on public.trades for select 
using (auth.uid() = user_id OR public.get_role(auth.uid()) = 'admin');

drop policy if exists "Users can update own trades" on public.trades;
create policy "Users can update own trades" on public.trades for update 
using (auth.uid() = user_id OR public.get_role(auth.uid()) = 'admin');

-- Investments
drop policy if exists "Users can read own investments" on public.investments;
create policy "Users can read own investments" on public.investments for select 
using (auth.uid() = user_id OR public.get_role(auth.uid()) = 'admin');

drop policy if exists "Users can update own investments" on public.investments;
create policy "Users can update own investments" on public.investments for update 
using (auth.uid() = user_id OR public.get_role(auth.uid()) = 'admin');

