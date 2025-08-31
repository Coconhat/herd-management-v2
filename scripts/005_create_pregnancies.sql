-- Create pregnancies table
create table if not exists public.pregnancies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cow_id uuid not null references public.cows(id) on delete cascade,
  breeding_record_id uuid references public.breeding_records(id) on delete set null,
  conception_date date not null,
  expected_calving_date date not null,
  actual_calving_date date,
  pregnancy_status text not null default 'confirmed' check (pregnancy_status in ('confirmed', 'completed', 'lost')),
  veterinary_checks jsonb default '[]'::jsonb, -- Array of check dates and notes
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.pregnancies enable row level security;

-- RLS policies for pregnancies
create policy "pregnancies_select_own"
  on public.pregnancies for select
  using (auth.uid() = user_id);

create policy "pregnancies_insert_own"
  on public.pregnancies for insert
  with check (auth.uid() = user_id);

create policy "pregnancies_update_own"
  on public.pregnancies for update
  using (auth.uid() = user_id);

create policy "pregnancies_delete_own"
  on public.pregnancies for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_pregnancies_user_id on public.pregnancies(user_id);
create index if not exists idx_pregnancies_cow_id on public.pregnancies(cow_id);
create index if not exists idx_pregnancies_expected_date on public.pregnancies(expected_calving_date);
