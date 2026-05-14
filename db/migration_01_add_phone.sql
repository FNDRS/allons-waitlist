-- Add optional phone column to waitlist table
-- Run in your Supabase project's SQL Editor.

alter table public.waitlist
  add column if not exists phone text;
