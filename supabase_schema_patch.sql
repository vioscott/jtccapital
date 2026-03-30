-- JTC management INC Schema Patch: OIL Support & Investments
-- Add KYC verification column to profiles
alter table public.profiles add column if not exists kyc_verified boolean default false;
alter table public.profiles add column if not exists role text default 'user';

-- 1. Update the wallet seeding for NEW users to include OIL
create or replace function public.seed_user_wallets() returns trigger as $$
begin
  insert into public.wallets (user_id, asset, balance) values
    (new.id, 'BTC', 0),
    (new.id, 'ETH', 0),
    (new.id, 'USDT', 0),
    (new.id, 'GOLD', 0),
    (new.id, 'OIL', 0); -- Added OIL
  return new;
end;
$$ language plpgsql security definer;

-- 2. INVESTMENTS TABLE
-- Tracks user participation in managed plans
create table if not exists public.investments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_id text not null, -- 'p1', 'p2', etc.
  plan_name text not null,
  amount numeric not null,
  original_amount numeric not null default 0, -- Added for tracking original invested amount
  roi_min numeric not null,
  roi_max numeric not null,
  duration integer not null,
  status text default 'active' not null, -- 'active', 'matured', 'cancelled'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  matures_at timestamp with time zone not null
);

-- Update existing investments to set original_amount = amount
alter table public.investments add column if not exists original_amount numeric default 0;
update public.investments set original_amount = amount where original_amount = 0;

alter table public.investments enable row level security;
drop policy if exists "Users can read own investments" on public.investments;
drop policy if exists "Users can insert own investments" on public.investments;
create policy "Users can read own investments" on public.investments for select using (auth.uid() = user_id);
create policy "Users can insert own investments" on public.investments for insert with check (auth.uid() = user_id);

-- 3. Update existing users who don't have an OIL wallet yet
insert into public.wallets (user_id, asset, balance)
select id, 'OIL', 0
from public.profiles
on conflict (user_id, asset) do nothing;

-- Add admin policies for transactions
drop policy if exists "Admins can read all transactions" on public.transactions;
create policy "Admins can read all transactions" on public.transactions for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Add admin policies for profiles
drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles" on public.profiles for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

