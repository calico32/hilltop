'use client'

import { X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function LoginBanner(): JSX.Element {
  const query = useSearchParams()
  const next = query.get('next')
  if (!next) return <></>

  return (
    <div className="p-4 rounded-md bg-red-200 max-w-[45ch] mb-4 text-red-800 w-full mx-auto border border-red-900 flex items-center">
      <X strokeWidth={1.5} className="inline-block mr-2" />
      Please login to continue.
    </div>
  )
}
