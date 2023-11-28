import { PrismaClient } from '@prisma/client'
import { PrismaCacheStrategy, withAccelerate } from '@prisma/extension-accelerate'

export const prisma = new PrismaClient().$extends(withAccelerate()).$extends({
  client: {
    redact<Obj extends { [key: string]: unknown }, Key extends keyof Obj>(
      obj: Obj | null | undefined | Obj[],
      keys: Key[]
    ): void {
      if (!obj) return

      if (Array.isArray(obj)) {
        for (const item of obj) {
          for (const key of keys) {
            delete item[key]
          }
        }
        return
      }

      for (const key of keys) {
        delete obj[key]
      }
    },
  },
})

const ONE_MINUTE = 60
const ONE_HOUR = 60 * ONE_MINUTE
const ONE_DAY = 24 * ONE_HOUR

export const caching = {
  user: {
    ttl: ONE_MINUTE,
    swr: ONE_MINUTE,
  },
  department: {
    ttl: ONE_DAY,
    swr: ONE_DAY,
  },
  jobListing: {
    ttl: ONE_HOUR,
    swr: ONE_HOUR,
  },
  jobListingQuestion: {
    ttl: ONE_DAY,
    swr: ONE_DAY,
  },
  jobApplication: {
    ttl: ONE_HOUR,
    swr: ONE_HOUR,
  },
  jobApplicationQuestion: {
    ttl: ONE_DAY,
    swr: ONE_DAY,
  },
  passkey: null,
  passkeyChallenge: null,
  storage: {
    ttl: ONE_DAY,
    swr: ONE_DAY,
  },
} satisfies Partial<Record<keyof PrismaClient, PrismaCacheStrategy['cacheStrategy'] | null>>
