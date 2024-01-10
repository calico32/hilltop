'use server'

import { FullApplication, applicationInclude } from '@/_api/applications/common'
import { getApplications } from '@/_api/applications/get'
import { UserSession } from '@/_api/types'
import { prisma } from '@/_lib/database'
import { age } from '@/_lib/format'
import { ApplicationStatus, Prisma, Role, User } from '@prisma/client'
import { Session, decrypt } from 'kiyoi'
import { cookies } from 'next/headers'

export interface SearchApplicationQuery {
  search?: string
  jobId?: string
  applicantId?: string
  status?: ApplicationStatus[]
}

export async function searchApplications(
  query: SearchApplicationQuery,
): Promise<FullApplication[]> {
  if (Object.keys(query).length === 0 || Object.values(query).every((v) => !v))
    return await getApplications()

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
      listing: {},
    },
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
