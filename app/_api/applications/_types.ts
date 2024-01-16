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
