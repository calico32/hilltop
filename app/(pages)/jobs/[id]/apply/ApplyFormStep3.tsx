'use client'

import api from '@/_api/client'
import Button from '@/_components/Button'
import Spinner from '@/_components/Spinner'
import { JobListing } from '@prisma/client'

interface ApplyFormStep3Props {
  listing: JobListing
  nextStep?: () => void
  previousStep?: () => void
  goToStep?: (step: number) => void
}

export default function ApplyFormStep3({
  nextStep,
  previousStep,
  listing,
}: ApplyFormStep3Props): JSX.Element {
  const { data: questions, isLoading } = api.listings.$use('getQuestions', listing.id)

  return (
    <>
      <h1 className="text-3xl font-semibold">Answer application questions</h1>

      {isLoading ? (
        <Spinner size={32} />
      ) : (
        <div className="flex flex-col gap-4">
          {questions?.map((question) => (
            <div key={question.question} className="flex flex-col gap-2">
              <label className="font-semibold">
                {question.question}
                {question.required && <span className="text-red-500">*</span>}
              </label>
              <textarea
                className="h-32 w-full rounded-md border border-gray-400 p-3"
                placeholder="Type your answer here..."
              />
            </div>
          ))}
        </div>
      )}

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
