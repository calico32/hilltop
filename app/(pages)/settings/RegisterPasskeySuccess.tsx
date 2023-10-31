import Button from '@/_components/Button'
import { Dialog } from '@headlessui/react'
import { Check, X } from 'lucide-react'
import { type RegisterPasskeyStepProps } from './RegisterPasskey'

export default function RegisterPasskeySuccess({
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

      <Check size={48} className="mx-auto my-4 text-emeraldgreen-1" />

      <p>
        Your passkey was successfully registered! You can now use your passkey to log in to your
        account without your password.
      </p>

      <div className="flex gap-4 items-center justify-center">
        <Button
          onClick={() => {
            setOpen(false)
          }}
          small
          minimal
          color="accent"
        >
          Close
        </Button>
      </div>
    </>
  )
}
