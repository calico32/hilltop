'use client'

import api from '@/_api/client'
import { LoginError } from '@/_api/types'
import Button from '@/_components/Button'
import Input from '@/_components/Input'
import { KeyRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface LoginFormValues {
  email: string
  password: string
}

export default function LoginForm(): JSX.Element {
  const router = useRouter()
  const form = useForm<LoginFormValues>()
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    const result = await api.login(data.email, data.password)
    if (!result.ok) {
      switch (result.error) {
        case LoginError.ServerError:
          toast.error('An error occurred while logging in. Please try again later.')
          break
        case LoginError.InvalidCredentials:
          toast.error('The email or password you entered is incorrect.')
          break
      }
      return
    }

    await api.mutate('getUser', [], result.value)
    toast.success('Successfully logged in!')
    router.push('/dashboard')
  }

  return (
    <>
      <button className="flex items-center justify-center w-full gap-4 p-3 font-semibold text-white rounded-md bg-navyblue-0 hover:brightness-125">
        <KeyRound strokeWidth={1.5} />
        Sign in with Passkey
      </button>
      <div className="flex items-center w-full gap-2">
        <hr className="flex-grow border-gray-400" />
        <span className="tracking-wider text-gray-400">OR</span>
        <hr className="flex-grow border-gray-400" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full gap-4">
        <FormProvider {...form}>
          <div className="flex flex-col w-full">
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

          <div className="flex flex-col w-full">
            <label htmlFor="password" className="text-lg font-semibold">
              Password
            </label>
            <Input<LoginFormValues>
              name="password"
              type="password"
              autoComplete="current-password"
              rules={{ required: 'A password is required.' }}
            />
          </div>

          <Button
            loading={isSubmitting}
            color="accent"
            type="submit"
            className="self-center p-3 px-10 mt-2 text-xl font-semibold rounded-md w-max"
            disabled={isSubmitting}
          >
            Sign in
          </Button>
        </FormProvider>
      </form>
    </>
  )
}
