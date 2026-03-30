-- JTC management INC Admin Schema
-- 1. Add role to profiles
alter table public.profiles add column if not exists role text default 'user';

-- 2. Security function to check roles without recursion
-- Using SECURITY DEFINER bypasses RLS for the internal query
create or replace function public.get_role(user_id uuid)
returns text as $$
declare
  user_role text;
begin
  -- Disable RLS for this specific query to prevent recursion
  set local row_security = off;
  select role into user_role
  from public.profiles
  where id = user_id;
  return coalesce(user_role, 'user');
exception
  when others then
    return 'user';
end;
$$ language plpgsql security definer;

-- 3. Update RLS policies to allow admins full access
-- Note: (public.get_role(auth.uid()) = 'admin') replaces the recursive subquery

-- Profiles
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select 
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update 
using (auth.uid() = id);

-- Wallets
drop policy if exists "Users can read own wallets" on public.wallets;
create policy "Users can read own wallets" on public.wallets for select 
using (auth.uid() = user_id OR exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Users can update own wallets" on public.wallets;
create policy "Users can update own wallets" on public.wallets for update 
using (auth.uid() = user_id OR exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Transactions
drop policy if exists "Users can read own transactions" on public.transactions;
create policy "Users can read own transactions" on public.transactions for select
using (auth.uid() = user_id OR exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Users can update own transactions" on public.transactions;
create policy "Users can update own transactions" on public.transactions for update
using (auth.uid() = user_id OR exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Trades
drop policy if exists "Users can read own trades" on public.trades;
create policy "Users can read own trades" on public.trades for select 
using (auth.uid() = user_id OR exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Users can update own trades" on public.trades;
create policy "Users can update own trades" on public.trades for update 
using (auth.uid() = user_id OR exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Investments
drop policy if exists "Users can read own investments" on public.investments;
create policy "Users can read own investments" on public.investments for select 
using (auth.uid() = user_id OR exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Users can update own investments" on public.investments;
create policy "Users can update own investments" on public.investments for update 
using (auth.uid() = user_id OR exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

