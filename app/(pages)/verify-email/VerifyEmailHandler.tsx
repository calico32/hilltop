'use client'

import api from '@/_api/client'
import { VerifyEmailError } from '@/_api/types'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function VerifyEmailHandler(): JSX.Element {
  const params = useSearchParams()
  const router = useRouter()

  const token = params.get('token')

  useEffect(() => {
    if (!token) {
      toast.error('The verification link was invalid. Please try again.')
      router.replace('/')
      return
    }

    const verify = async () => {
      const res = await api.verifyEmail(token)

      if (!res.ok) {
        switch (res.error) {
          case VerifyEmailError.ServerError:
            toast.error('An error occurred while verifying your email. Please try again later.')
            break
          case VerifyEmailError.InvalidToken:
            toast.error('The verification link was invalid. Please try again.')
            break
          case VerifyEmailError.EmailMismatch:
          case VerifyEmailError.ExpiredToken:
            toast.error('The verification link is no longer valid. Please try again.')
            break
          case VerifyEmailError.AlreadyVerified:
            toast.success('Your email has already been verified! You may now log in.')
            break
        }
        router.replace('/login')
        return
      }

      toast.success('Your email has been verified! You may now log in.')
      router.replace('/login')
    }

    verify()
  }, [])

  return <></>
}
