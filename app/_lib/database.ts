import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

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
