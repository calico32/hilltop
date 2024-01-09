import Link from 'next/link'

import RegisterForm from './RegisterForm'

export default function Page(): JSX.Element {
  return (
    <>
      <div className="sm:p-8 sm:pt-8 rounded-lg sm:border border-gray-300 w-full mx-auto flex flex-col gap-4 items-center">
        <h1 className="text-2xl font-semibold">Join the Team</h1>

        <div className="text-gray-500 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline text-blue-600">
            Sign in
          </Link>{' '}
          instead.
        </div>

        <RegisterForm />
      </div>
    </>
  )
}
