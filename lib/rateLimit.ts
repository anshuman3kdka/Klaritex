// Required environment variables:
// - UPSTASH_REDIS_REST_URL
// - UPSTASH_REDIS_REST_TOKEN
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null = null;
const FALLBACK_WINDOW_MS = 60_000;
const FALLBACK_MAX_REQUESTS = 10;
const fallbackStore = new Map<string, number[]>();

function getRatelimit(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  if (!ratelimit) {
    const redis = new Redis({ url, token });
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
    });
  }

  return ratelimit;
}

function runInMemoryFallbackRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - FALLBACK_WINDOW_MS;
  const existingHits = fallbackStore.get(identifier) ?? [];
  const freshHits = existingHits.filter((timestamp) => timestamp > windowStart);

  if (freshHits.length >= FALLBACK_MAX_REQUESTS) {
    fallbackStore.set(identifier, freshHits);
    return { allowed: false, remaining: 0 };
  }

  freshHits.push(now);
  fallbackStore.set(identifier, freshHits);
  return { allowed: true, remaining: FALLBACK_MAX_REQUESTS - freshHits.length };
}

export async function checkRateLimit(
  identifier: string
): Promise<{ allowed: boolean; remaining: number }> {
  const rateLimiter = getRatelimit();

  if (!rateLimiter) {
    return runInMemoryFallbackRateLimit(identifier);
  }

  try {
    const { success, remaining } = await rateLimiter.limit(identifier);

    return {
      allowed: success,
      remaining,
    };
  } catch {
    return runInMemoryFallbackRateLimit(identifier);
  }
}
