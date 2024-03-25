import server from '@/_api/server'
import { LinkButton } from '@/_components/Button'
import { formatPay } from '@/_lib/format'
import { Role } from '@prisma/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

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
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{listing.title}</h1>
          <h2 className="mt-px text-lg font-bold text-gray-400">in {listing.department.name}</h2>

          <div className="prose prose-gray mb-8 mt-2">
            <ReactMarkdown>{listing.description}</ReactMarkdown>
          </div>

          <h2 className="mb-1 mt-4 text-xl font-semibold">Job Requirements</h2>
          <div className="prose prose-gray">
            <ul className="">
              {listing.requirements.map((req) => (
                <li key={req}>{req}</li>
              ))}
            </ul>
          </div>

          <h2 className="mb-1 mt-4 text-xl font-semibold">Pay & Benefits</h2>
          <div className="">
            <div>
              {formatPay(
                listing.payType,
                listing.payMin.toLocaleString(),
                listing.payMax?.toLocaleString(),
                true,
              )}
            </div>

            <h3 className="mt-2 text-lg font-semibold">Erickson Standard Benefits Package</h3>
            <p className="mb-2 font-medium">
              With a focus on whole-person wellness, Erickson Living offers a comprehensive benefits
              package to help you achieve your personal and professional goals. Our benefits include
              but are not limited to:
            </p>
            <div className="prose prose-gray">
              <ul className="list-disc columns-2">
                <li>Medical, Dental, and Vision Insurance</li>
                <li>401(k) with Employer Match</li>
                <li>Generous Paid Time Off</li>
                <li>Employee Assistance Program</li>
                <li>Short-Term and Long-Term Disability Insurance</li>
                <li>Life, Accidental Death, and Dismemberment Insurance</li>
                <li>Flexible Spending Accounts</li>
                <li>Education Assistance</li>
                <li>Employee Referral Program</li>
                <li>Commuter Benefits Program</li>
                <li>Group Auto/Home/Pet Insurance</li>
                <li>Identity Theft Protection</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex w-40 flex-col items-end">
          {!currentUser || currentUser.role === Role.Applicant ? (
            <LinkButton
              href={`/jobs/${params.id}/apply`}
              className="w-full hover:!brightness-100"
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
            {listing.positions} {listing.positions === 1 ? 'position' : 'positions'} available
          </span>
          <span className="mt-2 text-right text-gray-500">
            {application
              ? 'You have already applied for this position.'
              : `${listing._count.applications}
            ${!currentUser || currentUser.role === Role.Applicant ? 'other' : ''} application${
              listing._count.applications === 1 ? '' : 's'
            } for this position`}
          </span>
        </div>
      </div>
    </>
  )
}
