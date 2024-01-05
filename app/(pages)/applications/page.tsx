'use client'

import { SearchApplicationQuery } from '@/_api/applications'
import api from '@/_api/client'
import ApplicationCard from '@/_components/ApplicationCard'
import Spinner from '@/_components/Spinner'
import { ApplicationStatus } from '@prisma/client'
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

// export const metadata = {
//   robots: { index: false, follow: false },
// }

function parseStatusParam(status: string | null): ApplicationStatus[] | undefined {
  if (!status) return undefined
  const valid = [
    ApplicationStatus.Submitted,
    ApplicationStatus.InReview,
    ApplicationStatus.Interviewing,
    ApplicationStatus.Offered,
    ApplicationStatus.Hired,
    ApplicationStatus.Withdrawn,
    ApplicationStatus.Rejected,
  ] as const

  return status.split(',').filter((s) => valid.includes(s as any)) as ApplicationStatus[]
}

function parseSearchParams(searchParams: ReadonlyURLSearchParams): SearchApplicationQuery {
  return {
    search: searchParams.get('search') ?? undefined,
    jobId: searchParams.get('jobId') ?? undefined,
    applicantId: searchParams.get('applicantId') ?? undefined,
    status: parseStatusParam(searchParams.get('status')),
  }
}

function stringifySearchParams(query: SearchApplicationQuery): string {
  const params = new URLSearchParams()
  if (query.search) params.set('search', query.search)
  if (query.jobId) params.set('jobId', query.jobId)
  if (query.applicantId) params.set('applicantId', query.applicantId)
  if (query.status) params.set('status', query.status.join(','))
  return params.toString()
}

export default function Page(): JSX.Element {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState<SearchApplicationQuery>(parseSearchParams(searchParams))
  const [searchTerm, setSearchTerm] = useState<string | undefined>(query.search)

  useEffect(() => {
    const path = `/applications?${stringifySearchParams(query)}`
    window.history.replaceState({}, '', path)
  }, [query])

  const { data: applications, isLoading } = api.$use('searchApplications', query)
  const { data: currentUser, isLoading: userLoading } = api.$use('getUser')
  //hi :)
  return (
    <>
      <h1 className="mb-4 text-3xl font-bold">Applications</h1>
      <input
        id="search"
        type="text"
        placeholder="Search Applications"
        onKeyUp={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
        className="rounded-md border border-gray-300 p-1"
      />
      <div className="pt-4">
        {isLoading || userLoading ? (
          <Spinner />
        ) : !applications || applications.length === 0 ? (
          <p>No applications found.</p>
        ) : (
          applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              currentUser={currentUser}
            />
          ))
        )}
      </div>
    </>
  )
}
