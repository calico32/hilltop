import server from '@/_api/server'
import Button from '@/_components/Button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: { id: string } }): Promise<JSX.Element> {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const listing = await server.getListing(params.id)
  if (!listing) return notFound()

  return (
    <>
      <Link href="/jobs" className="flex items-center gap-1 mb-4 hover:underline w-max">
        <ArrowLeft size={20} strokeWidth={1.5} />
        Back to listings
      </Link>
      <div className="flex items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold">{listing.title}</h1>
          <h2 className="mt-px font-bold text-gray-400 text-lg">in {listing.department.name}</h2>
        </div>
        <div className="flex-grow" />
        <div className="flex flex-col w-40">
          <Button as={Link} href={`/jobs/${params.id}/apply`} className="w-full" color="primary">
            Apply now
          </Button>
          <span className="mt-2 text-right text-gray-500">
            {listing._count.applications} other application
            {listing._count.applications === 1 ? '' : 's'} for this position
          </span>
        </div>
      </div>
    </>
  )
}
