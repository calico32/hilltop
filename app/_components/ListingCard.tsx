'use client'

import { jobIcons, jobTypes } from '@/_lib/data'
import { formatPay } from '@/_lib/format'
import { Department, JobListing } from '@prisma/client'
import { Clock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

interface ListingCardProps {
  listing: JobListing & { department: Department }
}

export default function ListingCard({ listing }: ListingCardProps): JSX.Element {
  const router = useRouter()

  return (
    <div
      className="flex flex-col p-3 gap-2 rounded-md shadow-md border border-gray-300 h-max cursor-pointer"
      onClick={() => {
        router.push(`/jobs/${listing.id}`)
      }}
    >
      <Link
        className="font-semibold hover:underline"
        href={`/jobs?department=${listing.department.id}`}
      >
        {listing.department.name}
      </Link>
      <h1 className="text-2xl font-semibold">{listing.title}</h1>
      <h2>
        {formatPay(
          listing.payType,
          listing.payMin.toLocaleString(),
          listing.payMax?.toLocaleString()
        )}
      </h2>
      <div className="text-gray-500 flex gap-2.5">
        <h2>
          {React.createElement(jobIcons[listing.type], {
            className: 'inline-block mr-1 align-middle',
            size: 16,
          })}{' '}
          {jobTypes[listing.type]}
        </h2>
        <span>•</span>
        <h2>
          <Clock className="inline-block mr-1 align-middle" size={16} /> {listing.schedule}
        </h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {listing.tags.map((tag) => (
          <Link
            key={tag}
            href={`/jobs?tags=${encodeURIComponent(tag.toLowerCase())}`}
            className="px-2 py-1 text-sm lowercase hover:underline rounded-full border border-gray-400 bg-gray-100 text-gray-700"
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  )
}
