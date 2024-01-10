'use server'

import { FullApplication, applicationInclude } from '@/_api/applications/common'
import { ActionError, UserSession } from '@/_api/types'
import { prisma } from '@/_lib/database'
import { JobApplicationNote, Role } from '@prisma/client'
import { Result, Session } from 'kiyoi'
import { cookies } from 'next/headers'

export async function getApplicationNotes(
  applicationId: string,
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
  body: string,
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
  noteId: string,
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
