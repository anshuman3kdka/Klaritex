// Required environment variables:
// - UPSTASH_REDIS_REST_URL
// - UPSTASH_REDIS_REST_TOKEN
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
});

export async function checkRateLimit(
  identifier: string
): Promise<{ allowed: boolean; remaining: number }> {
  const { success, remaining } = await ratelimit.limit(identifier);

  return {
    allowed: success,
    remaining,
  };
}
