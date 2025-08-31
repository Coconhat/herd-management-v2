-- Create breeding/insemination records table
create table if not exists public.breeding_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cow_id uuid not null references public.cows(id) on delete cascade,
  bull_id uuid references public.bulls(id) on delete set null,
  breeding_date date not null,
  breeding_type text not null check (breeding_type in ('natural', 'artificial_insemination')),
  semen_batch text, -- for AI records
  technician_name text, -- for AI records
  success boolean default null, -- null = unknown, true = confirmed pregnant, false = failed
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.breeding_records enable row level security;

-- RLS policies for breeding records
create policy "breeding_records_select_own"
  on public.breeding_records for select
  using (auth.uid() = user_id);

create policy "breeding_records_insert_own"
  on public.breeding_records for insert
  with check (auth.uid() = user_id);

create policy "breeding_records_update_own"
  on public.breeding_records for update
  using (auth.uid() = user_id);

create policy "breeding_records_delete_own"
  on public.breeding_records for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_breeding_records_user_id on public.breeding_records(user_id);
create index if not exists idx_breeding_records_cow_id on public.breeding_records(cow_id);
create index if not exists idx_breeding_records_date on public.breeding_records(breeding_date);
