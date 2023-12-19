'use client'

import api from '@/_api/client'
import ApplicationCard from '@/_components/ApplicationCard'
import Spinner from '@/_components/Spinner'
import { useState } from 'react'

// export const metadata = {
//   robots: { index: false, follow: false },
// }

export default function Page(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: applications, isLoading } = api.$use('searchApplications', searchTerm)
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
        className="p-1 rounded-md border border-gray-300"
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
