import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOURCE_RE = /^[a-z0-9][a-z0-9-_]{0,40}$/i;

export async function POST(req: NextRequest) {
  let body: { email?: unknown; source?: unknown };
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

  const userAgent = req.headers.get("user-agent")?.slice(0, 500) ?? null;
  const referer = req.headers.get("referer")?.slice(0, 500) ?? null;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;

  const supabase = getSupabaseAdmin();
  const row = {
    email,
    source,
    user_agent: userAgent,
    referer,
    ip,
  };
  const { error } = await supabase.from("waitlist").insert(row as never);

  if (error) {
    // Treat duplicate gracefully — user is already on the list.
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    console.error("[waitlist] insert error", error);
    return NextResponse.json(
      { error: "No se pudo registrar. Inténtalo de nuevo." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
