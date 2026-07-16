import {
  checkRateLimit,
  getRateLimitIdentifier,
  type RateLimitResult,
  resetRateLimitStateForTests,
} from '@/shared/lib/rate-limit'

export type { RateLimitResult }
export { checkRateLimit, getRateLimitIdentifier, resetRateLimitStateForTests }
