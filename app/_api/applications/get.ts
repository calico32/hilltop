'use server'

import { cache } from 'react'

import { FullApplication, applicationInclude } from '@/_api/applications/common'
import { UserSession } from '@/_api/types'
import { prisma } from '@/_lib/database'
import { age } from '@/_lib/format'
import { Role, User } from '@prisma/client'
import { Session, decrypt } from 'kiyoi'
import { cookies } from 'next/headers'

export const getApplications = cache(async (): Promise<FullApplication[]> => {
  const session = await Session.get<UserSession>(cookies())
  if (!session.ok) return []

  if (session.value.role !== Role.Applicant) {
    const applications = await prisma.jobApplication.findMany({
      include: applicationInclude,
    })
    const users = await Promise.all(
      applications.map(async (a) => {
        ;(a.user as FullApplication['user']).age = age(await decrypt<string>(a.user.dob))
        prisma.redact(a.user, ['taxId', 'password', 'dob'])
        return a.user as User & { age: number }
      }),
    )

    return applications.map((a, i) => ({ ...a, user: users[i] }))
  }

  const userId = session.value.userId
  const applications = await prisma.jobApplication.findMany({
    where: { userId },
    include: applicationInclude,
  })

  const users = await Promise.all(
    applications.map(async (a) => {
      ;(a.user as FullApplication['user']).age = age(await decrypt<string>(a.user.dob))
      prisma.redact(a.user, ['taxId', 'password', 'dob'])
      return a.user as User & { age: number }
    }),
  )

  return applications.map((a, i) => ({ ...a, user: users[i] }))
})

type ApplicationQuery = string | { listingId: string; userId: string }

export const getApplication = cache(
  async (query: ApplicationQuery): Promise<FullApplication | null> => {
    const session = await Session.get<UserSession>(cookies())
    if (!session.ok) return null

    const application = await prisma.jobApplication.findUnique({
      where: typeof query === 'string' ? { id: query } : { listingId_userId: query },
      include: applicationInclude,
      cacheStrategy: {
        ttl: 60 * 60,
        swr: 60 * 60,
      },
    })

    const dob = application ? await decrypt<string>(application?.user.dob) : null

    prisma.redact(application?.user, ['taxId', 'password', 'dob'])

    if (
      !application ||
      (application.userId !== session.value.userId && session.value.role === Role.Applicant)
    ) {
      return null
    }

    return {
      ...application,
      user: {
        ...application.user,
        age: age(dob!),
      },
    }
  },
)
