import {
  ApplicationStatus,
  JobType,
  PayType,
  Prisma,
  PrismaClient,
  QuestionType,
  Role,
} from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import fs from 'fs/promises'
import { encrypt } from 'kiyoi'
import { v5 as uuidv5 } from 'uuid'

const prisma = new PrismaClient()

await prisma.$connect()

await prisma.jobApplicationQuestion.deleteMany()
await prisma.jobListingQuestion.deleteMany()

const ns = '00000000-0000-0000-0000-000000000000'

const id = (name: string) => uuidv5(name, ns)

const bobAvatarData = await fs.readFile(__dirname + '/seed-assets/bob.png')
const bobAvatar = await prisma.storage.upsert({
  where: { id: id('bob-avatar') },
  create: {
    id: id('bob-avatar'),
    name: 'bob.png',
    type: 'image/png',
    data: bobAvatarData,
    size: bobAvatarData.length,
  },
  update: {
    name: 'bob.png',
    type: 'image/png',
    data: bobAvatarData,
    size: bobAvatarData.length,
  },
})

const bob = {
  id: id('bob'),
  firstName: 'Bob',
  lastName: 'Smith',
  email: 'bob@example.org',
  emailVerified: true,
  password: await bcrypt.hash('password', 10),
  avatarId: bobAvatar.id,

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

const jobs: Record<string, Prisma.JobListingCreateInput> = {
  softwareEngineer: {
    title: 'Software Engineer',
    description: 'We are looking for a software engineer to join our team.',
    benefits: ['Health insurance', 'Dental insurance', 'Vision insurance'],
    requirements: ["Bachelor's degree in Computer Science", '3+ years of experience'],
    responsibilities: ['Write code', 'Test code'],
    tags: ['Software', 'Engineering'],

    payMin: 100000,
    payMax: 150000,
    payType: PayType.Salary,

    positions: 2,
    schedule: 'M-F 9-5',
    type: JobType.FullTime,
    department: {
      connectOrCreate: {
        where: { id: id('engineering') },
        create: {
          id: id('engineering'),
          name: 'Engineering',
        },
      },
    },
  },
  projectManager: {
    title: 'Project Manager',
    description: 'We are looking for a project manager to assist our team.',
    benefits: ['Health insurance', 'Dental insurance', 'Vision insurance'],
    requirements: ['Familiarity with Microsoft Office products', '3+ years of experience'],
    responsibilities: ['Lead teams', 'Run meetings', 'Write reports'],
    tags: ['Management'],

    payMin: 100000,
    payMax: 150000,
    payType: PayType.Salary,

    positions: 2,
    schedule: 'M-F 9-5',
    type: JobType.FullTime,
    department: {
      connectOrCreate: {
        where: { id: id('management') },
        create: {
          id: id('management'),
          name: 'Management',
        },
      },
    },
  },
  socialMediaManager: {
    title: 'Social Media Manager',
    description: 'We are looking for a social media manager to curate our online presence.',
    benefits: ['Health insurance', 'Dental insurance', 'Vision insurance'],
    requirements: [
      "Bachelor's degree in Marketing, Journalism, Communications, or other relevant major",
      '3+ years of experience',
    ],
    responsibilities: ['Create posts', 'Public relations', 'Analyze data'],
    tags: ['Social media', 'Management'],

    payMin: 30000,
    payMax: 100000,
    payType: PayType.Salary,

    positions: 2,
    schedule: 'M-F 9-5',
    type: JobType.FullTime,
    department: {
      connectOrCreate: {
        where: { id: id('public relations') },
        create: {
          id: id('public relations'),
          name: 'Public Relations',
        },
      },
    },
  },
  registeredNurse: {
    title: 'Nurse',
    description: 'We are looking for a nurse to join our team.',
    benefits: ['Health insurance', 'Dental insurance', 'Vision insurance'],
    requirements: [
      'Degree/certification from an accredited nursing program',
      '3+ years of experience',
    ],
    responsibilities: ['Monitor patients', 'Treat patients'],
    tags: ['Nurse'],

    payMin: 100000,
    payMax: 150000,
    payType: PayType.Salary,

    positions: 2,
    schedule: 'M-F 9-5',
    type: JobType.FullTime,
    department: {
      connectOrCreate: {
        where: { id: id('health') },
        create: {
          id: id('health'),
          name: 'Health',
        },
      },
    },
  },
  nursingAssitant: {
    title: 'Nursing Assistant',
    description: 'We are looking for a nursing assistant to join our team.',
    benefits: ['Health insurance', 'Dental insurance', 'Vision insurance'],
    requirements: ['Certified nursing assistant certification', '3+ years of experience'],
    responsibilities: ['Monitor patients', 'Treat patients'],
    tags: ['Nurse', 'Assistant'],

    payMin: 40000,
    payMax: 70000,
    payType: PayType.Salary,

    positions: 2,
    schedule: 'M-F 9-5',
    type: JobType.FullTime,
    department: {
      connectOrCreate: {
        where: { id: id('health') },
        create: {
          id: id('health'),
          name: 'Health',
        },
      },
    },
  },
  dietaryAide: {
    title: 'Dietary Aide',
    description: 'We are looking for a dietery aide to join our team.',
    benefits: ['Health insurance', 'Dental insurance', 'Vision insurance'],
    requirements: ['16+ years old', 'Flexible schedule'],
    responsibilities: [
      'Provide dining services',
      'Prepare, stock, and serve meals and meal components',
    ],
    tags: ['Diet', 'Server', 'Aide', 'Assistant'],

    payMin: 16,
    payMax: 20,
    payType: PayType.Hourly,

    positions: 2,
    schedule: 'M-F 9-5',
    type: JobType.PartTime,
    department: {
      connectOrCreate: {
        where: { id: id('food service') },
        create: {
          id: id('food service'),
          name: 'Food Service',
        },
      },
    },
  },
  cook: {
    title: 'Cook',
    description: 'We are looking for a chef to join our team.',
    benefits: ['Health insurance', 'Dental insurance', 'Vision insurance'],
    requirements: [
      'Degree/certification from an accredited nursing program',
      '3+ years of experience',
    ],
    responsibilities: ['Prepare meals', 'Clean and sanitize kitchens'],
    tags: ['Cook'],

    payMin: 30000,
    payMax: 50000,
    payType: PayType.Salary,

    positions: 2,
    schedule: 'M-F 9-5',
    type: JobType.FullTime,
    department: {
      connectOrCreate: {
        where: { id: id('food service') },
        create: {
          id: id('food service'),
          name: 'Food Service',
        },
      },
    },
  },
  lifestyleActivitiesCoordinator: {
    title: 'Lifestyle/Activities Coordinator',
    description: 'We are looking for a lifestyle/activities coordinator to join our team.',
    benefits: ['Health insurance', 'Dental insurance', 'Vision insurance'],
    requirements: ['High school diploma/GED', '3+ years of experience'],
    responsibilities: [
      'Lead, plan, and prepare group and individual activities',
      'Collaborate with team members',
    ],
    tags: ['Activities', 'Manager', 'Lifestyle'],

    payMin: 20,
    payMax: 30,
    payType: PayType.Hourly,

    positions: 2,
    schedule: 'M-F 9-5',
    type: JobType.FullTime,
    department: {
      connectOrCreate: {
        where: { id: id('lifestyle') },
        create: {
          id: id('lifestyle'),
          name: 'Lifestyle',
        },
      },
    },
  },
  lifestyleActivitiesAssistant: {
    title: 'Lifestyle/Activities Assistant',
    description: 'We are looking for a lifestyle/activities assistant to join our team.',
    benefits: ['Health insurance', 'Dental insurance', 'Vision insurance'],
    requirements: ['High school diploma/GED', '3+ years of experience'],
    responsibilities: [
      'Assist with group and individual activities',
      'Collaborate with team members',
    ],
    tags: ['Activities', 'Lifestyle', 'Assistant', 'Aide'],

    payMin: 16,
    payMax: 20,
    payType: PayType.Hourly,

    positions: 2,
    schedule: 'M-F 9-5',
    type: JobType.FullTime,
    department: {
      connectOrCreate: {
        where: { id: id('health') },
        create: {
          id: id('health'),
          name: 'Health',
        },
      },
    },
  },
  secretary: {
    title: 'Secretary',
    description: 'We are looking for a secretary to join our team.',
    benefits: ['Health insurance', 'Dental insurance', 'Vision insurance'],
    requirements: ['Customer service skills', '3+ years of experience'],
    responsibilities: ['Take calls', 'Greet visitors', 'Schedule appointments', 'Manage calendar'],
    tags: ['Secretary'],

    payMin: 30000,
    payMax: 40000,
    payType: PayType.Salary,

    positions: 2,
    schedule: 'M-F 9-5',
    type: JobType.FullTime,
    department: {
      connectOrCreate: {
        where: { id: id('public relations') },
        create: {
          id: id('public relations'),
          name: 'Public Relations',
        },
      },
    },
  },
  housekeeper: {
    title: 'Housekeeper',
    description: 'We are looking for a housekeeper to join our team.',
    benefits: ['Health insurance', 'Dental insurance', 'Vision insurance'],
    requirements: ['3+ years of experience'],
    responsibilities: ['Clean and santitize areas'],
    tags: ['Housekeeper'],

    payMin: 20000,
    payMax: 50000,
    payType: PayType.Salary,

    positions: 2,
    schedule: 'M-F 9-5',
    type: JobType.FullTime,
    department: {
      connectOrCreate: {
        where: { id: id('health') },
        create: {
          id: id('health'),
          name: 'Health',
        },
      },
    },
  },
  socialWorker: {
    title: 'Social Worker',
    description: 'We are looking for a social worker to join our team.',
    benefits: ['Health insurance', 'Dental insurance', 'Vision insurance'],
    requirements: ['Licensed social worker', '3+ years of experience'],
    responsibilities: ['Group faciliation', 'Individual assessments'],
    tags: ['Social Worker'],

    payMin: 30000,
    payMax: 50000,
    payType: PayType.Salary,

    positions: 2,
    schedule: 'M-F 9-5',
    type: JobType.PartTime,
    department: {
      connectOrCreate: {
        where: { id: id('health') },
        create: {
          id: id('health'),
          name: 'Health',
        },
      },
    },
    questions: {
      createMany: {
        data: [
          {
            sequence: 1,
            question: 'What makes you a good fit for this position?',
            required: true,
            type: QuestionType.LongText,
          },
          {
            sequence: 2,
            question:
              "Do you hold a bachelor's degree in social work, psychology, or a related field? If so, please list the degree and institution.",
            required: false,
            type: QuestionType.ShortText,
          },
          {
            sequence: 3,
            question: 'What is your favorite food?',
            required: false,
            type: QuestionType.ShortText,
          },
        ],
      },
    },
  },
}

for (const [key, value] of Object.entries(jobs)) {
  await prisma.jobListing.upsert({
    where: { id: id(key) },
    create: {
      id: id(key),
      ...value,
    },
    update: value,
  })
}

const aliceAvatarData = await fs.readFile(__dirname + '/seed-assets/alice.png')
const aliceAvatar = await prisma.storage.upsert({
  where: { id: id('alice-avatar') },
  create: {
    id: id('alice-avatar'),
    name: 'alice.png',
    type: 'image/png',
    data: aliceAvatarData,
    size: aliceAvatarData.length,
  },
  update: {
    name: 'alice.png',
    type: 'image/png',
    data: aliceAvatarData,
    size: aliceAvatarData.length,
  },
})

const aliceResumeData = await fs.readFile(__dirname + '/seed-assets/resume.pdf')
const aliceResume = await prisma.storage.upsert({
  where: { id: id('alice-resume') },
  create: {
    id: id('alice-resume'),
    name: 'resume.pdf',
    type: 'application/pdf',
    data: aliceResumeData,
    size: aliceResumeData.length,
  },
  update: {
    name: 'resume.pdf',
    type: 'application/pdf',
    data: aliceResumeData,
    size: aliceResumeData.length,
  },
})
const alice = Prisma.validator<
  Prisma.XOR<Prisma.UserCreateInput, Prisma.UserUncheckedCreateInput>
>()({
  id: id('alice'),
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.org',
  password: await bcrypt.hash('password', 10),
  avatar: { connect: aliceAvatar },
  resume: { connect: aliceResume },
  address1: '123 Main St',
  address2: 'Apt 1',
  city: 'Springfield',
  state: 'IL',
  zip: '12345',
  bio: "Hey there! I'm Alice, and I'm a licensed social worker. I have 3 years of experience working with the elderly. I'm looking for a part-time position in the Springfield area. Looking forward to hearing from you!",

  dob: await encrypt('1990-01-01'),
  taxId: await encrypt('123-45-6789'),

  phone: '5555555555',
})

await prisma.user.upsert({
  where: { id: id('alice') },
  create: alice,
  update: alice,
})

const application = Prisma.validator<
  Prisma.XOR<Prisma.JobApplicationCreateInput, Prisma.JobApplicationUncheckedCreateInput>
>()({
  id: id('application1'),
  user: { connect: { id: alice.id } },
  listing: {
    connect: { id: id('socialWorker') },
  },
  status: ApplicationStatus.InReview,
  reviewer: { connect: bob },
  resume: { connect: aliceResume },
  questions: {
    createMany: {
      data: [
        {
          listingId: id('socialWorker'),
          sequence: 1,
          answer:
            'I believe I am a strong fit for this position due to my extensive experience working with diverse populations and my deep commitment to helping individuals overcome challenges. My previous roles as a social worker have allowed me to develop strong assessment, intervention, and advocacy skills, which I am eager to apply in this role. Additionally, my empathy, active listening, and cultural competency enable me to establish meaningful connections with clients and provide them with the support they need to improve their lives.',
        },
        {
          listingId: id('socialWorker'),
          sequence: 2,
          answer: "I hold a bachelor's degree in social work from the University of Illinois.",
        },
        {
          listingId: id('socialWorker'),
          sequence: 3,
          answer: 'Pizza!',
        },
      ],
    },
  },
})

await prisma.jobApplication.upsert({
  where: { id: application.id },
  create: application,
  update: application,
})
