'use client'

import api from '@/_api/client'
import ApplicationCard from '@/_components/ApplicationCard'
import Spinner from '@/_components/Spinner'
import { useState } from 'react'

export default function Page(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: applications, isLoading } = api.use('searchApplications', searchTerm)

  return (
    <>
      <h1 className="mb-4 text-3xl font-bold">Applications</h1>
      {/* <label>Search Applications</label> */}
      <input
        id="search"
        type="text"
        placeholder="Search Applications"
        onKeyUp={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
        className="p-1 rounded-md border border-gray-300"
      />
      <div className="pt-4">
        {isLoading ? (
          <Spinner />
        ) : !applications || applications.length === 0 ? (
          <p>No applications found.</p>
        ) : (
          applications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))
        )}
      </div>
    </>
  )
}
