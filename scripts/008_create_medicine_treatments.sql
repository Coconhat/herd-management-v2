-- Create medicine treatments table
create table if not exists public.medicine_treatments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cow_id uuid not null references public.cows(id) on delete cascade,
  medicine_id uuid not null references public.medicine_inventory(id) on delete cascade,
  treatment_date date not null,
  dosage decimal(10,2) not null,
  unit text not null,
  reason text not null,
  withdrawal_period_days integer default 0,
  withdrawal_end_date date,
  administered_by text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.medicine_treatments enable row level security;

-- RLS policies for medicine treatments
create policy "medicine_treatments_select_own"
  on public.medicine_treatments for select
  using (auth.uid() = user_id);

create policy "medicine_treatments_insert_own"
  on public.medicine_treatments for insert
  with check (auth.uid() = user_id);

create policy "medicine_treatments_update_own"
  on public.medicine_treatments for update
  using (auth.uid() = user_id);

create policy "medicine_treatments_delete_own"
  on public.medicine_treatments for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_medicine_treatments_user_id on public.medicine_treatments(user_id);
create index if not exists idx_medicine_treatments_cow_id on public.medicine_treatments(cow_id);
create index if not exists idx_medicine_treatments_date on public.medicine_treatments(treatment_date);
