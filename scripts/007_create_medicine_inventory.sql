-- Create medicine inventory table
create table if not exists public.medicine_inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('antibiotic', 'vaccine', 'vitamin', 'hormone', 'dewormer', 'other')),
  manufacturer text,
  batch_number text,
  expiry_date date,
  quantity_remaining decimal(10,2) not null default 0,
  unit text not null default 'ml' check (unit in ('ml', 'tablets', 'doses', 'kg', 'g')),
  cost_per_unit decimal(10,2),
  storage_location text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.medicine_inventory enable row level security;

-- RLS policies for medicine inventory
create policy "medicine_inventory_select_own"
  on public.medicine_inventory for select
  using (auth.uid() = user_id);

create policy "medicine_inventory_insert_own"
  on public.medicine_inventory for insert
  with check (auth.uid() = user_id);

create policy "medicine_inventory_update_own"
  on public.medicine_inventory for update
  using (auth.uid() = user_id);

create policy "medicine_inventory_delete_own"
  on public.medicine_inventory for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_medicine_inventory_user_id on public.medicine_inventory(user_id);
create index if not exists idx_medicine_inventory_expiry on public.medicine_inventory(expiry_date);
