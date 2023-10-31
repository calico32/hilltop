'use server'

import { UserSession } from '@/_api/types'
import { cache } from '@/_lib/cache'
import { prisma } from '@/_lib/database'
import { Role } from '@prisma/client'
import { Session, decrypt } from 'kiyoi'
import { cookies } from 'next/headers'

/**
 * Retrieves a user from the database by their ID or the ID of the authenticated user's session.
 * @param id - The ID of the user to retrieve. If not provided, retrieves the authenticated user's session.
 * @returns The retrieved user object, or null if the user is not found or the session is invalid.
 */
export const getUser = cache('getUser', async (id?: string) => {
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
    })
    prisma.redact(user, ['dob', 'password', 'taxId'])
    return user
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
  })
  prisma.redact(user, ['dob', 'password', 'taxId'])

  if (!user) return null

  if (session.value.role === Role.Admin) return user
  if (session.value.role === Role.Recruiter && user.role === Role.Applicant) return user

  return null
})

export const getUsers = cache('getUsers', async () => {
  const session = await Session.get<UserSession>(cookies())
  if (!session.ok) return null

  if (session.value.role !== Role.Admin) return null

  const users = await prisma.user.findMany({
    where: {
      role: { not: Role.Admin },
    },
  })
  prisma.redact(users, ['dob', 'password', 'taxId'])
  return users
})

export const getSensitiveData = cache('getSensitiveData', async (id: string) => {
  const session = await Session.get<UserSession>(cookies())
  if (!session.ok) return null

  if (!id) {
    const data = await prisma.user.findUnique({
      where: { id: session.value.userId },
      select: {
        dob: true,
        taxId: true,
      },
    })
    if (!data) return null
    const taxId = await decrypt<string>(data.taxId)
    return {
      ...data,
      taxId: `*****${taxId.slice(-4)}`,
    }
  }

  if (session.value.role === Role.Applicant) return null

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      role: true,
      dob: true,
      taxId: true,
    },
  })

  if (!user) return null

  if (
    session.value.role === Role.Admin ||
    (session.value.role === Role.Recruiter && user.role === Role.Applicant)
  )
    return { dob: user.dob, taxId: user.taxId }

  return null
})
