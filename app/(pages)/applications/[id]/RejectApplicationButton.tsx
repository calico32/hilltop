'use client'

import { FullApplication } from '@/_api/applications'
import Button from '@/_components/Button'
import { avatar, fullName } from '@/_lib/format'
import { Dialog, Transition } from '@headlessui/react'
import { UserSquare, X } from 'lucide-react'
import Image from 'next/image'
import { Fragment, useEffect, useRef, useState } from 'react'

export default function RejectApplicationButton({
  application,
}: {
  application: FullApplication
}): JSX.Element {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const rejectReasonRef = useRef<HTMLTextAreaElement>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectReasonError, setRejectReasonError] = useState('')
  const [lastStepCountdown, setLastStepCountdown] = useState(10)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (step === 1 && lastStepCountdown > 0) {
      const timeout = setTimeout(() => {
        setLastStepCountdown(lastStepCountdown - 1)
      }, 1000)

      return () => clearTimeout(timeout)
    }
  }, [step, lastStepCountdown])

  function reset() {
    setStep(0)
    setRejectReason('')
    setRejectReasonError('')
    setLastStepCountdown(10)
  }

  function closeDialog() {
    setOpen(false)
    setTimeout(reset, 300)
  }

  return (
    <>
      <Button
        color="danger"
        className="flex gap-2"
        onClick={() => {
          setOpen(true)
        }}
      >
        <X />
        Reject
      </Button>
      <Transition show={open} as={Fragment}>
        <Dialog
          onClose={() => {
            closeDialog()
          }}
          as="div"
          className="relative z-20"
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-100"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-150"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="transform overflow-hidden bg-white rounded-md p-6 z-50 max-w-md sm:w-[28rem] flex flex-col gap-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-2xl font-semibold">
                      Reject Application
                    </Dialog.Title>

                    <button onClick={closeDialog}>
                      <X size={24} />
                    </button>
                  </div>

                  <div className="flex gap-8 my-4 items-center justify-center">
                    <UserSquare size={72} strokeWidth={1.5} className="text-red-600" />

                    <Image
                      src={avatar(application.user, { size: 144 })}
                      alt=""
                      width={72}
                      height={72}
                      className="rounded-full"
                    />
                  </div>

                  {step === 0 ? (
                    <>
                      <p>
                        You are about to reject an application from{' '}
                        <strong>{fullName(application.user)}</strong> for the position of{' '}
                        <strong>{application.listing.title}</strong>.
                      </p>

                      <p>
                        Please enter the reason for rejecting this application. This will not be
                        shared with the applicant.
                      </p>

                      <textarea
                        className="p-2 border border-gray-300 rounded-md"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        ref={rejectReasonRef}
                      />

                      {rejectReasonError && (
                        <p className="text-red-600 -mt-2">{rejectReasonError}</p>
                      )}

                      <div className="flex gap-4 items-center justify-center">
                        <Button onClick={closeDialog} minimal color="neutral">
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            if (rejectReason.length < 10) {
                              setRejectReasonError(
                                'Please enter a reason with at least 10 characters.'
                              )
                              rejectReasonRef.current?.focus()
                              return
                            }

                            setStep(1)
                          }}
                          color="danger"
                        >
                          Review
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        You are about to reject an application from{' '}
                        <strong>{fullName(application.user)}</strong> for the position of{' '}
                        <strong>{application.listing.title}</strong> with the following reason:
                      </p>

                      <blockquote className="border-l-4 border-red-600 pl-4 my-4">
                        {rejectReason}
                      </blockquote>

                      <p>
                        Are you sure you want to reject this application? This decision will be sent
                        to the applicant and cannot be undone.
                      </p>

                      <div className="flex gap-4 items-center justify-center">
                        <Button
                          onClick={() => {
                            closeDialog()
                          }}
                          minimal
                          color="neutral"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={async () => {
                            setLoading(true)
                            setLoading(false)
                          }}
                          loading={loading}
                          disabled={lastStepCountdown > 0}
                          color="danger"
                        >
                          {lastStepCountdown > 0 ? lastStepCountdown : 'Reject'}
                        </Button>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
