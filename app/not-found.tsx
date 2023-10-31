import AppBar from '@/_components/AppBar'
import { SearchX } from 'lucide-react'
import Link from 'next/link'

export default function NotFound(): JSX.Element {
  return (
    <>
      <AppBar />
      <div className="h-28"></div>

      <div className="flex flex-col items-center gap-3">
        <h1 className="text-3xl font-semibold flex items-center gap-4">
          <SearchX size={36} />
          Page not found
        </h1>
        <p className="text-gray-500 text-lg">
          Sorry, we couldn't find the page you were looking for.
        </p>

        <div className="flex gap-4 text-lg">
          <Link className="underline text-blue-600" href="/">
            Go Home
          </Link>
          <Link className="underline text-blue-600" href="/dashboard">
            Dashboard
          </Link>
          <Link className="underline text-blue-600" href="/profile">
            Profile
          </Link>
        </div>
      </div>
    </>
  )
}
