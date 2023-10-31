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

export const getListing = cache(async (id: string) => {
  const job = prisma.jobListing.findUnique({
    where: {
      id,
    },
    include: {
      _count: true,
      department: true,
    },
  })
  return job
})
