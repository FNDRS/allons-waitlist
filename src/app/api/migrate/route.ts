import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  // Try calling the pg_reload_schema function (if it exists)
  try {
    const supabase = getSupabaseAdmin();
    const { data: reloadData, error: reloadError } = await supabase.rpc(
      "pg_reload_schema" as never,
    );
    results.reloadAttempt = { data: reloadData, error: reloadError };
  } catch (err) {
    results.reloadAttempt = { error: String(err) };
  }

  // Try to check if table exists via a raw PostgREST request
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

  // If table doesn't exist, try to create it via Supabase Management API
  if (results.pgStatus !== 200) {
    // We can't create tables via REST API without a management token.
    // But we can try to find the project ref from the URL and suggest a fix.
    const refMatch = url.match(/https:\/\/([^.]+)/);
    results.projectRef = refMatch ? refMatch[1] : null;
  }

  // Try to query information_schema via a direct HTTP request
  try {
    const infoRes = await fetch(`${url}/rest/v1/rpc/`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    results.rpcEndpoint = infoRes.status;
  } catch (err) {
    results.rpcEndpointError = String(err);
  }

  // Try to check the GraphQL endpoint
  try {
    const gqlRes = await fetch(`${url}/graphql/v1`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `{ __schema { types { name } } }`,
      }),
    });
    results.graphqlStatus = gqlRes.status;
    if (gqlRes.ok) {
      const gqlData = await gqlRes.json();
      results.graphqlTypes = gqlData?.data?.__schema?.types
        ?.filter((t: { name: string }) => t.name.startsWith("waitlist"))
        ?.map((t: { name: string }) => t.name);
    }
  } catch (err) {
    results.graphqlError = String(err);
  }

  const fixed = results.pgStatus === 200;

  return NextResponse.json(
    { status: fixed ? "ok" : "error", results },
    { status: fixed ? 200 : 500 },
  );
}
