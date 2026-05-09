-- Allons waitlist schema
-- Run once in your Supabase project's SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text,
  referer text,
  user_agent text,
  ip text,
  created_at timestamptz not null default now()
);

-- Case-insensitive uniqueness on email
create unique index if not exists waitlist_email_lower_uniq
  on public.waitlist (lower(email));

-- Quick filtering by source/QR location
create index if not exists waitlist_source_idx
  on public.waitlist (source);

-- Lock down the table: only the service_role (server) should write/read.
alter table public.waitlist enable row level security;

-- Note: no policy added intentionally — this means RLS blocks all access
-- from the anon/auth roles. The Next.js API route uses the service_role
-- key (which bypasses RLS) so writes still work.

-- Aggregated view of signups per source — handy for dashboard queries.
create or replace view public.waitlist_by_source as
  select
    coalesce(source, '(direct)') as source,
    count(*)::int as total,
    min(created_at) as first_seen_at,
    max(created_at) as last_seen_at
  from public.waitlist
  group by coalesce(source, '(direct)')
  order by total desc;
