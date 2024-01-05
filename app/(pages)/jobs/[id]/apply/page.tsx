import ApplyForm from '@/(pages)/jobs/[id]/apply/ApplyForm'
import server from '@/_api/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: { id: string } }): Promise<JSX.Element> {
  const listing = await server.getListing(params.id)
  if (!listing) return notFound()

  return (
    <>
      <Link
        href={`/jobs/${params.id}`}
        className="flex items-center gap-1 mb-4 hover:underline w-max"
      >
        <ArrowLeft size={20} strokeWidth={1.5} />
        Back to listing
      </Link>
      <div className="flex items-start mb-4">
        <div>
          <h1 className="text-3xl">
            Apply for <strong>{listing.title}</strong>
          </h1>
          <ApplyForm />
        </div>
      </div>
    </>
  )
}
