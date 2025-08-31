-- Create bulls table
create table if not exists public.bulls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  breed text,
  registration_number text,
  date_of_birth date,
  status text not null default 'active' check (status in ('active', 'retired', 'sold')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.bulls enable row level security;

-- RLS policies for bulls
create policy "bulls_select_own"
  on public.bulls for select
  using (auth.uid() = user_id);

create policy "bulls_insert_own"
  on public.bulls for insert
  with check (auth.uid() = user_id);

create policy "bulls_update_own"
  on public.bulls for update
  using (auth.uid() = user_id);

create policy "bulls_delete_own"
  on public.bulls for delete
  using (auth.uid() = user_id);

-- Create index for better performance
create index if not exists idx_bulls_user_id on public.bulls(user_id);
