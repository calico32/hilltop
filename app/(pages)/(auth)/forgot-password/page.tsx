import Link from 'next/link'

import ForgotPasswordForm from './ForgotPasswordForm'

export default function Page(): JSX.Element {
  return (
    <>
      <div className="mx-auto flex w-full max-w-[45ch] flex-col items-center gap-4 rounded-lg border-gray-300 pt-8 sm:border sm:p-8">
        <h1 className="text-2xl font-semibold">Reset your Password</h1>

        <div className="text-sm text-gray-500">
          Remember it? Return to{' '}
          <Link href="/login" className="text-blue-600 underline">
            login
          </Link>{' '}
          here.
        </div>

        <p className="">
          Enter the email address associated with your account and we'll send you a link to reset
          your password.
        </p>

        <ForgotPasswordForm />
      </div>
    </>
  )
}
