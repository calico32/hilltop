import { cache } from 'react'
import 'server-only'
import { prisma } from './database'

export const getListings = cache(async () => {
  const jobs = prisma.jobListing.findMany({
    include: {
      _count: true,
    },
  })
  return jobs
})
