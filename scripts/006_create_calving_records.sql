-- Create calving records table
create table if not exists public.calving_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cow_id uuid not null references public.cows(id) on delete cascade,
  pregnancy_id uuid references public.pregnancies(id) on delete set null,
  calving_date date not null,
  calving_time time,
  difficulty text not null default 'easy' check (difficulty in ('easy', 'moderate', 'difficult', 'assisted')),
  calf_gender text check (calf_gender in ('male', 'female')),
  calf_weight_kg decimal(5,2),
  calf_status text not null default 'alive' check (calf_status in ('alive', 'stillborn', 'died_shortly_after')),
  calf_tag_number text,
  veterinary_assistance boolean default false,
  complications text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.calving_records enable row level security;

-- RLS policies for calving records
create policy "calving_records_select_own"
  on public.calving_records for select
  using (auth.uid() = user_id);

create policy "calving_records_insert_own"
  on public.calving_records for insert
  with check (auth.uid() = user_id);

create policy "calving_records_update_own"
  on public.calving_records for update
  using (auth.uid() = user_id);

create policy "calving_records_delete_own"
  on public.calving_records for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_calving_records_user_id on public.calving_records(user_id);
create index if not exists idx_calving_records_cow_id on public.calving_records(cow_id);
create index if not exists idx_calving_records_date on public.calving_records(calving_date);
