'use server'

import { ActionError, UserSession } from '@/_api/types'
import { prisma } from '@/_lib/database'
import { ApplicationStatus, JobApplication, Role } from '@prisma/client'
import { Result, Session } from 'kiyoi'
import { cookies } from 'next/headers'

export async function getApplicationStatus(
  applicationId: string,
): Promise<ApplicationStatus | null> {
  const session = await Session.get<UserSession>(cookies())
  if (!session.ok) return null

  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
  })

  if (!application) return null
  if (session.value.role === Role.Applicant && application.userId !== session.value.userId)
    return null

  return application.status
}

export async function setApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
): Result.Async<JobApplication, ActionError> {
  const session = await Session.get<UserSession>(cookies())
  if (!session.ok) return Result.error(ActionError.Unauthorized)

  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
  })

  if (!application) return Result.error(ActionError.NotFound)
  if (session.value.role === Role.Applicant) return Result.error(ActionError.Unauthorized)

  const updatedApplication = await prisma.jobApplication.update({
    where: { id: applicationId },
    data: {
      status,
    },
  })

  return Result.ok(updatedApplication)
}
