import server from '@/_api/server'
import { LinkButton } from '@/_components/Button'
import { Role } from '@prisma/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: { id: string } }): Promise<JSX.Element> {
  const listing = await server.listings.get(params.id)
  if (!listing) return notFound()
  const currentUser = await server.users.get()
  const application = currentUser
    ? await server.applications.get({ listingId: listing.id, userId: currentUser.id })
    : null

  return (
    <>
      <Link href="/jobs" className="mb-4 flex w-max items-center gap-1 hover:underline">
        <ArrowLeft size={20} strokeWidth={1.5} />
        Back to listings
      </Link>
      <div className="mb-4 flex items-start">
        <div>
          <h1 className="text-3xl font-bold">{listing.title}</h1>
          <h2 className="mt-px text-lg font-bold text-gray-400">in {listing.department.name}</h2>
        </div>
        <div className="flex-grow" />
        <div className="flex w-40 flex-col items-end">
          {!currentUser || currentUser.role === Role.Applicant ? (
            <LinkButton
              href={`/jobs/${params.id}/apply`}
              className="w-full opacity-50 hover:!brightness-100"
              color="primary"
              disabled={!!(currentUser && !!application)}
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
