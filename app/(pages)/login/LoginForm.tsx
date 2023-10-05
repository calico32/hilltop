'use client'

import { SubmitHandler, useForm } from 'react-hook-form'

interface LoginFormValues {
  email: string
  password: string
}

export default function LoginForm(): JSX.Element {
  const { register, handleSubmit } = useForm<LoginFormValues>()

  const onSubmit: SubmitHandler<LoginFormValues> = (data) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 w-full">
      <div className="flex flex-col w-full">
        <label htmlFor="email" className="text-lg font-semibold">
          Email
        </label>
        <input
          className="py-2 px-3 border border-gray-300 rounded-md w-full"
          type="text"
          autoComplete="email"
          {...register('email')}
        />
      </div>

      <div className="flex flex-col w-full">
        <label htmlFor="password" className="text-lg font-semibold">
          Password
        </label>
        <input
          className="py-2 px-3 border border-gray-300 rounded-md w-full"
          type="password"
          autoComplete="current-password"
          {...register('password')}
        />
      </div>
    </form>
  )
}
