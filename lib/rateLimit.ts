// Required environment variables:
// - UPSTASH_REDIS_REST_URL
// - UPSTASH_REDIS_REST_TOKEN
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null = null;

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

export async function checkRateLimit(
  identifier: string
): Promise<{ allowed: boolean; remaining: number }> {
  const rateLimiter = getRatelimit();

  if (!rateLimiter) {
    return { allowed: true, remaining: 999 };
  }

  try {
    const { success, remaining } = await rateLimiter.limit(identifier);

    return {
      allowed: success,
      remaining,
    };
  } catch {
    return { allowed: true, remaining: 999 };
  }
}
