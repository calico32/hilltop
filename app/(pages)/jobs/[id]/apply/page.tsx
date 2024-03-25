import ApplyForm from '@/(pages)/jobs/[id]/apply/ApplyForm'
import server from '@/_api/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: { id: string } }): Promise<JSX.Element> {
  const listing = await server.listings.get(params.id)
  if (!listing) return notFound()

  return (
    <>
      <Link
        href={`/jobs/${params.id}`}
        className="mb-4 flex w-max items-center gap-1 hover:underline"
      >
        <ArrowLeft size={20} strokeWidth={1.5} />
        Back to listing
      </Link>
      <h1 className="text-3xl">
        Apply for <strong>{listing.title}</strong>
      </h1>
      <ApplyForm listing={listing} />
    </>
  )
}
