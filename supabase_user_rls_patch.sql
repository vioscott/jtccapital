-- =========================================
-- Ensure users can read their own data
-- Run this in your Supabase SQL Editor
-- =========================================

-- Enable RLS just in case
alter table public.transactions enable row level security;
alter table public.wallets enable row level security;
alter table public.trades enable row level security;

-- Drop existing policies if they exist (to avoid duplicates)
drop policy if exists "Users can read own transactions" on public.transactions;
drop policy if exists "Users can insert own transactions" on public.transactions;
drop policy if exists "Users can read own wallets" on public.wallets;
drop policy if exists "Users can read own trades" on public.trades;

-- Create policies for transactions
create policy "Users can read own transactions" 
  on public.transactions for select 
  using (auth.uid() = user_id);

create policy "Users can insert own transactions" 
  on public.transactions for insert 
  with check (auth.uid() = user_id);

-- Create policies for wallets
create policy "Users can read own wallets" 
  on public.wallets for select 
  using (auth.uid() = user_id);

-- Create policies for trades
create policy "Users can read own trades" 
  on public.trades for select 
  using (auth.uid() = user_id);
