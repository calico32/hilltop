'use client'

import api from '@/_api/client'
import { ActionError } from '@/_api/types'
import Button from '@/_components/Button'
import Input from '@/_components/Input'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface LoginFormValues {
  email: string
  password: string
}

export default function ForgotPasswordForm(): JSX.Element {
  const form = useForm<LoginFormValues>()
  const {
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
  } = form

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    const result = await api.auth.forgotPassword(data.email)

    if (!result.ok) {
      switch (result.error) {
        case ActionError.ServerError:
          toast.error(
            'An error occurred while attempting to reset your password. Please try again later.',
          )
          break
        case ActionError.NotFound:
          toast.error('The email you entered is not associated with an account. Please try again.')
          break
      }
      return
    }

    toast.success(
      'Successfully sent a password reset email! Click the link in the email to reset your password.',
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
        <FormProvider {...form}>
          <div className="flex w-full flex-col">
            <label htmlFor="email" className="text-lg font-semibold">
              Email
            </label>
            <Input<LoginFormValues>
              name="email"
              type="email"
              autoComplete="email"
              rules={{ required: 'An email is required.' }}
            />
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

          {(process.env.NODE_ENV === 'development' || true) && (
            <>
              <div className="col-span-2 mt-8 flex w-full items-baseline justify-around gap-2">
                <span className="text-lg italic text-gray-500">Developer tools:</span>
                <Button
                  type="button"
                  color="accent"
                  small
                  onClick={() => {
                    setValue('email', 'casandra.mclaughlin@ethereal.email')
                  }}
                >
                  Populate test data
                </Button>
                <Button
                  type="button"
                  minimal
                  small
                  color="accent"
                  onClick={() => {
                    reset()
                  }}
                >
                  Clear form
                </Button>
              </div>
            </>
          )}
        </FormProvider>
      </form>
    </>
  )
}
