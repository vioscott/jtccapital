
-- Extended user data linked to auth.users
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  tier integer default 1, -- 1=Standard, 2=Gold, 3=Platinum
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Trigger to create profile on signup
create function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. WALLETS TABLE
-- Tracks asset balances per user (BTC, ETH, USDT, GOLD)
create table public.wallets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  asset text not null, -- 'BTC', 'ETH', 'USDT', 'GOLD'
  balance numeric default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, asset)
);

alter table public.wallets enable row level security;
create policy "Users can read own wallets" on public.wallets for select using (auth.uid() = user_id);
-- Only admins/backend should technically update wallets directly, but for MVP frontend execution:
create policy "Users can update own wallets" on public.wallets for update using (auth.uid() = user_id);
create policy "Users can insert own wallets" on public.wallets for insert with check (auth.uid() = user_id);

-- Trigger to seed empty wallets for a new user
create function public.seed_user_wallets() returns trigger as $$
begin
  insert into public.wallets (user_id, asset, balance) values
    (new.id, 'BTC', 0),
    (new.id, 'ETH', 0),
    (new.id, 'USDT', 0),
    (new.id, 'GOLD', 0);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_wallets
  after insert on auth.users
  for each row execute procedure public.seed_user_wallets();


-- 3. TRANSACTIONS TABLE
-- Deposit & Withdrawal history
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null, -- 'deposit', 'withdrawal'
  asset text not null,
  amount numeric not null,
  status text default 'pending' not null, -- 'pending', 'completed', 'failed'
  tx_hash text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;
create policy "Users can read own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);


-- 4. TRADES TABLE
-- Trading positions (long/short tracking)
create table public.trades (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null, -- 'buy', 'sell'
  asset text not null,
  amount numeric not null,
  entry_price numeric not null,
  status text default 'open' not null, -- 'open', 'closed'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  closed_at timestamp with time zone
);

alter table public.trades enable row level security;
create policy "Users can read own trades" on public.trades for select using (auth.uid() = user_id);
create policy "Users can insert own trades" on public.trades for insert with check (auth.uid() = user_id);
create policy "Users can update own trades" on public.trades for update using (auth.uid() = user_id);

