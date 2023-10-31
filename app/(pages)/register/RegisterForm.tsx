'use client'

import clsx from 'clsx'
import { ArrowUpRightSquare } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'

import api from '@/_api/client'
import Input from '@/_components/Input'
import { states } from '@/_lib/data'
import { groupedNumberOnChange } from '@/_util/grouped-number-input'

import { developmentDeleteUser } from '@/_api/auth'
import { RegisterData, RegisterError } from '@/_api/types'
import Button from '@/_components/Button'
import { useState } from 'react'
import toast from 'react-hot-toast'
import styles from './RegisterForm.module.css'

type RegisterFormValues = RegisterData

export default function RegisterForm(): JSX.Element {
  let deletingUser, setDeletingUser: React.Dispatch<React.SetStateAction<boolean>>
  if (process.env.NODE_ENV === 'development') {
    ;[deletingUser, setDeletingUser] = useState(false)
  }

  const form = useForm<RegisterFormValues>({
    defaultValues: {
      state: 'State',
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = form

  const onSubmit = async (data: RegisterFormValues) => {
    const result = await api.register(data)
    if (!result.ok) {
      switch (result.error) {
        case RegisterError.ServerError:
          toast.error('An error occurred while registering. Please try again later.')
          break
        case RegisterError.EmailExists:
          toast.error('The email address you entered is already associated with an account.')
          break
        case RegisterError.InvalidData:
          toast.error('Please check your information and try again.')
          break
        case RegisterError.PasswordMismatch:
          toast.error('The passwords you entered do not match.')
          break
        case RegisterError.TermsNotAccepted:
          toast.error('You must accept the terms of service to continue.')
          break
        case RegisterError.SendEmailFailed:
          toast(
            'You have successfully registered, but we were unable to send you a verification email.',
            {
              icon: '📧',
            }
          )
      }

      return
    }

    toast.success('Successfully registered!')
  }

  return (
    <form className={clsx('gap-4 w-full', styles.registerForm)} onSubmit={handleSubmit(onSubmit)}>
      <FormProvider {...form}>
        <h2 className="col-start-1 col-span-2 text-2xl font-bold">About You</h2>
        <label className="font-semibold my-auto text-right">
          Legal Name{<Required />}{' '}
          <label>Enter your name as it appears on your government-issued ID.</label>
        </label>
        <div className="flex items-start gap-2 h-max">
          <Input<RegisterFormValues>
            className="flex-1"
            type="text"
            placeholder="First"
            name="firstName"
            rules={{
              required: 'A first name is required.',
              minLength: {
                value: 2,
                message: 'Your first name must be at least 2 characters long.',
              },
            }}
          />
          <Input<RegisterFormValues>
            type="text"
            className="!w-24"
            placeholder="M"
            name="middleInitial"
            maxLength={1}
            rules={{
              maxLength: {
                value: 1,
                message: 'Your middle initial must be 1 character long.',
              },
            }}
          />
          <Input<RegisterFormValues>
            type="text"
            className="flex-1"
            placeholder="Last"
            name="lastName"
            rules={{
              required: 'A last name is required.',
              minLength: {
                value: 2,
                message: 'Your last name must be at least 2 characters long.',
              },
            }}
          />
        </div>
        <label className="font-semibold my-auto text-right">
          Preferred Name
          <label>
            Enter the name you would like to be called by. If you don't have one, leave this blank.
          </label>
        </label>
        <Input<RegisterFormValues>
          type="text"
          name="preferredName"
          placeholder="John Doe"
          rules={{
            minLength: {
              value: 2,
              message: 'Your preferred name must be at least 2 characters long.',
            },
            maxLength: {
              value: 50,
              message: 'Your preferred name must be at most 50 characters long.',
            },
          }}
        />
        <label className="font-semibold my-auto text-right">Date of Birth{<Required />}</label>
        <Input<RegisterFormValues>
          type="date"
          name="dob"
          rules={{
            required: 'A date of birth is required.',
          }}
        />
        <label className="font-semibold my-auto text-right">
          Tax ID{<Required />}
          <label>
            Enter your Social Security Number (SSN) or Individual Taxpayer Identification Number
            (ITIN).
          </label>
        </label>
        <Input<RegisterFormValues>
          name="taxId"
          type="text"
          placeholder="xxx-xx-xxxx"
          rules={{
            required: 'Enter your 9-digit tax ID.',
            pattern: {
              value: /^\d{3}-\d{2}-\d{4}$/,
              message: 'Please enter a valid 9-digit tax ID.',
            },
            onChange: groupedNumberOnChange([3, 2, 4], '-', (value) =>
              setValue('taxId', value, { shouldValidate: true })
            ),
          }}
        />
        <label className="font-semibold my-auto text-right">Street Address{<Required />}</label>
        <div className="flex flex-col gap-2">
          <Input<RegisterFormValues>
            name="address1"
            type="text"
            placeholder="Address Line 1"
            rules={{
              required: 'A street address is required.',
              minLength: {
                value: 2,
                message: 'Your street address must be at least 2 characters long.',
              },
            }}
          />
          <Input<RegisterFormValues>
            name="address2"
            type="text"
            placeholder="Address Line 2"
            rules={{
              minLength: {
                value: 2,
                message: 'Your second address line be at least 2 characters long.',
              },
            }}
          />
          <div className="flex gap-2 h-max flex-col xs:flex-row">
            <Input<RegisterFormValues>
              name="city"
              type="text"
              placeholder="City"
              className="flex-grow w-full"
              rules={{
                required: 'A city is required.',
                minLength: {
                  value: 2,
                  message: 'Your city must be at least 2 characters long.',
                },
              }}
            />
            <div className="flex gap-2 h-max flex-row w-full">
              <Input<RegisterFormValues, true>
                select
                name="state"
                className="w-24"
                rules={{
                  required: 'A state is required.',
                  maxLength: {
                    value: 2,
                    message: 'Please select a state.',
                  },
                }}
              >
                <option disabled value="State">
                  State
                </option>
                <option disabled value="---">
                  ---
                </option>
                {Object.keys(states).map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </Input>
              <Input<RegisterFormValues>
                name="zip"
                type="text"
                className="xs:w-24 flex-grow"
                placeholder="ZIP"
                rules={{
                  required: 'A ZIP code is required.',
                  minLength: {
                    value: 5,
                    message: 'Your ZIP code must be at least 5 characters long.',
                  },
                  maxLength: {
                    value: 5,
                    message: 'Your ZIP code must be at most 5 characters long.',
                  },
                }}
              />
            </div>
          </div>
        </div>

        <h2 className="col-start-1 col-span-2 text-2xl font-bold">Contacting You</h2>
        <label className="font-semibold my-auto text-right">
          Email Address{<Required />}
          <label>You'll use this email address to log in to your account.</label>
        </label>
        <Input<RegisterFormValues>
          name="email"
          type="email"
          placeholder="john@example.com"
          rules={{
            required: 'An email address is required.',
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: 'Please enter a valid email address.',
            },
          }}
        />

        <label className="font-semibold my-auto text-right">
          Phone Number (US only)
          <label>If you do not have a US phone number, leave this field blank.</label>
        </label>
        <Input<RegisterFormValues>
          name="phone"
          type="tel"
          placeholder="xxx-xxx-xxxx"
          rules={{
            pattern: {
              value: /^\d{3}-\d{3}-\d{4}$/,
              message: 'Please enter a valid phone number.',
            },
            onChange: groupedNumberOnChange([3, 3, 4], '-', (value) =>
              setValue('phone', value, { shouldValidate: true })
            ),
          }}
        />

        <h2 className="col-start-1 col-span-2 text-2xl font-bold mt-8">Logging In</h2>

        <label className="font-semibold my-auto text-right">
          Password{<Required />}
          <label>
            Your password must be at least 8 characters long and contain at least 1 uppercase
            letter, 1 lowercase letter, and 1 number.
          </label>
        </label>
        <Input<RegisterFormValues>
          name="password"
          type="password"
          autoComplete="new-password"
          rules={{
            required: 'A password is required.',
            minLength: {
              value: 8,
              message: 'Your password must be at least 8 characters long.',
            },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
              message:
                'Your password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number.',
            },
          }}
        />

        <label className="font-semibold my-auto text-right">
          Confirm Password{<Required />}
          <label>Re-enter your password to confirm.</label>
        </label>
        <Input<RegisterFormValues>
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          rules={{
            required: 'Please confirm your password.',
            validate: (value) => value === getValues('password') || 'Passwords do not match.',
          }}
        />

        <h2 className="col-start-1 col-span-2 text-2xl font-bold mt-8">Agreements</h2>

        <label className="font-semibold text-right md:mt-0 mt-4">
          Terms of Service{<Required />}
        </label>
        <label className="cursor-pointer">
          <input
            type="checkbox"
            className="mr-2"
            {...register('terms', {
              required: 'You must read and agree to the terms of service to continue.',
            })}
          />
          I have read and agree to the{' '}
          <a
            href="/terms"
            target="_blank"
            className="underline text-blue-600 inline-flex items-center gap-0.5"
          >
            Terms of Service <ArrowUpRightSquare size={16} />
          </a>
          .
          {errors.terms && <span className="text-red-500 error block">{errors.terms.message}</span>}
        </label>

        <label className="font-semibold text-right md:mt-0 mt-4">
          Privacy Policy{<Required />}
        </label>
        <label className="cursor-pointer">
          <input
            type="checkbox"
            className="mr-2"
            {...register('privacy', {
              required: 'You must read and agree to the privacy policy to continue.',
            })}
          />
          I have read and agree to the{' '}
          <a
            href="/privacy"
            target="_blank"
            className="underline text-blue-600 inline-flex items-center gap-0.5"
          >
            Privacy Policy <ArrowUpRightSquare size={16} />
          </a>
          .
          {errors.privacy && (
            <span className="text-red-500 error block">{errors.privacy.message}</span>
          )}
        </label>

        <label className="font-semibold text-right md:mt-0 mt-4">Disclaimer{<Required />}</label>
        <label className="cursor-pointer">
          <input
            type="checkbox"
            className="mr-2"
            {...register('disclaimer', {
              required: 'You must read and understand the disclaimer to continue.',
            })}
          />
          I have read and understand the{' '}
          <a
            href="/disclaimer"
            target="_blank"
            className="underline text-blue-600 inline-flex items-center gap-0.5"
          >
            Disclaimer <ArrowUpRightSquare size={16} />
          </a>
          . I understand that Hilltop is not a real hiring platform, and that no real jobs are
          offered on this site.
          {errors.disclaimer && (
            <span className="text-red-500 error block">{errors.disclaimer.message}</span>
          )}
        </label>

        <label className="font-semibold text-right md:mt-0 mt-4">Email Updates</label>
        <label className="cursor-pointer">
          <input type="checkbox" className="mr-2" {...register('emailUpdates')} />I would like to
          receive email updates about available jobs and product updates.
        </label>

        {process.env.NODE_ENV === 'development' && (
          <>
            <div className="col-span-2 w-full flex justify-around gap-2 items-baseline mt-8">
              <span className="italic text-gray-500 text-lg">Developer tools:</span>
              <Button
                type="button"
                color="accent"
                small
                onClick={() => {
                  setValue('firstName', 'John')
                  setValue('middleInitial', 'Q')
                  setValue('lastName', 'Doe')
                  setValue('preferredName', 'Johnny Doe')
                  setValue('dob', '1990-01-01')
                  setValue('taxId', '123-45-6789')
                  setValue('address1', '123 Main St')
                  setValue('address2', 'Apt 1')
                  setValue('city', 'Anytown')
                  setValue('state', 'CA')
                  setValue('zip', '12345')
                  setValue('email', 'john@example.org')
                  setValue('phone', '123-456-7890')
                  setValue('password', 'Password1')
                  setValue('confirmPassword', 'Password1')
                  setValue('terms', true)
                  setValue('privacy', true)
                  setValue('disclaimer', true)
                  setValue('emailUpdates', true)
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
              <Button
                type="button"
                minimal
                small
                color="danger"
                loading={deletingUser}
                onClick={async () => {
                  setDeletingUser?.(true)
                  const res = await developmentDeleteUser(process.env.NEXT_PUBLIC_DELETE_USER_KEY!)
                  setDeletingUser?.(false)

                  if (!res.ok) {
                    toast.error('An error occurred while deleting the test user.')
                    return
                  }

                  toast.success('Successfully deleted the test user.')
                }}
              >
                Delete test user
              </Button>
            </div>
          </>
        )}

        <Button
          type="submit"
          color="primary"
          loading={isSubmitting}
          className="col-start-1 col-span-2 w-max mx-auto mt-8 text-lg hover:brightness-110"
          disabled={isSubmitting}
        >
          Register
        </Button>
      </FormProvider>
    </form>
  )
}

function Required(): JSX.Element {
  return <span className="text-red-500">*</span>
}
