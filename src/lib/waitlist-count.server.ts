import { getSupabaseAdmin } from "@/lib/supabase-server";
import { toTotalSubscribers } from "@/lib/waitlist-count";

export interface WaitlistTotals {
  dbCount: number;
  totalSubscribers: number;
}

export async function getWaitlistTotals(): Promise<WaitlistTotals> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  if (error) throw error;

  const dbCount = count ?? 0;
  return {
    dbCount,
    totalSubscribers: toTotalSubscribers(dbCount),
  };
}
