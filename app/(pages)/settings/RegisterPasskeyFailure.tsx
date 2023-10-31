import Button from '@/_components/Button'
import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'
import { RegisterPasskeyStep, type RegisterPasskeyStepProps } from './RegisterPasskey'

export default function RegisterPasskeyFailure({
  setOpen,
  setStep,
  failureReason,
}: RegisterPasskeyStepProps): JSX.Element {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Dialog.Title className="text-2xl font-semibold">Register new passkey</Dialog.Title>

        <button onClick={() => setOpen(false)}>
          <X size={24} />
        </button>
      </div>

      <X size={48} className="mx-auto my-4 text-red-500" />

      <p>Passkey registration failed.</p>

      <p>{failureReason}</p>

      <div className="flex gap-4 items-center justify-center">
        <Button
          onClick={() => {
            setOpen(false)
          }}
          small
          minimal
          color="danger"
        >
          Close
        </Button>
        <Button
          onClick={() => {
            setStep(RegisterPasskeyStep.Registering)
          }}
          small
          color="accent"
        >
          Retry
        </Button>
      </div>
    </>
  )
}
