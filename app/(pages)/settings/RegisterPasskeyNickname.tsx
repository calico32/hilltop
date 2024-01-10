import api from '@/_api/client'
import Button from '@/_components/Button'
import styles from '@/_components/Input.module.css'
import { Dialog } from '@headlessui/react'
import clsx from 'clsx'
import { KeyRound, X } from 'lucide-react'
import { useState } from 'react'
import { RegisterPasskeyStep, type RegisterPasskeyStepProps } from './RegisterPasskey'

export default function RegisterPasskeyNickname({
  setOpen,
  setStep,
  setFailureReason,
  credentialId,
}: RegisterPasskeyStepProps): JSX.Element {
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)

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
        Would you like to give your passkey a nickname? This will help you identify your passkey
        later.
      </p>

      <div className={clsx(styles.inputWrapper)}>
        <input
          className={clsx(styles.input)}
          type="text"
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={() => {
            setStep(RegisterPasskeyStep.Success)
          }}
          small
          minimal
          color="danger"
        >
          Skip
        </Button>
        <Button
          onClick={async () => {
            if (!credentialId) {
              setStep(RegisterPasskeyStep.Failure)
              setFailureReason('An internal error occurred. Please try again later.')
              return
            }
            const res = await api.passkeys.nickname(credentialId, nickname)
            if (!res.ok) {
              setStep(RegisterPasskeyStep.Failure)
              setFailureReason(res.error)
            } else {
              setStep(RegisterPasskeyStep.Success)
            }
          }}
          small
          loading={loading}
          color="accent"
        >
          Set nickname
        </Button>
      </div>
    </>
  )
}
