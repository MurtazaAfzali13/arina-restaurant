// Centralized “order expiration” logic.
//
// We treat orders older than the TTL as expired only if they are not in a final status.
// This avoids deleting delivered/completed/cancelled history.

export const DEFAULT_ORDER_TTL_MINUTES = 30;
export const DEFAULT_ORDER_CLEANUP_HOURS = 24;

// Per requirements, only these statuses are exempt from auto-expiration.
// Any other status (including "delivered") can be marked "expired" after TTL.
const FINAL_ORDER_STATUSES = new Set(["completed", "cancelled"]);

export function getOrderTtlMinutes(): number {
  // Server: can use ORDER_TTL_MINUTES.
  // Client: only NEXT_PUBLIC_* is exposed, so use that fallback.
  const raw =
    process.env.ORDER_TTL_MINUTES ??
    process.env.NEXT_PUBLIC_ORDER_TTL_MINUTES ??
    "";
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_ORDER_TTL_MINUTES;
}

export function getOrderExpiryCutoffDate(now = new Date()): Date {
  const ttlMinutes = getOrderTtlMinutes();
  return new Date(now.getTime() - ttlMinutes * 60_000);
}

export function getOrderExpiryCutoffIso(now = new Date()): string {
  return getOrderExpiryCutoffDate(now).toISOString();
}

export function getOrderCleanupHours(): number {
  const raw =
    process.env.ORDER_CLEANUP_HOURS ??
    process.env.NEXT_PUBLIC_ORDER_CLEANUP_HOURS ??
    "";
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_ORDER_CLEANUP_HOURS;
}

export function getOrderCleanupCutoffDate(now = new Date()): Date {
  const hours = getOrderCleanupHours();
  return new Date(now.getTime() - hours * 60 * 60_000);
}

export function getOrderCleanupCutoffIso(now = new Date()): string {
  return getOrderCleanupCutoffDate(now).toISOString();
}

export function isOrderExpired(order: {
  created_at: string | null;
  status: string | null;
}): boolean {
  if (!order?.created_at) return false;
  const createdAtMs = new Date(order.created_at).getTime();
  if (!Number.isFinite(createdAtMs)) return false;

  const ttlMinutes = getOrderTtlMinutes();
  const cutoffMs = Date.now() - ttlMinutes * 60_000;

  const status = (order.status || "").toLowerCase();
  if (status === "expired") return true;
  if (FINAL_ORDER_STATUSES.has(status)) return false;

  return createdAtMs < cutoffMs;
}

