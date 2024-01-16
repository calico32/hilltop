import { FullApplication } from '@/_api/applications/_types'
import { LinkButton } from '@/_components/Button'
import { applicationStatusColors, applicationStatuses } from '@/_lib/data'
import { avatar, fullName } from '@/_lib/format'
import { truncate } from '@/_util/string'
import {
  FloatingArrow,
  arrow,
  autoUpdate,
  offset,
  useFloating,
  useHover,
  useInteractions,
  useTransitionStyles,
} from '@floating-ui/react'
import { Role, User } from '@prisma/client'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'

interface ApplicationCardProps {
  application: FullApplication
  currentUser: User | null | undefined
}

export default function ApplicationCard({
  application,
  currentUser,
}: ApplicationCardProps): JSX.Element {
  if (currentUser?.role === Role.Recruiter || currentUser?.role === Role.Admin) {
    const submitted = new Date(application.created)
    const diff = Date.now() - submitted.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const showWarning = days > 7
    const arrowRef = useRef(null)
    const ARROW_HEIGHT = 7
    const GAP = 2
    const [open, setOpen] = useState(false)
    const { refs, context, floatingStyles } = useFloating({
      open: open,
      onOpenChange: setOpen,
      placement: 'top-end',
      whileElementsMounted: autoUpdate,
      middleware: [
        offset(ARROW_HEIGHT + GAP),
        arrow({
          element: arrowRef,
        }),
      ],
    })

    const { getFloatingProps, getReferenceProps } = useInteractions([useHover(context)])
    const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
      duration: 200,

      initial: {
        opacity: 0,
        transform: 'translateY(10px) scale(0.95)',
      },
      open: {
        opacity: 1,
        transform: 'translateY(0) scale(1)',
      },
    })

    return (
      <div className="relative flex gap-4 rounded-md border border-gray-300 p-3 shadow-md">
        {showWarning && (
          <>
            {isMounted && (
              <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
                <div
                  style={transitionStyles}
                  className="ounded-br-none w-max rounded-md bg-red-100 p-3 text-red-950 shadow-md shadow-red-900/10"
                >
                  <FloatingArrow
                    height={ARROW_HEIGHT}
                    fill="rgb(254, 226, 226)"
                    className="drop-shadow-md"
                    ref={arrowRef}
                    context={context}
                  />
                  Application submitted {days} days ago. Consider following up.
                </div>
              </div>
            )}
            <div className="absolute -right-1 -top-1 h-4 w-4 animate-ping rounded-full bg-red-600" />
            <div
              className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-600"
              ref={refs.setReference}
              {...getReferenceProps()}
            />
          </>
        )}
        <div className="flex w-60 flex-col gap-1">
          <div className="mb-2 flex items-center gap-3">
            <Image
              src={avatar(application.user)}
              alt=""
              width={48}
              height={48}
              className="self-center rounded-full"
            />
            <div className="leading-tight">
              <Link href={`/profile/${application.userId}`} className="hover:underline">
                <h1 className="inline text-xl font-semibold">{fullName(application.user)}</h1>
                <span className="text-gray-600">&nbsp;&nbsp;{application.user.age}</span>
              </Link>
              <div className="text-gray-600">{application.user.email}</div>
            </div>
          </div>
          {/* <div className="text-gray-600">
            {application.user.city}, {application.user.state}
          </div> */}
          <div className="text-sm italic text-gray-600">{truncate(application.user.bio, 100)}</div>
        </div>
        <div className="border-r border-gray-400" />
        <div className="flex flex-grow flex-col gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold">{application.listing.title}</h1>
            <span
              className={clsx(
                'rounded-full border px-2.5 py-0.5 text-sm lowercase',
                applicationStatusColors[application.status],
              )}
            >
              {applicationStatuses[application.status]}
            </span>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Submitted</span>
              <span className={clsx('text-sm', showWarning && 'text-red-600')}>
                {application.created.toLocaleDateString()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm">{application.updated.toLocaleDateString()}</span>
            </div>
          </div>
          {application.reviewer && (
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Reviewer</span>
              <span className="flex items-center gap-2 text-sm">
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

          <div className="flex-1" />

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
    <div className="flex flex-col gap-2 rounded-md border border-gray-300 p-3 shadow-md">
      {currentUser && currentUser.id !== application.userId && (
        <Link
          className="flex cursor-pointer items-center gap-1 hover:underline"
          href={`/profile/${application.userId}`}
        >
          <Image
            src={avatar(application.user)}
            alt=""
            width={30}
            height={30}
            className="mr-2 self-center rounded-full"
          />
          <h1 className="text-xl font-medium">{fullName(application.user)}</h1>
        </Link>
      )}
      <div className="my-auto font-semibold">
        <h1 className="text-2xl">{application.listing.title}</h1>
        <h1>Submitted: {application.created.toDateString()}</h1>
        <h1>Status: {application.status.toString()}</h1>
      </div>
      <hr />
      <p className="ml-4">{application.listing.requirements}</p>
    </div>
  )
}
