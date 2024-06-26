import { FullApplication } from '@/_api/applications/_types'

import { LinkButton } from '@/_components/Button'
import FileCard from '@/_components/FileCard'
import ModalAwareLink from '@/_components/ModalAwareLink'
import ModalTitleBar from '@/_components/ModalTitleBar'
import { avatar, displayName, formatPay, fullName, phoneNumber } from '@/_lib/format'
import { User } from '@prisma/client'
import clsx from 'clsx'
import { stripIndent } from 'common-tags'
import { formatDistanceToNow } from 'date-fns'
import {
  ArrowLeft,
  ArrowUpRightSquare,
  Cake,
  Mail,
  MapPin,
  Percent,
  Phone,
  UserSquare2,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import ApplicationNotes from './ApplicationNotes'
import ApplicationStatusSelect from './ApplicationStatusSelect'
import HiddenTaxId from './HiddenTaxId'

interface ReviewApplicationPageProps {
  modal?: boolean
  application: FullApplication
  currentUser: User
  sensitiveData: Pick<User, 'dob' | 'taxId'>
}

const interviewEmailTemplate = {
  subject: 'Interview with {currentUser} for your {listing} position',
  body: stripIndent`
    Dear {applicant},

    I hope this email finds you well. Thank you for applying for the {listing} position at Lantern Hill! We have reviewed your application and I would like to schedule an interview with you. Please let me know when you are available to meet this week or next. I look forward to hearing from you!

    Best,

    {currentUser}
    {role} at Lantern Hill
    {email}
    {phone}
  `,

  fill(text: string, variables: Record<string, unknown>): string {
    return text.replace(/{(\w+)}/g, (_, key) => variables[key]?.toString() || '')
  },

  create(to: string, variables: Record<string, unknown>): string {
    const params = new URLSearchParams()
    params.append('subject', this.fill(this.subject, variables))
    params.append('body', this.fill(this.body, variables))

    return `mailto:${to}?${params.toString()}`
  },
}

export default function ReviewApplicationPage({
  modal,
  application,
  currentUser,
  sensitiveData: applicantInfo,
}: ReviewApplicationPageProps): JSX.Element {
  const listing = application.listing
  const applicant = application.user

  const templateVariables = {
    applicant: fullName(applicant),
    listing: listing.title,
    currentUser: fullName(currentUser),
    role: currentUser.role,
    email: currentUser.email,
    phone: phoneNumber(currentUser.phone),
  }

  const submitted = new Date(application.created)
  const diff = Date.now() - submitted.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const showWarning = days > 7

  return (
    <>
      {modal ? (
        <ModalTitleBar>
          <h1 className="text-3xl">
            Review:{' '}
            <ModalAwareLink href={`/profile/${applicant.id}`} className="font-bold hover:underline">
              {fullName(applicant)}
            </ModalAwareLink>{' '}
            for{' '}
            <ModalAwareLink href={` /jobs/${listing.id}`} className="font-bold hover:underline">
              {listing.title}
            </ModalAwareLink>
          </h1>
        </ModalTitleBar>
      ) : (
        <>
          <Link href="/applications" className="flex w-max items-center gap-1 hover:underline">
            <ArrowLeft size={20} strokeWidth={1.5} />
            Back to Applications
          </Link>
          <h1 className="mb-6 text-3xl">
            Review:{' '}
            <Link href={`/profile/${applicant.id}`} className="font-bold hover:underline">
              {fullName(applicant)}
            </Link>{' '}
            for{' '}
            <Link href={`/jobs/${listing.id}`} className="font-bold hover:underline">
              {listing.title}
            </Link>
          </h1>
        </>
      )}

      <div className="mb-6 flex flex-col gap-2 text-sm text-gray-500 md:flex-row">
        <span>
          Submitted{' '}
          <span className={clsx(showWarning && 'text-red-500')}>
            {formatDistanceToNow(new Date(application.created), { addSuffix: true })}
          </span>
        </span>
        <span className="hidden md:block">·</span>
        <span>
          Last updated{' '}
          {formatDistanceToNow(new Date(application.updated), {
            addSuffix: true,
          })}
        </span>
      </div>

      <div>
        <Image
          src={avatar(applicant, { size: 300 })}
          alt=""
          width={128}
          height={128}
          className="float-right mb-2 ml-2 rounded-full"
        />

        <div className="mb-4 grid grid-rows-[repeat(auto,6)] md:grid-flow-col md:grid-cols-none md:grid-rows-[auto_auto]">
          <h2 className="mb-1 font-semibold md:mb-2">Applicant</h2>
          <div className="flex flex-col items-baseline gap-1 sm:flex-row sm:gap-8 md:flex-col md:items-start md:gap-1">
            <div className="flex items-baseline">
              <ModalAwareLink
                className="text-2xl font-bold hover:underline"
                href={`/profile/${applicant.id}`}
              >
                {fullName(applicant)}{' '}
                <ArrowUpRightSquare
                  className="inline-block align-middle"
                  size={20}
                  strokeWidth={1.5}
                />
              </ModalAwareLink>
              <span className="ml-2 text-gray-500">{applicant.age}</span>
            </div>
            <span className="flex items-center gap-2">
              <MapPin size={20} strokeWidth={1.5} />
              {applicant.city}, {applicant.state}
            </span>
          </div>

          <h2 className="mb-1 mt-4 font-semibold md:mb-2 md:mt-0">Personal Info</h2>
          <div className="flex flex-col items-baseline gap-1 sm:flex-row sm:gap-8 md:flex-col md:items-start md:gap-1">
            <span className="flex items-center gap-2">
              <Cake size={20} strokeWidth={1.5} />
              {new Date(applicantInfo.dob + 'Z').toUTCString().slice(5, 16)}
            </span>
            <span className="flex items-center gap-2">
              <Percent size={20} strokeWidth={1.5} />
              <HiddenTaxId taxId={applicantInfo.taxId} />
            </span>
          </div>

          <h2 className="mb-1 mt-4 font-semibold md:mb-2 md:mt-0">Contact Info</h2>
          <div className="flex flex-col items-baseline gap-1 sm:flex-row sm:gap-8 md:flex-col md:items-start md:gap-1">
            <a
              className="flex items-center gap-2 hover:underline"
              href={`mailto:${applicant.email}`}
              target="_blank"
            >
              <Mail size={20} strokeWidth={1.5} />
              {applicant.email}
            </a>
            <a
              className="flex items-center gap-2 hover:underline"
              href={`tel:${applicant.phone}`}
              target="_blank"
            >
              <Phone size={20} strokeWidth={1.5} />
              {phoneNumber(applicant.phone)}
            </a>
          </div>
        </div>
        <div className="italic text-gray-600">{applicant.bio}</div>

        {application.resume && (
          <div className="mt-4 flex flex-col items-start gap-2">
            <div className="">{displayName(applicant)} attached a resume to this application.</div>
            <FileCard file={application.resume} />
          </div>
        )}

        <div
          className="mb-4 mt-8 grid grid-rows-[repeat(auto,6)] md:grid-flow-col md:grid-cols-none md:grid-rows-[auto_auto]"
          style={{ gridTemplateRows: 'auto auto' }}
        >
          <h2 className="mb-1 font-semibold md:mb-2">Listing</h2>
          <div className="flex flex-col items-baseline gap-1 sm:flex-row sm:gap-8 md:flex-col md:items-start md:gap-1">
            <div className="flex items-baseline">
              <ModalAwareLink
                className="text-2xl font-bold hover:underline"
                href={`/jobs/${listing.id}`}
              >
                {listing.title}{' '}
                <ArrowUpRightSquare
                  className="inline-block align-middle"
                  size={20}
                  strokeWidth={1.5}
                />
              </ModalAwareLink>
            </div>
            <ModalAwareLink
              className="text-gray-500 hover:underline"
              href={`/applications?jobId=${listing.id}`}
            >
              {listing._count.applications} total application
              {listing._count.applications === 1 ? '' : 's'}{' '}
              <ArrowUpRightSquare
                className="inline-block align-middle"
                size={16}
                strokeWidth={1.5}
              />
            </ModalAwareLink>
          </div>

          <h2 className="mb-1 mt-4 font-semibold md:mb-2 md:mt-0">Job Requirements</h2>
          <ul className="ml-4 flex list-disc flex-col flex-wrap items-baseline gap-1 sm:flex-row sm:gap-10 md:flex-col md:items-start md:gap-1">
            {listing.requirements.map((req) => (
              <li key={req}>{req}</li>
            ))}
          </ul>

          <h2 className="mb-1 mt-4 font-semibold md:mb-2 md:mt-0">Listed Pay & Benefits</h2>
          <div className="flex flex-col items-baseline gap-1 sm:flex-row sm:gap-8 md:flex-col md:items-start md:gap-1">
            <div>
              {formatPay(
                listing.payType,
                listing.payMin.toLocaleString(),
                listing.payMax?.toLocaleString(),
                true,
              )}
            </div>
            {listing.benefits.map((b) => b.replaceAll(' insurance', '')).join(', ')}
          </div>
        </div>

        <div className="mb-8 italic text-gray-600">{listing.description}</div>

        <h2 className="mb-2 mt-4 text-2xl font-bold">Application Questions</h2>
        <ol className="ml-4 list-decimal">
          {listing.questions.map((q) => {
            const a = application.questions.find((a) => a.sequence === q.sequence)
            return (
              <div key={q.sequence} className="mb-6">
                <li className="prose mb-2 font-bold">
                  <p>{q.question}</p>
                </li>
                <div className="flex gap-3">
                  <Image
                    src={avatar(applicant)}
                    alt=""
                    width={24}
                    height={24}
                    className="float-left mt-px h-6 w-6 rounded-full"
                  />

                  {a ? (
                    <div className="prose max-w-none">
                      <p>{a.answer}</p>
                    </div>
                  ) : (
                    <span className="text-gray-400">
                      The applicant did not answer this question.
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </ol>

        <ApplicationNotes
          applicationId={application.id}
          currentUser={currentUser}
          initialData={application.notes}
        />

        <div className="mt-8">
          <h1 className="mb-4 text-2xl font-bold">Actions</h1>

          <ApplicationStatusSelect initialApplication={application} />

          <h2 className="mb-2 mt-4 text-xl font-semibold">Contact Applicant</h2>

          <div className="flex flex-wrap gap-4">
            <LinkButton
              outlined
              href={`mailto:${applicant.email}`}
              target="_blank"
              className="flex gap-2"
            >
              <Mail />
              Email {displayName(applicant)}
            </LinkButton>

            <LinkButton
              outlined
              href={interviewEmailTemplate.create(applicant.email, templateVariables)}
              target="_blank"
              className="flex gap-2"
            >
              <UserSquare2 />
              Schedule an Interview
            </LinkButton>
          </div>
        </div>
      </div>
    </>
  )
}
