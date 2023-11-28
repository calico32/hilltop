'use server'

import { cache } from 'react'

import { UserSession } from '@/_api/types'
import { prisma } from '@/_lib/database'
import { age } from '@/_lib/format'
import {
  Department,
  JobApplication,
  JobApplicationQuestion,
  JobListing,
  JobListingQuestion,
  Prisma,
  Role,
  Storage,
  User,
} from '@prisma/client'
import { Session, decrypt } from 'kiyoi'
import { cookies } from 'next/headers'

export type FullApplication = JobApplication & {
  listing: JobListing & {
    department: Department
    _count: Prisma.JobListingCountOutputType
    questions: JobListingQuestion[]
  }
  questions: JobApplicationQuestion[]
  user: User & { age: number }
  reviewer?: Pick<User, 'firstName' | 'lastName' | 'preferredName' | 'avatarId' | 'email'> | null
  resume: Pick<Storage, 'name' | 'type' | 'size' | 'id'> | null
}

const reviewerSelect = Prisma.validator<Prisma.UserSelect>()({
  firstName: true,
  lastName: true,
  preferredName: true,
  avatarId: true,
  email: true,
})

const applicationInclude = Prisma.validator<Prisma.JobApplicationInclude>()({
  listing: {
    include: {
      _count: true,
      department: true,
      questions: true,
    },
  },
  questions: true,
  resume: {
    select: {
      name: true,
      type: true,
      size: true,
      id: true,
    },
  },
  user: true,
  reviewer: {
    select: reviewerSelect,
  },
})

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
      })
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
    })
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
  }
)

export const searchApplications = cache(async (searchTerm: string): Promise<FullApplication[]> => {
  if (!searchTerm) return await getApplications()

  const session = await Session.get<UserSession>(cookies())
  if (!session.ok) return []

  let where: Prisma.JobApplicationWhereInput

  if (session.value.role === Role.Applicant) {
    where = Prisma.validator<Prisma.JobApplicationWhereInput>()({
      userId: session.value.userId,
    })
  } else {
    where = Prisma.validator<Prisma.UserWhereInput>()({})
  }

  const applications = await prisma.jobApplication.findMany({
    where: {
      ...where,
      listing: {
        title: { search: `${searchTerm.replaceAll(' ', '+')}` },
      },
    },
    include: applicationInclude,
  })

  const users = await Promise.all(
    applications.map(async (a) => {
      ;(a.user as FullApplication['user']).age = age(await decrypt<string>(a.user.dob))
      prisma.redact(a.user, ['taxId', 'password', 'dob'])
      return a.user as User & { age: number }
    })
  )

  return applications.map((a, i) => ({ ...a, user: users[i] }))
})
