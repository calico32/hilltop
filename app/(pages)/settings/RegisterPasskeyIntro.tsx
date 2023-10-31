import Button from '@/_components/Button'
import { Dialog } from '@headlessui/react'
import { KeyRound, X } from 'lucide-react'
import { RegisterPasskeyStep, type RegisterPasskeyStepProps } from './RegisterPasskey'

export default function RegisterPasskeyIntro({
  setOpen,
  setStep,
}: RegisterPasskeyStepProps): JSX.Element {
  return (
    <>
      <div className="flex items-center justify-between">
        <Dialog.Title className="text-2xl font-semibold">Register new passkey</Dialog.Title>

        <button onClick={() => setOpen(false)}>
          <X size={24} />
        </button>
      </div>

      <KeyRound size={48} className="mx-auto my-4" />

      <p>
        You are registering a new passkey. This will allow you to log in to your account without a
        password (but you can still use a password if you want to).
      </p>
      <p>
        Click the button below to begin the registration process. Follow the on-screen instructions
        to complete the registration.
      </p>

      <div className="flex gap-4 items-center justify-center">
        <Button
          onClick={() => {
            setOpen(false)
          }}
          small
          minimal
          color="danger"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            setStep(RegisterPasskeyStep.Registering)
          }}
          small
          color="accent"
        >
          Register passkey
        </Button>
      </div>
    </>
  )
}
