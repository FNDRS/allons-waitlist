export const WAITLIST_BASE_SUBSCRIBERS = 100;

export function toTotalSubscribers(dbCount: number) {
  return WAITLIST_BASE_SUBSCRIBERS + Math.max(0, dbCount);
}
