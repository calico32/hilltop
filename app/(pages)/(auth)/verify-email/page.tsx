import Spinner from '@/_components/Spinner'
import VerifyEmailHandler from './VerifyEmailHandler'

export default function Page(): JSX.Element {
  return (
    <>
      <div className="flex mt-8 flex-col gap-4 items-center">
        <h1 className="text-3xl font-semibold">Verifying your email...</h1>
        <Spinner size={48} />
      </div>
      <VerifyEmailHandler />
    </>
  )
}
