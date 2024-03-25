'use client'

import Button from '@/_components/Button'
import { JobListing } from '@prisma/client'
import { File, UploadCloud } from 'lucide-react'

interface ApplyFormStep2Props {
  listing: JobListing
  nextStep?: () => void
  previousStep?: () => void
  goToStep?: (step: number) => void
}

export default function ApplyFormStep2({
  nextStep,
  previousStep,
}: ApplyFormStep2Props): JSX.Element {
  return (
    <>
      <h1 className="text-3xl font-semibold">Upload a resume</h1>

      <div className="flex w-max flex-col gap-1 rounded-md border border-gray-400 bg-gray-100 p-2 pl-3 pr-4">
        <div className="flex items-center gap-4">
          <File size={36} strokeWidth={1.2} />
          <div className="flex flex-grow flex-col">
            <div className="font-semibold">Click to browse...</div>
            <div className="text-sm text-gray-700">
              Accepted types: PDF, DOCX, DOC, TXT, RTF • Max size: 5MB
            </div>
          </div>

          <button className="cursor-pointer text-blue-500 hover:text-blue-700">
            <UploadCloud strokeWidth={1.5} />
          </button>
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
