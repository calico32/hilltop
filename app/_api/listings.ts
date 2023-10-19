'use server'

import { cache } from 'react'

import { prisma } from '@/_lib/database'

export const getListings = cache(async () => {
  const jobs = prisma.jobListing.findMany({
    include: {
      _count: true,
    },
  })
  return jobs
})
