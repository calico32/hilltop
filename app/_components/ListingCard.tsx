import { JobListing, PayType } from '@prisma/client'
import Link from 'next/link'

interface ListingCardProps {
  listing: JobListing
}

export default function ListingCard({ listing }: ListingCardProps): JSX.Element {
  return (
    <Link
      className="flex flex-col p-3 gap-2 rounded-md shadow-md border border-gray-300"
      href={`/jobs/${listing.id}`}
    >
      <h1 className="text-xl font-semibold">{listing.title}</h1>
      <h2>
        {formatPay(
          listing.payType,
          listing.payMin.toLocaleString(),
          listing.payMax?.toLocaleString()
        )}
      </h2>
      <h2>
        {listing.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </h2>
      <h2>{listing.type}</h2>
    </Link>
  )
}

function formatPay(type: PayType, min: string, max: string | undefined): string {
  if (type === PayType.Hourly) {
    if (!max || min === max) {
      return `$${min}/hr`
    }

    return `$${min}-${max}/hr`
  } else {
    if (!max || min === max) {
      return `$${min}`
    }

    return `$${min}-$${max}`
  }
}
