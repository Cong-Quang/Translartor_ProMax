-- 1. Create profiles table
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  email text unique not null,
  full_name text,
  avatar_url text,
  website text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Create Policies
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- 4. Create a Trigger to auto-create profile on signup (Server-side handling)
-- This ensures that when a user signs up via Supabase Auth, a row is automatically created in public.profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, full_name)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'username', 
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
