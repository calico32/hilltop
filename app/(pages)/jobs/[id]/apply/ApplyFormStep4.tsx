'use client'

import Button from '@/_components/Button'
import { JobListing } from '@prisma/client'

interface ApplyFormStep4Props {
  listing: JobListing
  nextStep?: () => void
  previousStep?: () => void
  goToStep?: (step: number) => void
}

export default function ApplyFormStep4({
  nextStep,
  previousStep,
  listing,
  goToStep,
}: ApplyFormStep4Props): JSX.Element {
  return (
    <>
      <h1 className="text-3xl font-semibold">Review your application</h1>

      <p className="mb-0">
        You may return to any previous section to make changes before submitting your application.
      </p>

      <div className="!mt-0 flex flex-col gap-1">
        <Button className="!mt-8 font-normal" color="accent" outlined onClick={() => goToStep?.(0)}>
          Return to <span className="font-semibold">Personal Information</span>
        </Button>
        <Button className="!mt-4 font-normal" color="accent" outlined onClick={() => goToStep?.(1)}>
          Return to <span className="font-semibold">Upload Resume</span>
        </Button>
        <Button className="!mt-4 font-normal" color="accent" outlined onClick={() => goToStep?.(2)}>
          Return to <span className="font-semibold">Additional Questions</span>
        </Button>
      </div>

      <h2>
        Click the "Submit" button to submit your application for the{' '}
        <span className="font-semibold">{listing.title}</span> position at{' '}
        <span className="font-semibold">Lantern Hill</span>.
      </h2>

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
          Submit
        </Button>
      </div>
    </>
  )
}
