import api from '@/_api/client'
import { PasskeyLoginError } from '@/_api/passkeys/_types'
import Button from '@/_components/Button'
import { Dialog } from '@headlessui/react'
import { KeyRound, X } from 'lucide-react'
import { useState } from 'react'
import { RegisterPasskeyStep, type RegisterPasskeyStepProps } from './RegisterPasskey'

let globalTest: Promise<void> | null = null

async function test({ setStep, setFailureReason, credentialId }: RegisterPasskeyStepProps) {
  if (!credentialId) {
    setStep(RegisterPasskeyStep.Failure)
    setFailureReason(
      'An internal error occurred. Please contact the server administrator for assistance.',
    )
    return
  }

  // 1. Let options be a new PublicKeyCredentialRequestOptions structure
  //    configured to the Relying Party's needs for the ceremony.
  const result = await api.passkeys.beginTest(credentialId)
  if (!result.ok) {
    setStep(RegisterPasskeyStep.Failure)
    setFailureReason(result.error)
    return
  }
  const options = result.value
  // revive number[] to Uint8Array
  options.challenge = new Uint8Array(options.challenge as any)
  options.allowCredentials?.forEach((credential) => {
    credential.id = new Uint8Array(credential.id as any)
  })

  try {
    // 2. Call navigator.credentials.get() and pass options as the publicKey
    //    option. Let credential be the result of the successfully resolved
    //    promise.
    const credential = await navigator.credentials.get({ publicKey: options })
    if (!credential || !(credential instanceof PublicKeyCredential)) {
      setStep(RegisterPasskeyStep.Failure)
      setFailureReason(
        'The browser returned an invalid credential. Try registering your passkey again or using a different device.',
      )
      return
    }
    // 3. Let response be credential.response. If response is not an instance of
    //    AuthenticatorAssertionResponse, abort the ceremony with a user-visible
    //    error.
    const { response } = credential
    if (!(response instanceof AuthenticatorAssertionResponse)) {
      setStep(RegisterPasskeyStep.Failure)
      setFailureReason(
        'The browser returned an invalid response. Try registering your passkey again or using a different device.',
      )
      return
    }
    // 4. Let clientExtensionResults be the result of calling
    //    credential.getClientExtensionResults().
    // const clientExtensionResults = credential.getClientExtensionResults()
    // (not used)

    // Steps 5 and onward are handled by the server.
    const result = await api.passkeys.test({
      challengeId: options.challengeId,
      id: credential.id,
      type: credential.type,
      authenticatorDataBuffer: Array.from(new Uint8Array(response.authenticatorData)),
      clientDataBuffer: Array.from(new Uint8Array(response.clientDataJSON)),
      signatureBuffer: Array.from(new Uint8Array(response.signature)),
      userHandleBuffer: response.userHandle
        ? Array.from(new Uint8Array(response.userHandle))
        : null,
    })

    if (!result.ok) {
      setStep(RegisterPasskeyStep.Failure)
      switch (result.error) {
        case PasskeyLoginError.ChallengeMismatch:
          setFailureReason(
            'The browser returned an invalid challenge response. Try registering your passkey again or using a different device.',
          )
          break
        case PasskeyLoginError.InvalidData:
          setFailureReason(
            'The browser returned an invalid response. Try registering your passkey again or using a different device.',
          )
          break
        case PasskeyLoginError.PasskeyNotFound:
          setFailureReason(
            'The browser returned an invalid credential. Try registering your passkey again or using a different device.',
          )
          break
        case PasskeyLoginError.ServerError:
          setFailureReason(
            'The server encountered an error. Try registering your passkey again or using a different device.',
          )
          break
        case PasskeyLoginError.Unauthorized:
          setFailureReason(
            'The server rejected your passkey. Try registering your passkey again or using a different device.',
          )
          break
        case PasskeyLoginError.UnsupportedDevice:
          setFailureReason(
            'Your device may not be supported. Try registering your passkey again or using a different device.',
          )
          break
        case PasskeyLoginError.VerificationFailed:
          setFailureReason(
            'The credential could not prove its authenticity. Try registering your passkey again or using a different device.',
          )
          break
      }
      return
    }

    setStep(RegisterPasskeyStep.Nickname)
  } catch (err) {
    // 2. (continued) If the promise is rejected, abort the ceremony with a
    //    user-visible error, or otherwise guide the user experience as might be
    //    determinable from the context available in the rejected promise. For
    //    information on different error contexts and the circumstances leading to
    //    them, see § 6.3.3 The authenticatorGetAssertion Operation.
    if (!(err instanceof DOMException)) return
    setStep(RegisterPasskeyStep.Failure)
    if (err.name === 'InvalidStateError') {
      setFailureReason(
        'The browser reported an invalid state error. Try registering your passkey again or using a different device.',
      )
    } else if (err.name === 'NotAllowedError') {
      setFailureReason(
        'The operation timed out or the browser denied access to the authenticator. Try registering your passkey again or using a different device.',
      )
    } else {
      setFailureReason(err.message)
    }
  }
}

export default function RegisterPasskeyTesting(props: RegisterPasskeyStepProps): JSX.Element {
  const [loading, setLoading] = useState(false)
  const { setStep, setOpen } = props

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
        Your passkey was registered successfully. Now, we will test your passkey to make sure it
        works.
      </p>
      <p>
        Click the button below to begin the test. Follow the on-screen instructions to complete the
        test.
      </p>

      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={() => {
            setStep(RegisterPasskeyStep.Nickname)
          }}
          small
          minimal
          disabled={loading}
          color="danger"
        >
          Skip
        </Button>
        <Button
          onClick={() => {
            setLoading(true)
            const beginTest = async () => {
              await test(props)
              globalTest = null
            }

            if (globalTest) return
            globalTest = beginTest()
            setLoading(false)
          }}
          loading={loading}
          small
          color="accent"
        >
          Test passkey
        </Button>
      </div>
    </>
  )
}
