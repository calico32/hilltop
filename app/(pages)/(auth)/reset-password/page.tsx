'use client'

import ResetPasswordForm from '@/(pages)/(auth)/reset-password/ResetPasswordForm'
import ResetPasswordHandler from '@/(pages)/(auth)/reset-password/ResetPasswordHandler'
import Spinner from '@/_components/Spinner'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface ResetPasswordFormValues {
  password: string
  confirmPassword: string
}

export default function Page(): JSX.Element {
  const params = useSearchParams()
  const [isValidating, setIsValidating] = useState(true)

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ResetPasswordFormValues>()

  if (isValidating)
    return (
      <>
        <div className="mt-8 flex flex-col items-center gap-4">
          <h1 className="text-3xl font-semibold">Checking your account...</h1>
          <Spinner size={48} />
        </div>
        <ResetPasswordHandler setIsValidating={setIsValidating} />
      </>
    )

  return (
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
        Enter a new password for your account. It should be at least 8 characters long and contain
        at least 1 uppercase letter, 1 lowercase letter, and 1 number.
      </p>

      <ResetPasswordForm token={params.get('token') ?? ''} />
    </div>
  )
}
