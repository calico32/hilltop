'use server'

import { cache } from 'react'

import { UserSession } from '@/_api/types'
import { caching, prisma } from '@/_lib/database'
import { ListingStatus, Role } from '@prisma/client'
import { Session } from 'kiyoi'
import { cookies } from 'next/headers'

export const getListings = cache(async () => {
  const session = await Session.get<UserSession>(cookies())

  const user = session.ok
    ? await prisma.user.findUnique({
        where: {
          id: session.value.userId,
        },
      })
    : null

  const listings = await prisma.jobListing.findMany({
    where: {
      status: !user || user.role === Role.Applicant ? ListingStatus.Active : undefined,
    },
    include: {
      _count: true,
      department: true,
    },
    cacheStrategy: caching.jobListing,
  })

  return listings
})

export const getListing = cache(async (id: string) => {
  const session = await Session.get<UserSession>(cookies())

  const user = session.ok
    ? await prisma.user.findUnique({
        where: {
          id: session.value.userId,
        },
      })
    : null

  const listing = await prisma.jobListing.findUnique({
    where: {
      id,
      status: !user || user.role === Role.Applicant ? ListingStatus.Active : undefined,
    },
    include: {
      _count: true,
      department: true,
    },
  })
  return listing
})
