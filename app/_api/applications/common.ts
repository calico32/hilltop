import {
  Department,
  JobApplication,
  JobApplicationNote,
  JobApplicationQuestion,
  JobListing,
  JobListingQuestion,
  Prisma,
  User,
} from '@prisma/client'

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
