-- Create cows table
create table if not exists public.cows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tag_number text not null,
  name text,
  breed text,
  date_of_birth date,
  status text not null default 'active' check (status in ('active', 'pregnant', 'dry', 'sold', 'deceased')),
  color text,
  weight_kg decimal(6,2),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, tag_number)
);

-- Enable RLS
alter table public.cows enable row level security;

-- RLS policies for cows
create policy "cows_select_own"
  on public.cows for select
  using (auth.uid() = user_id);

create policy "cows_insert_own"
  on public.cows for insert
  with check (auth.uid() = user_id);

create policy "cows_update_own"
  on public.cows for update
  using (auth.uid() = user_id);

create policy "cows_delete_own"
  on public.cows for delete
  using (auth.uid() = user_id);

-- Create index for better performance
create index if not exists idx_cows_user_id on public.cows(user_id);
create index if not exists idx_cows_status on public.cows(status);
