'use client'

import api from '@/_api/client'
import { PasswordResetError } from '@/_api/types'
import Button from '@/_components/Button'
import Input from '@/_components/Input'
import { useRouter } from 'next/navigation'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface ResetPasswordFormValues {
  password: string
  confirmPassword: string
}

interface ResetPasswordFormProps {
  token: string
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps): JSX.Element {
  const router = useRouter()
  const form = useForm<ResetPasswordFormValues>()
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit: SubmitHandler<ResetPasswordFormValues> = async (data) => {
    const result = await api.resetPassword(token, data.password, data.confirmPassword)

    if (!result.ok) {
      switch (result.error) {
        case PasswordResetError.ServerError:
          toast.error(
            'An error occurred while attempting to reset your password. Please try again later.',
          )
          break
        case PasswordResetError.ExpiredToken:
          toast.error('The password reset link has expired. Please request a new link.')
          break
        case PasswordResetError.InvalidToken:
          toast.error('The password reset link was invalid. Please try again.')
          break
        case PasswordResetError.PasswordMismatch:
          toast.error('The passwords you entered did not match. Please try again.')
          break
        case PasswordResetError.AlreadyUsed:
          toast.success(
            'Your password has already been reset with this link. Please log in or request a new link.',
          )
          break
        case PasswordResetError.BadRequest:
          toast.error('The password you entered is invalid. Please try again.')
          break
      }
      return
    }

    toast.success(
      'Your password has been successfully reset! You can now log in with your new password.',
    )
    router.replace('/login')
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
        <FormProvider {...form}>
          <div className="flex w-full flex-col">
            <label htmlFor="password" className="text-lg font-semibold">
              New Password
            </label>
            <Input<ResetPasswordFormValues>
              name="password"
              type="password"
              autoComplete="new-password"
              rules={{
                required: 'A password is required.',
                minLength: {
                  value: 8,
                  message: 'Your password must be at least 8 characters long.',
                },
                validate: (value) => {
                  if (value.match(/[A-Z]/) && value.match(/[a-z]/) && value.match(/[0-9]/)) {
                    return true
                  } else {
                    return 'Your password must contain at least one uppercase letter, one lowercase letter, and one number.'
                  }
                },
              }}
            />

            <div className="mt-4 flex w-full flex-col">
              <label htmlFor="confirmPassword" className="text-lg font-semibold">
                Confirm New Password
              </label>
              <Input<ResetPasswordFormValues>
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                rules={{
                  required: 'A password is required.',

                  validate: (value) =>
                    value === form.getValues('password') ||
                    'The passwords you entered did not match.',
                }}
              />
            </div>
          </div>

          <Button
            loading={isSubmitting}
            large
            color="accent"
            type="submit"
            className="mt-2 w-max self-center rounded-md p-3 px-10 text-xl font-semibold"
            disabled={isSubmitting}
          >
            Reset Password
          </Button>
        </FormProvider>
      </form>
    </>
  )
}
