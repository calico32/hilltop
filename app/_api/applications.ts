'use server'

import { cache } from 'react'

import { UserSession } from '@/_api/types'
import { prisma } from '@/_lib/database'
import { Prisma, Role } from '@prisma/client'
import { Session } from 'kiyoi'
import { cookies } from 'next/headers'

export const getApplications = cache(async () => {
  const session = await Session.get<UserSession>(cookies())
  if (!session.ok) return null

  if (session.value.role !== Role.Applicant) {
    const applications = await prisma.jobApplication.findMany({
      include: {
        listing: true,
      },
    })
    return applications
  }

  const userId = session.value.userId
  const applications = await prisma.jobApplication.findMany({
    where: { userId },
    include: {
      listing: true,
    },
  })

  return applications
})

export const getApplication = cache(async (id: string) => {
  const session = await Session.get<UserSession>(cookies())
  if (!session.ok) return null

  const application = await prisma.jobApplication.findUnique({
    where: { id },
    include: {
      listing: true,
    },
  })

  if (
    !application ||
    application.userId !== session.value.userId ||
    session.value.role === Role.Applicant
  ) {
    return null
  }

  return application
})

export const searchApplications = cache(async (searchTerm: string) => {
  if (!searchTerm) return await getApplications()

  const session = await Session.get<UserSession>(cookies())
  if (!session.ok) return null

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
    include: {
      listing: true,
    },
  })

  return applications
})
