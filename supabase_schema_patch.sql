-- JTC management INC Schema Patch: OIL Support & Investments
-- Add KYC verification column to profiles
alter table public.profiles add column if not exists kyc_verified boolean default false;

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
  roi_min numeric not null,
  roi_max numeric not null,
  duration integer not null,
  status text default 'active' not null, -- 'active', 'matured', 'cancelled'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  matures_at timestamp with time zone not null
);

alter table public.investments enable row level security;
create policy "Users can read own investments" on public.investments for select using (auth.uid() = user_id);
create policy "Users can insert own investments" on public.investments for insert with check (auth.uid() = user_id);

-- 3. Update existing users who don't have an OIL wallet yet
insert into public.wallets (user_id, asset, balance)
select id, 'OIL', 0
from public.profiles
on conflict (user_id, asset) do nothing;

