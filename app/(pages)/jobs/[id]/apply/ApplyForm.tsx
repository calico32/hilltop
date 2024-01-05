'use client'

import Input from '@/_components/Input'
import { FormProvider, useForm } from 'react-hook-form'

export default function ApplyForm(): JSX.Element {
  const form = useForm()
  const onSubmit = (data: any) => console.log(data)
  return (
    <>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Input<String> name="charAt" />
          <input type="submit" />
        </form>
      </FormProvider>
    </>
  )
}
