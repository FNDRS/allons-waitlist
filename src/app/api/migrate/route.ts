import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCHEMA_SQL = `
create extension if not exists "pgcrypto";

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  phone text,
  source text,
  referer text,
  user_agent text,
  ip text,
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_lower_uniq
  on public.waitlist (lower(email));

create index if not exists waitlist_source_idx
  on public.waitlist (source);

alter table public.waitlist enable row level security;

create or replace view public.waitlist_by_source as
  select
    coalesce(source, '(direct)') as source,
    count(*)::int as total,
    min(created_at) as first_seen_at,
    max(created_at) as last_seen_at
  from public.waitlist
  group by coalesce(source, '(direct)')
  order by total desc;
`;

async function tryCreateTable(url: string, key: string): Promise<string | null> {
  // Try pg-api internal endpoint
  const endpoints = [
    { path: "/pg-api/v1/query", body: { query: SCHEMA_SQL } },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${url}${ep.path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: key,
          Authorization: `Bearer ${key}`,
          "X-Connection-Key": key,
        },
        body: JSON.stringify(ep.body),
      });
      if (res.ok) {
        const text = await res.text();
        return `pg-api ok: ${text.slice(0, 200)}`;
      }
      const text = await res.text();
      return `pg-api ${res.status}: ${text.slice(0, 300)}`;
    } catch {
      continue;
    }
  }

  return null;
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const results: Record<string, unknown> = {};

  if (!url || !key) {
    return NextResponse.json(
      { status: "error", message: "Missing env vars" },
      { status: 500 },
    );
  }

  // Try to create the table
  const createResult = await tryCreateTable(url, key);
  results.createAttempt = createResult;

  // Re-check if table now exists
  try {
    const pgRes = await fetch(`${url}/rest/v1/waitlist?limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
    });
    results.pgStatus = pgRes.status;
    if (!pgRes.ok) {
      results.pgBody = await pgRes.text();
    }
  } catch (err) {
    results.pgError = String(err);
  }

  const refMatch = url.match(/https:\/\/([^.]+)/);
  results.projectRef = refMatch ? refMatch[1] : null;

  const fixed = results.pgStatus === 200;

  if (!fixed) {
    results.manualSql = SCHEMA_SQL.trim();
    results.manualInstructions =
      `Ve a https://supabase.com/dashboard/project/${results.projectRef}/sql/new y pega el SQL de arriba.`;
  }

  return NextResponse.json(
    { status: fixed ? "ok" : "error", results },
    { status: fixed ? 200 : 500 },
  );
}
