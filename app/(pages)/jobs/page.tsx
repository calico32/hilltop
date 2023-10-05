import ListingCard from '@/_components/ListingCard'
import { getListings } from '@/_lib/listings'

export default async function Page(): Promise<JSX.Element> {
  const listings = await getListings()

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
