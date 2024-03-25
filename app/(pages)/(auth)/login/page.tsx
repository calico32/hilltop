import Link from 'next/link'

import { Suspense } from 'react'
import LoginBanner from './LoginBanner'
import LoginForm from './LoginForm'

export default function Page(): JSX.Element {
  return (
    <>
      <Suspense>
        <LoginBanner />
      </Suspense>
      <div className="mx-auto flex w-full max-w-[45ch] flex-col items-center gap-4 rounded-lg border-gray-300 pt-8 sm:border sm:p-8">
        <h1 className="text-2xl font-semibold">Welcome back!</h1>

        <div className="text-sm text-gray-500">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 underline">
            Register
          </Link>{' '}
          today!
        </div>

        <LoginForm />
      </div>
    </>
  )
}
