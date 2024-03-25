'use client'

import HiddenTaxId from '@/(pages)/applications/[id]/HiddenTaxId'
import styles from '@/(pages)/settings/page.module.css'
import api from '@/_api/client'
import Button from '@/_components/Button'
import Spinner from '@/_components/Spinner'
import { fullName } from '@/_lib/format'
import { JobListing } from '@prisma/client'

interface ApplyFormStep1Props {
  listing: JobListing
  nextStep?: () => void
  previousStep?: () => void
  goToStep?: (step: number) => void
}

export default function ApplyFormStep1({
  nextStep,
  previousStep,
}: ApplyFormStep1Props): JSX.Element {
  const { data: user, isLoading } = api.users.$use('get')
  const { data: sensitive } = api.users.$use('getSensitiveData')

  if (!user || isLoading) {
    return (
      <>
        <h1 className="text-xl font-semibold">Confirm your personal information</h1>
        <Spinner size={32} />
      </>
    )
  }

  return (
    <>
      <h1 className="text-3xl font-semibold">Confirm your personal information</h1>

      <div className={styles.settings}>
        <div>
          <h2 className="text-2xl font-semibold">Profile</h2>
          <p>
            Go to your{' '}
            <a className="text-blue-600 underline" href="/settings">
              settings
            </a>{' '}
            to update your profile.
          </p>
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            Email
            <span className="text-gray-500">{user.email}</span>
          </div>
          <div className="flex items-baseline gap-2">
            Name
            <span className="text-gray-500">{fullName(user)}</span>
          </div>
          <div className="flex items-baseline gap-2">
            Bio
            <span className="text-gray-500">{user.bio}</span>
          </div>
          <div className="flex items-baseline gap-2">
            Address
            <div className="flex flex-col">
              <span className="text-gray-500">{user.address1}</span>
              <span className="text-gray-500">{user.address2}</span>
              <span className="text-gray-500">
                {user.city}, {user.state} {user.zip}
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            Phone
            <span className="text-gray-500">{user.phone}</span>
          </div>
          <div className="flex items-baseline gap-2">
            Birthday
            {!sensitive ? (
              <Spinner size={16} />
            ) : (
              <span className="text-gray-500">{new Date(sensitive.dob).toLocaleDateString()}</span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            Tax ID
            {!sensitive ? (
              <Spinner size={16} />
            ) : (
              <span className="text-gray-500">
                <HiddenTaxId taxId={sensitive.taxId} />
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex w-full justify-between">
        <Button
          className="!px-10"
          color="neutral"
          outlined
          disabled={!previousStep}
          onClick={previousStep}
        >
          Back
        </Button>
        <Button className="!px-10" color="accent" disabled={!nextStep} onClick={nextStep}>
          Next
        </Button>
      </div>
    </>
  )
}
