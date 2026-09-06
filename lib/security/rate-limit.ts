import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { securityRateLimits } from "@/db/schema";

export function requestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function checkRateLimit(scope: string, identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = Math.floor(now / windowMs);
  const key = `${scope}:${identifier}:${bucket}`.slice(0, 500);
  const expiresAt = new Date((bucket + 1) * windowMs);
  const [row] = await db.insert(securityRateLimits).values({ key, attempts: 1, expiresAt }).onConflictDoUpdate({
    target: securityRateLimits.key,
    set: { attempts: sql`${securityRateLimits.attempts} + 1`, expiresAt },
  }).returning({ attempts: securityRateLimits.attempts });
  return { allowed: (row?.attempts ?? limit + 1) <= limit, retryAfterSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)) };
}
