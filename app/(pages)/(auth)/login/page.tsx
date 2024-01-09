import Link from 'next/link'

import LoginBanner from './LoginBanner'
import LoginForm from './LoginForm'

export default function Page(): JSX.Element {
  return (
    <>
      <LoginBanner />
      <div className="sm:p-8 pt-8 rounded-lg sm:border border-gray-300 flex items-center flex-col max-w-[45ch] w-full mx-auto gap-4">
        <h1 className="text-2xl font-semibold">Welcome back!</h1>

        <div className="text-gray-500 text-sm">
          Don't have an account?{' '}
          <Link href="/register" className="underline text-blue-600">
            Register
          </Link>{' '}
          today!
        </div>

        <LoginForm />
      </div>
    </>
  )
}
