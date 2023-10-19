import { ApplicationStatus, JobType, PayType, PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { encrypt } from 'kiyoi'
import { v5 as uuidv5 } from 'uuid'

const prisma = new PrismaClient()

const ns = '00000000-0000-0000-0000-000000000000'

const id = (name: string) => uuidv5(name, ns)

const bob = {
  id: id('bob'),
  firstName: 'Bob',
  lastName: 'Smith',
  email: 'b@b',
  password: await bcrypt.hash('password', 10),

  address1: '123 Main St',
  address2: 'Apt 1',
  city: 'Springfield',
  state: 'IL',
  zip: '12345',

  dob: await encrypt('1990-01-01'),
  taxId: await encrypt('123-45-6789'),

  phone: '5555555555',

  role: Role.Admin,
}

await prisma.user.upsert({
  where: { id: id('bob') },
  create: bob,
  update: bob,
})

const job1 = {
  id: id('job1'),
  title: 'Software Engineer',
  description: 'We are looking for a software engineer to join our team.',

  payMin: 100000,
  payMax: 150000,
  payType: PayType.Salary,

  positions: 2,
  schedule: 'M-F 9-5',
  type: JobType.FullTime,
  department: {
    connectOrCreate: {
      where: { id: id('department1') },
      create: {
        id: id('department1'),
        name: 'Engineering',
      },
    },
  },
}

await prisma.jobListing.upsert({
  where: { id: id('job1') },
  create: job1,
  update: job1,
})

const alice = {
  id: id('alice'),
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.org',
  password: await bcrypt.hash('password', 10),

  address1: '123 Main St',
  address2: 'Apt 1',
  city: 'Springfield',
  state: 'IL',
  zip: '12345',

  dob: await encrypt('1990-01-01'),
  taxId: await encrypt('123-45-6789'),

  phone: '5555555555',

  applications: {
    connectOrCreate: {
      where: { id: id('application1') },
      create: {
        id: id('application1'),
        listingId: id('job1'),
        status: ApplicationStatus.InReview,
      },
    },
  },
}

await prisma.user.upsert({
  where: { id: id('alice') },
  create: alice,
  update: alice,
})
