import { MailWarning } from 'lucide-react'
import ResendVerificationButton from './ResendVerificationButton'

interface VerifyEmailBannerProps {
  verified?: boolean
}

export default function VerifyEmailBanner({
  verified = false,
}: VerifyEmailBannerProps): JSX.Element {
  if (verified) return <></>

  return (
    <div className="bg-amber-50 p-4 border rounded-md text-amber-900 border-amber-700 mb-4 max-w-[700px]">
      <h1 className="flex items-top">
        <MailWarning className="inline-block mr-4" size={32} />
        <span className="text-2xl font-semibold">Verify your email</span>
      </h1>

      <div className="mt-2">
        <div className="float-right ml-4">
          <ResendVerificationButton />
        </div>
        Email verification is required to apply for jobs. Check your inbox for a verification email,
        or click resend to get another.
      </div>
    </div>
  )
}
