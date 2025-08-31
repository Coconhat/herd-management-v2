-- Create reminders table
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cow_id uuid references public.cows(id) on delete cascade,
  title text not null,
  description text,
  reminder_date date not null,
  reminder_type text not null check (reminder_type in ('breeding', 'pregnancy_check', 'calving', 'vaccination', 'deworming', 'hoof_trimming', 'general')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  completed boolean default false,
  completed_date date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.reminders enable row level security;

-- RLS policies for reminders
create policy "reminders_select_own"
  on public.reminders for select
  using (auth.uid() = user_id);

create policy "reminders_insert_own"
  on public.reminders for insert
  with check (auth.uid() = user_id);

create policy "reminders_update_own"
  on public.reminders for update
  using (auth.uid() = user_id);

create policy "reminders_delete_own"
  on public.reminders for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_reminders_user_id on public.reminders(user_id);
create index if not exists idx_reminders_date on public.reminders(reminder_date);
create index if not exists idx_reminders_completed on public.reminders(completed);
