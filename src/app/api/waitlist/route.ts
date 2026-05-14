import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { WAITLIST_BASE_SUBSCRIBERS } from "@/lib/waitlist-count";
import { getWaitlistTotals } from "@/lib/waitlist-count.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOURCE_RE = /^[a-z0-9][a-z0-9-_]{0,40}$/i;

export async function GET() {
  try {
    const totals = await getWaitlistTotals();
    return NextResponse.json({
      count: totals.dbCount,
      totalSubscribers: totals.totalSubscribers,
    });
  } catch (err) {
    console.error("[waitlist] count error", err);
    return NextResponse.json({
      count: 0,
      totalSubscribers: WAITLIST_BASE_SUBSCRIBERS,
    });
  }
}

export async function POST(req: NextRequest) {
  let body: { email?: unknown; phone?: unknown; source?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
  }

  const rawSource = typeof body.source === "string" ? body.source.trim() : "";
  const source = rawSource && SOURCE_RE.test(rawSource) ? rawSource.toLowerCase() : null;

  const phone =
    typeof body.phone === "string" && body.phone.trim().length > 0
      ? body.phone.trim().slice(0, 30)
      : null;

  const userAgent = req.headers.get("user-agent")?.slice(0, 500) ?? null;
  const referer = req.headers.get("referer")?.slice(0, 500) ?? null;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;

  const supabase = getSupabaseAdmin();
  const row = { email, phone, source, user_agent: userAgent, referer, ip };
  const { error } = await supabase.from("waitlist").insert(row as never);

  if (error) {
    if (error.code === "23505") {
      try {
        const totals = await getWaitlistTotals();
        return NextResponse.json({
          ok: true,
          duplicate: true,
          count: totals.dbCount,
          totalSubscribers: totals.totalSubscribers,
        });
      } catch (countErr) {
        console.error("[waitlist] duplicate count error", countErr);
        return NextResponse.json({
          ok: true,
          duplicate: true,
          count: 0,
          totalSubscribers: WAITLIST_BASE_SUBSCRIBERS,
        });
      }
    }
    console.error("[waitlist] insert error", error);
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        {
          error: "Insert failed",
          code: error.code,
          message: error.message,
          details: (error as unknown as { details?: string }).details,
          hint: (error as unknown as { hint?: string }).hint,
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: "No se pudo registrar. Inténtalo de nuevo." },
      { status: 500 },
    );
  }

  try {
    const totals = await getWaitlistTotals();
    return NextResponse.json({
      ok: true,
      count: totals.dbCount,
      totalSubscribers: totals.totalSubscribers,
    });
  } catch (countErr) {
    console.error("[waitlist] post count error", countErr);
    return NextResponse.json({
      ok: true,
      count: 0,
      totalSubscribers: WAITLIST_BASE_SUBSCRIBERS,
    });
  }
}
