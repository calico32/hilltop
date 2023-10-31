import ListingCard from '@/_components/ListingCard'
import { JobListing } from '@prisma/client'

export default async function Page(): Promise<JSX.Element> {
  const listings: JobListing[] = []

  return (
    <>
      <h1 className="mb-4 text-3xl font-bold">Explore Jobs</h1>

      <ul>
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </ul>
    </>
  )
}
