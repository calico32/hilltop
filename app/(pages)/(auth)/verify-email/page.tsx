import Spinner from '@/_components/Spinner'
import { Suspense } from 'react'
import VerifyEmailHandler from './VerifyEmailHandler'

export default function Page(): JSX.Element {
  return (
    <>
      <div className="mt-8 flex flex-col items-center gap-4">
        <h1 className="text-3xl font-semibold">Verifying your email...</h1>
        <Spinner size={48} />
      </div>
      <Suspense>
        <VerifyEmailHandler />
      </Suspense>
    </>
  )
}
