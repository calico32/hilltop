'use server'

import { UserSession } from '@/_api/types'
import { cache } from '@/_lib/cache'
import { caching, prisma } from '@/_lib/database'
import { age } from '@/_lib/format'
import { JobApplication, Role, User } from '@prisma/client'
import { Session, decrypt } from 'kiyoi'
import { cookies } from 'next/headers'

export const getUser = cache(
  'getUser',
  async (
    id?: string,
  ): Promise<(User & { applications: Pick<JobApplication, 'status'>[]; age: number }) | null> => {
    const session = await Session.get<UserSession>(cookies())
    if (!session.ok) return null

    if (!id) {
      const user = await prisma.user.findUnique({
        where: { id: session.value.userId },
        include: {
          _count: true,
          applications: {
            select: {
              status: true,
            },
          },
        },
        cacheStrategy: caching.user,
      })

      if (!user) return null
      const dob = await decrypt<string>(user.dob)
      prisma.redact(user, ['dob', 'password', 'taxId'])
      return {
        ...user,
        age: age(dob),
      }
    }

    if (session.value.role === Role.Applicant) return null

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: true,
        applications: {
          select: {
            status: true,
          },
        },
      },
      cacheStrategy: caching.user,
    })
    const dob = user ? await decrypt<string>(user?.dob) : null
    prisma.redact(user, ['dob', 'password', 'taxId'])

    if (!user) return null

    if (session.value.role === Role.Admin)
      return {
        ...user,
        age: age(dob!),
      }
    if (session.value.role === Role.Recruiter && user.role === Role.Applicant)
      return {
        ...user,
        age: age(dob!),
      }

    return null
  },
)

export const getUsers = cache('getUsers', async () => {
  const session = await Session.get<UserSession>(cookies())
  if (!session.ok) return null

  if (session.value.role !== Role.Admin) return null

  const users = await prisma.user.findMany({
    where: {
      role: { not: Role.Admin },
    },
    cacheStrategy: caching.user,
  })
  prisma.redact(users, ['dob', 'password', 'taxId'])
  return users
})

export const getSensitiveData = cache('getSensitiveData', async (id?: string) => {
  const session = await Session.get<UserSession>(cookies())
  if (!session.ok) return null

  if (!id) {
    const data = await prisma.user.findUnique({
      where: { id: session.value.userId },
      select: {
        id: true,
        dob: true,
        taxId: true,
      },
      cacheStrategy: caching.user,
    })
    if (!data) return null
    const taxId = await decrypt<string>(data.taxId)
    return {
      id: data.id,
      dob: await decrypt<string>(data.dob),
      taxId: `*****${taxId.slice(-4)}`,
    }
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      dob: true,
      taxId: true,
    },
    cacheStrategy: caching.user,
  })

  if (!user) return null

  if (session.value.userId !== user.id && session.value.role === Role.Applicant) return null

  if (
    session.value.role === Role.Admin ||
    (session.value.role === Role.Recruiter && user.role === Role.Applicant)
  ) {
    const taxId = await decrypt<string>(user.taxId)
    return { dob: await decrypt<string>(user.dob), taxId: `*****${taxId.slice(-4)}` }
  }

  return null
})
