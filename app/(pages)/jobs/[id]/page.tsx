import server from '@/_api/server'
import { LinkButton } from '@/_components/Button'
import { Role } from '@prisma/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: { id: string } }): Promise<JSX.Element> {
  const listing = await server.getListing(params.id)
  if (!listing) return notFound()
  const currentUser = await server.getUser()
  const application = currentUser
    ? await server.getApplication({ listingId: listing.id, userId: currentUser.id })
    : null

  return (
    <>
      <Link href="/jobs" className="flex items-center gap-1 mb-4 hover:underline w-max">
        <ArrowLeft size={20} strokeWidth={1.5} />
        Back to listings
      </Link>
      <div className="flex items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold">{listing.title}</h1>
          <h2 className="mt-px font-bold text-gray-400 text-lg">in {listing.department.name}</h2>
        </div>
        <div className="flex-grow" />
        <div className="flex flex-col w-40 items-end">
          {!currentUser || currentUser.role === Role.Applicant ? (
            <LinkButton
              href={`/jobs/${params.id}/apply`}
              className="w-full hover:!brightness-100 opacity-50"
              color="primary"
              disabled={!!application}
            >
              Apply now
            </LinkButton>
          ) : (
            <LinkButton
              href={`/applications?jobId=${params.id}`}
              className="w-full"
              color="primary"
            >
              Review applications
            </LinkButton>
          )}
          <span className="mt-2 text-right text-gray-500">
            {application
              ? 'You have already applied for this position.'
              : `${listing._count.applications}
            ${!currentUser || currentUser.role === Role.Applicant ? 'other' : ''} application
            ${listing._count.applications === 1 ? '' : 's'} for this position`}
          </span>
        </div>
      </div>
    </>
  )
}
