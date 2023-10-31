import Button from '@/_components/Button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function Page(): JSX.Element {
  return (
    <>
      <div className="skeleton">
        <div>
          <Link href="/jobs" className="flex items-center gap-1 mb-4 hover:underline w-max">
            <ArrowLeft size={20} strokeWidth={1.5} />
            Back to listings
          </Link>
        </div>
      </div>
      <div className="flex items-start mb-4 skeleton">
        <div>
          <h1 className="text-3xl font-bold">The quick brown fox</h1>
          <h2 className="mt-px font-bold text-gray-400 text-lg w-max">jumps over</h2>
        </div>
        <div className="flex-grow" />
        <div className="flex flex-col w-40">
          <Button className="w-full" color="primary">
            Apply now
          </Button>
          <span className="mt-2 text-right text-gray-500">
            The quick brown fox jumps over the lazy dog
          </span>
        </div>
      </div>
    </>
  )
}
