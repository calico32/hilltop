'use client'

import api from '@/_api/client'
import { SendVerificationEmailError } from '@/_api/types'
import Button from '@/_components/Button'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function ResendVerificationButton(): JSX.Element {
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  return (
    <Button
      small
      color="warning"
      loading={loading}
      onClick={async () => {
        setLoading(true)
        const res = await api.sendVerificationEmail()
        setLoading(false)

        if (res.ok) {
          toast.success('Verification email sent! Please check your inbox.')
          setCooldown(60)
          return
        }

        switch (res.error) {
          case SendVerificationEmailError.ServerError:
            toast.error(
              'An unexpected error occurred while sending the verification email. Please try again later.'
            )
            break
          case SendVerificationEmailError.Unauthorized:
            toast.error('You must be logged in to resend the verification email.')
            break
          case SendVerificationEmailError.AlreadyVerified:
            toast.success('Your email has already been verified!')
            break
          case SendVerificationEmailError.SendEmailFailed:
            toast.error(
              'The verification email could not be sent. Ensure your email is correct, or try again later.'
            )
            break
        }
      }}
      disabled={cooldown > 0}
    >
      <span className={cooldown > 0 ? 'invisible' : ''}>Resend</span>
      {cooldown > 0 && (
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {cooldown}
        </span>
      )}
    </Button>
  )
}
