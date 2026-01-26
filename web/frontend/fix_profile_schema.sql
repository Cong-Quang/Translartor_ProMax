-- Add missing columns to profiles table to support UserProfile page
alter table public.profiles 
add column if not exists website text,
add column if not exists avatar_url text,
add column if not exists updated_at timestamp with time zone;
