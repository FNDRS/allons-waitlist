import { NextResponse } from "next/server";
import { WAITLIST_BASE_SUBSCRIBERS } from "@/lib/waitlist-count";
import { getWaitlistTotals } from "@/lib/waitlist-count.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const totals = await getWaitlistTotals();
    return NextResponse.json({
      count: totals.dbCount,
      totalSubscribers: totals.totalSubscribers,
    });
  } catch (err) {
    console.error("[waitlist] count endpoint error", err);
    return NextResponse.json({
      count: 0,
      totalSubscribers: WAITLIST_BASE_SUBSCRIBERS,
    });
  }
}
