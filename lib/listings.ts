import { prisma } from '@/lib/database'
import { cache } from 'react'
import 'server-only'

const getListings = cache(async () => {
  const jobs = prisma.jobListing.findMany({
    include: {
      _count: true,
    },
  })
  return jobs
})
