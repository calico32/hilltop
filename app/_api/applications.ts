'use server'

import { cache } from 'react'

import { ActionError, UserSession } from '@/_api/types'
import { prisma } from '@/_lib/database'
import { sendEmail } from '@/_lib/email'
import { age } from '@/_lib/format'
import {
  ApplicationStatus,
  Department,
  JobApplication,
  JobApplicationNote,
  JobApplicationQuestion,
  JobListing,
  JobListingQuestion,
  Prisma,
  Role,
  Storage,
  User,
} from '@prisma/client'
import { Result, Session, decrypt } from 'kiyoi'
import { cookies } from 'next/headers'
import ApplicationRejected from '../../emails/ApplicationRejected'

export type FullApplication = JobApplication & {
  listing: JobListing & {
    department: Department
    _count: Prisma.JobListingCountOutputType
    questions: JobListingQuestion[]
  }
  questions: JobApplicationQuestion[]
  notes: (JobApplicationNote & {
    author: Pick<User, 'firstName' | 'lastName' | 'preferredName' | 'avatarId' | 'email'>
  })[]
  user: User & { age: number }
  reviewer?: Pick<User, 'firstName' | 'lastName' | 'preferredName' | 'avatarId' | 'email'> | null
  resume: Pick<Storage, 'name' | 'type' | 'size' | 'id'> | null
}

const userSelect = Prisma.validator<Prisma.UserSelect>()({
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
  notes: {
    include: {
      author: {
        select: userSelect,
      },
    },
  },
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
    select: userSelect,
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

export async function getApplicationNotes(
  applicationId: string
): Promise<FullApplication['notes']> {
  const session = await Session.get<UserSession>(cookies())
  if (!session.ok) return []

  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    include: {
      notes: applicationInclude.notes,
    },
  })

  if (!application) return []
  if (application.userId !== session.value.userId && session.value.role === Role.Applicant)
    return []

  return application.notes
}

export async function addApplicationNote(
  applicationId: string,
  body: string
): Result.Async<JobApplicationNote, ActionError> {
  const session = await Session.get<UserSession>(cookies())
  if (!session.ok) return Result.error(ActionError.Unauthorized)

  const userId = session.value.userId

  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
  })

  if (!application) return Result.error(ActionError.NotFound)
  if (application.userId !== userId && session.value.role === Role.Applicant)
    return Result.error(ActionError.Unauthorized)

  const note = await prisma.jobApplicationNote.create({
    data: {
      applicationId,
      authorId: userId,
      body,
    },
  })

  return Result.ok(note)
}

export async function deleteApplicationNote(
  noteId: string
): Result.Async<Pick<JobApplicationNote, 'id'>, ActionError> {
  const session = await Session.get<UserSession>(cookies())
  if (!session.ok) return Result.error(ActionError.Unauthorized)

  const note = await prisma.jobApplicationNote.findUnique({
    where: { id: noteId },
  })

  if (!note) return Result.error(ActionError.NotFound)
  if (note.authorId !== session.value.userId && session.value.role !== Role.Admin)
    return Result.error(ActionError.Unauthorized)

  await prisma.jobApplicationNote.delete({
    where: { id: noteId },
  })

  return Result.ok({ id: note.id })
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): Result.Async<JobApplication, ActionError> {
  const session = await Session.get<UserSession>(cookies())
  if (!session.ok) return Result.error(ActionError.Unauthorized)

  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
  })

  if (!application) return Result.error(ActionError.NotFound)
  if (session.value.role === Role.Applicant) return Result.error(ActionError.Unauthorized)

  if (status === ApplicationStatus.Submitted) {
    return Result.error(ActionError.BadRequest)
  }

  const updatedApplication = await prisma.jobApplication.update({
    where: { id: applicationId },
    data: {
      status,
    },
  })

  return Result.ok(updatedApplication)
}

export async function sendRejectionEmail(applicationId: string): Result.Async<void, ActionError> {
  const session = await Session.get<UserSession>(cookies())
  if (!session.ok) return Result.error(ActionError.Unauthorized)

  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    include: applicationInclude,
  })

  if (!application) return Result.error(ActionError.NotFound)
  if (session.value.role === Role.Applicant) return Result.error(ActionError.Unauthorized)

  if (application.status !== ApplicationStatus.Rejected) {
    return Result.error(ActionError.InvalidState)
  }

  await sendEmail(ApplicationRejected, {
    subject: `About your ${application.listing.title} application at Lantern Hill`,
    to: application.user.email,
    props: { application },
  })

  return Result.ok()
}
