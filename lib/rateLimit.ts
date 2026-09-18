import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasUpstash = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = hasUpstash
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const limiters = {
  register: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 h") }) : null,
  login: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "10 m") }) : null,
  otp: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "10 m") }) : null,
};

export async function rateLimit(kind: keyof typeof limiters, key: string) {
  const limiter = limiters[kind];
  if (!limiter) return { success: true }; // not configured — allow (dev/test only)
  try {
    return await limiter.limit(key);
  } catch (err) {
    // Graceful degradation for invalid Upstash credentials in dev
    console.warn(`[rateLimit] Upstash error for ${kind}:${key}`, err);
    return { success: true };
  }
}
