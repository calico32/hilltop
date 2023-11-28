import server from '@/_api/server'
import ListingCard from '@/_components/ListingCard'

export default async function Page(): Promise<JSX.Element> {
  const listings = await server.getListings()

  return (
    <>
      <h1 className="mb-4 text-3xl font-bold">Explore Jobs</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </>
  )
}
