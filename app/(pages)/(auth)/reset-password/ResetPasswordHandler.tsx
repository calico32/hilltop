import { PasswordResetError } from '@/_api/auth/_types'
import api from '@/_api/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

interface ResetPasswordHandlerProps {
  setIsValidating: (isValidating: boolean) => void
}

export default function ResetPasswordHandler({
  setIsValidating,
}: ResetPasswordHandlerProps): JSX.Element {
  const params = useSearchParams()
  const router = useRouter()

  const token = params.get('token')

  useEffect(() => {
    if (!token) {
      toast.error('The password reset link was invalid. Please try resetting your password again.')
      router.replace('/login')
      return
    }

    const verify = async () => {
      const res = await api.auth.isPasswordResetTokenValid(token)

      if (!res.ok) {
        switch (res.error) {
          case PasswordResetError.ServerError:
            toast.error('An error occurred while resetting your password. Please try again later.')
            break
          case PasswordResetError.InvalidToken:
            toast.error('The password reset link was invalid. Please try again.')
            break
          case PasswordResetError.ExpiredToken:
            toast.error(
              'The password reset link has expired is no longer valid. Please request a new link.',
            )
            break
          case PasswordResetError.AlreadyUsed:
            toast.success(
              'Your password has already been reset with this link. Please log in or request a new link.',
            )
            break
        }
        router.replace('/login')
        return
      }

      setIsValidating(false)
    }

    verify()
  }, [])

  return <></>
}
