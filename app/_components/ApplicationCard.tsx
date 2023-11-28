import { FullApplication } from '@/_api/applications'
import { LinkButton } from '@/_components/Button'
import { applicationStatusColors, applicationStatuses } from '@/_lib/data'
import { avatar, fullName } from '@/_lib/format'
import { truncate } from '@/_util/string'
import { Role, User } from '@prisma/client'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'

interface ApplicationCardProps {
  application: FullApplication
  currentUser: User | null | undefined
}

export default function ApplicationCard({
  application,
  currentUser,
}: ApplicationCardProps): JSX.Element {
  if (currentUser?.role === Role.Recruiter || currentUser?.role === Role.Admin) {
    return (
      <div className="flex p-3 gap-4 rounded-md shadow-md border border-gray-300">
        <div className="flex flex-col gap-1 w-60">
          <div className="flex items-center gap-3 mb-2">
            <Image
              src={avatar(application.user)}
              alt=""
              width={48}
              height={48}
              className="self-center rounded-full"
            />
            <div className="leading-tight">
              <Link href={`/profile/${application.userId}`} className="hover:underline">
                <h1 className="text-xl font-semibold inline">{fullName(application.user)}</h1>
                <span className="text-gray-600">&nbsp;&nbsp;{application.user.age}</span>
              </Link>
              <div className="text-gray-600">{application.user.email}</div>
            </div>
          </div>

          {/* <div className="text-gray-600">
            {application.user.city}, {application.user.state}
          </div> */}

          <div className="text-gray-600 text-sm italic">{truncate(application.user.bio, 100)}</div>
        </div>
        <div className="border-r border-gray-400" />
        <div className="flex flex-col gap-4 flex-grow">
          <div className="flex gap-4 items-center">
            <h1 className="text-2xl font-semibold">{application.listing.title}</h1>
            <span
              className={clsx(
                'px-2.5 py-0.5 text-sm lowercase rounded-full border',
                applicationStatusColors[application.status]
              )}
            >
              {applicationStatuses[application.status]}
            </span>
          </div>
          <div className="flex gap-8 items-center">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Submitted</span>
              <span className="text-sm">{application.created.toLocaleDateString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm">{application.updated.toLocaleDateString()}</span>
            </div>
          </div>
          {application.reviewer && (
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Reviewer</span>
              <span className="text-sm flex items-center gap-2">
                <Image
                  src={avatar(application.reviewer)}
                  alt=""
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                {fullName(application.reviewer)}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end">
          {application.listing.requirements.map((req) => (
            <p key={req}>{req}</p>
          ))}

          <LinkButton
            href={`/applications/${application.id}`}
            small
            color="primary"
            className="mt-8"
          >
            View Application
          </LinkButton>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-3 gap-2 rounded-md shadow-md border border-gray-300">
      {currentUser && currentUser.id !== application.userId && (
        <Link
          className="flex items-center gap-1 hover:underline cursor-pointer"
          href={`/profile/${application.userId}`}
        >
          <Image
            src={avatar(application.user)}
            alt=""
            width={30}
            height={30}
            className="self-center mr-2 rounded-full"
          />
          <h1 className="text-xl font-medium">{fullName(application.user)}</h1>
        </Link>
      )}
      <div className="font-semibold my-auto">
        <h1 className="text-2xl">{application.listing.title}</h1>
        <h1>Submitted: {application.created.toDateString()}</h1>
        <h1>Status: {application.status.toString()}</h1>
      </div>
      <hr />
      <p className="ml-4">{application.listing.requirements}</p>
    </div>
  )
}
