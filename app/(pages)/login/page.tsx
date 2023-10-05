import LoginForm from '@/(pages)/login/LoginForm'
import Link from 'next/link'

export default function Page(): JSX.Element {
  return (
    <>
      <div className="p-8 rounded-lg border border-gray-300 flex items-center flex-col max-w-[45ch] w-full mx-auto gap-4">
        <h1 className="text-2xl font-semibold">Welcome back!</h1>

        <div className="text-gray-500 text-sm">
          Don't have an account?{' '}
          <Link href="/signup" className="underline text-blue-600">
            Register
          </Link>{' '}
          today!
        </div>

        <LoginForm />
      </div>
    </>
  )
}
