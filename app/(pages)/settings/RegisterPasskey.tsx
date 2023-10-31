'use client'

import Button from '@/_components/Button'
import { Dialog, Transition } from '@headlessui/react'
import { Enum } from 'kiyoi'
import { Plus } from 'lucide-react'
import React, { Fragment, useEffect, useState } from 'react'
import RegisterPasskeyFailure from './RegisterPasskeyFailure'
import RegisterPasskeyIntro from './RegisterPasskeyIntro'
import RegisterPasskeyNickname from './RegisterPasskeyNickname'
import RegisterPasskeyRegistering from './RegisterPasskeyRegistering'
import RegisterPasskeySuccess from './RegisterPasskeySuccess'
import RegisterPasskeyTesting from './RegisterPasskeyTesting'

export type RegisterPasskeyStep = Enum<typeof RegisterPasskeyStep>
export const RegisterPasskeyStep = Enum({
  Intro: 'Intro',
  Registering: 'Registering',
  Testing: 'Testing',
  Nickname: 'Nickname',
  Success: 'Success',
  Failure: 'Failure',
})

export interface RegisterPasskeyStepProps {
  setStep: (step: RegisterPasskeyStep) => void
  setOpen: (open: boolean) => void
  failureReason: string | null
  setFailureReason: (reason: string | null) => void
  credentialId: string | null
  setCredentialId: (id: string) => void
}

const steps: Record<RegisterPasskeyStep, React.FC<RegisterPasskeyStepProps>> = {
  [RegisterPasskeyStep.Intro]: RegisterPasskeyIntro,
  [RegisterPasskeyStep.Registering]: RegisterPasskeyRegistering,
  [RegisterPasskeyStep.Failure]: RegisterPasskeyFailure,
  [RegisterPasskeyStep.Testing]: RegisterPasskeyTesting,
  [RegisterPasskeyStep.Nickname]: RegisterPasskeyNickname,
  [RegisterPasskeyStep.Success]: RegisterPasskeySuccess,
}

export default function RegisterPasskeyButton(): JSX.Element {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<RegisterPasskeyStep>(RegisterPasskeyStep.Intro)
  const [failureReason, setFailureReason] = useState<string | null>(null)
  const [credentialId, setCredentialId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(RegisterPasskeyStep.Intro)
      }, 300)
    }
  }, [open])

  useEffect(() => {
    if (step !== RegisterPasskeyStep.Failure) {
      setFailureReason(null)
    }
  }, [step])

  return (
    <>
      <Button
        minimal
        small
        onClick={() => setOpen(true)}
        color="primary"
        className="flex items-center gap-2 !px-4 !py-2"
      >
        <Plus size={20} />
        Register
      </Button>
      <Transition show={open} as={Fragment}>
        <Dialog onClose={() => {}} as="div" className="relative z-20">
          {/*
          Use one Transition.Child to apply one transition to the backdrop...
        */}
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
                  {React.createElement(steps[step], {
                    setStep,
                    setOpen,
                    failureReason,
                    setFailureReason,
                    credentialId,
                    setCredentialId,
                  })}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
