import { Prisma } from '@prisma/client'
import 'server-only'

export const userSelect = Prisma.validator<Prisma.UserSelect>()({
  firstName: true,
  lastName: true,
  preferredName: true,
  avatarId: true,
  email: true,
})

export const applicationInclude = Prisma.validator<Prisma.JobApplicationInclude>()({
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
