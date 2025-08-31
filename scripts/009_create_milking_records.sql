-- Create milking records table
create table if not exists public.milking_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cow_id uuid not null references public.cows(id) on delete cascade,
  milking_date date not null,
  milking_time text not null check (milking_time in ('morning', 'afternoon', 'evening')),
  milk_yield_liters decimal(6,2) not null,
  milk_quality text default 'normal' check (milk_quality in ('normal', 'abnormal', 'bloody', 'watery')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, cow_id, milking_date, milking_time)
);

-- Enable RLS
alter table public.milking_records enable row level security;

-- RLS policies for milking records
create policy "milking_records_select_own"
  on public.milking_records for select
  using (auth.uid() = user_id);

create policy "milking_records_insert_own"
  on public.milking_records for insert
  with check (auth.uid() = user_id);

create policy "milking_records_update_own"
  on public.milking_records for update
  using (auth.uid() = user_id);

create policy "milking_records_delete_own"
  on public.milking_records for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_milking_records_user_id on public.milking_records(user_id);
create index if not exists idx_milking_records_cow_id on public.milking_records(cow_id);
create index if not exists idx_milking_records_date on public.milking_records(milking_date);
