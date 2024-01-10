'use server'

import { applicationInclude } from '@/_api/applications/common'
import { ActionError, UserSession } from '@/_api/types'
import { prisma } from '@/_lib/database'
import { sendEmail } from '@/_lib/email'
import { ApplicationStatus, Role } from '@prisma/client'
import { Result, Session } from 'kiyoi'
import { cookies } from 'next/headers'
import ApplicationRejected from '../../../emails/ApplicationRejected'

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
