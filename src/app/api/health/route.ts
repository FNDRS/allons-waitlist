import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, unknown> = {};

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  checks.hasUrl = !!url;
  checks.hasKey = !!key;
  checks.url = url;

  if (!url || !key) {
    return NextResponse.json(
      { status: "error", message: "Missing env vars", checks },
      { status: 500 },
    );
  }

  // 1. Direct HTTP call to PostgREST (bypass supabase-js)
  try {
    const pgRes = await fetch(`${url}/rest/v1/waitlist?limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
    });
    checks.pgStatus = pgRes.status;
    checks.pgHeaders = Object.fromEntries(pgRes.headers.entries());

    if (!pgRes.ok) {
      const body = await pgRes.text();
      checks.pgBody = body;
    } else {
      const data = await pgRes.json();
      checks.pgData = data;
    }
  } catch (err) {
    checks.pgError = String(err);
  }

  // 2. Try supabase-js client
  try {
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    if (error) {
      checks.supabaseError = {
        code: error.code,
        message: error.message,
        details: (error as unknown as { details?: string }).details,
        hint: (error as unknown as { hint?: string }).hint,
      };
    } else {
      checks.rowCount = count ?? 0;
    }
  } catch (err) {
    checks.supabaseException = String(err);
  }

  // 3. Check Supabase meta/OpenAPI to see exposed tables
  try {
    const specRes = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/openapi+json",
      },
    });
    if (specRes.ok) {
      const spec = await specRes.json();
      checks.exposedTables = Object.keys(spec.paths || {}).filter((p: string) =>
        p.startsWith("/waitlist"),
      );
    } else {
      checks.specStatus = specRes.status;
    }
  } catch (err) {
    checks.specError = String(err);
  }

  const ok = !checks.supabaseError && !checks.pgError && checks.pgStatus === 200;

  return NextResponse.json(
    { status: ok ? "ok" : "error", checks },
    { status: ok ? 200 : 500 },
  );
}
