import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, unknown> = {};

  // 1. Env vars presence
  checks.hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  checks.hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!checks.hasUrl || !checks.hasKey) {
    return NextResponse.json(
      {
        status: "error",
        message: "Missing Supabase environment variables",
        checks,
      },
      { status: 500 },
    );
  }

  // 2. Supabase client & query
  try {
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    if (error) {
      checks.queryError = {
        code: error.code,
        message: error.message,
        details: (error as unknown as { details?: string }).details,
        hint: (error as unknown as { hint?: string }).hint,
      };
      return NextResponse.json(
        { status: "error", message: "Supabase query failed", checks },
        { status: 500 },
      );
    }

    checks.rowCount = count ?? 0;
    return NextResponse.json({ status: "ok", checks });
  } catch (err) {
    checks.exception = String(err);
    return NextResponse.json(
      { status: "error", message: "Supabase client error", checks },
      { status: 500 },
    );
  }
}
