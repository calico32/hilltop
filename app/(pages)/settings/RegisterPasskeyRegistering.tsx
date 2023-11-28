import api from '@/_api/client'
import { PasskeyRegistrationError } from '@/_api/types'
import Button from '@/_components/Button'
import { Dialog } from '@headlessui/react'
import { Loader2, X } from 'lucide-react'
import { useEffect } from 'react'
import { RegisterPasskeyStep, type RegisterPasskeyStepProps } from './RegisterPasskey'

// Numbered statements refer to the following section of the WebAuthn spec:
// https://w3c.github.io/webauthn/#sctn-registering-a-new-credential

let globalRegistration: Promise<void> | null = null

async function register({ setStep, setFailureReason, setCredentialId }: RegisterPasskeyStepProps) {
  // 1. Let options be a new PublicKeyCredentialCreationOptions structure
  //    configured to the Relying Party's needs for the ceremony.
  const result = await api.beginPasskeyRegistration()
  if (!result.ok) {
    setStep(RegisterPasskeyStep.Failure)
    setFailureReason(result.error)
    return
  }
  const options = result.value
  // revive number[]s to Uint8Arrays
  options.challenge = new Uint8Array(options.challenge as any)
  options.user.id = new Uint8Array(options.user.id as any)
  options.excludeCredentials = options.excludeCredentials?.map((credential) => ({
    ...credential,
    id: new Uint8Array(credential.id as any),
  }))

  // 2. Call navigator.credentials.create() and pass options as the publicKey
  //    option. Let credential be the result of the successfully resolved
  //    promise.
  try {
    const credential = await navigator.credentials.create({ publicKey: options })
    if (!credential || !(credential instanceof PublicKeyCredential)) {
      setStep(RegisterPasskeyStep.Failure)
      setFailureReason(
        'The browser returned an invalid credential. Try registering your passkey again or using a different device.'
      )
      return
    }
    // 3. Let response be credential.response. If response is not an instance of
    //    AuthenticatorAttestationResponse, abort the ceremony with a user-visible
    //    error.
    const { response } = credential
    if (!(response instanceof AuthenticatorAttestationResponse)) {
      setStep(RegisterPasskeyStep.Failure)
      setFailureReason(
        'The browser returned an invalid response. Try registering your passkey again or using a different device.'
      )
      return
    }
    // 4. Let clientExtensionResults be the result of calling
    //    credential.getClientExtensionResults().
    // const clientExtensionResults = credential.getClientExtensionResults()
    // (not used)

    // Steps 5 and onward are handled by the server.
    const result = await api.registerPasskey({
      challengeId: options.challengeId,
      id: credential.id,
      type: credential.type,
      attestationObjectBuffer: Array.from(new Uint8Array(response.attestationObject)),
      clientDataBuffer: Array.from(new Uint8Array(response.clientDataJSON)),
      transports: response.getTransports(),
    })

    if (!result.ok) {
      setStep(RegisterPasskeyStep.Failure)
      switch (result.error) {
        case PasskeyRegistrationError.ChallengeMismatch:
          setFailureReason(
            'The browser returned an invalid challenge response. Try registering your passkey again or using a different device.'
          )
          break
        case PasskeyRegistrationError.InvalidData:
          setFailureReason(
            'The browser returned an invalid response. Try registering your passkey again or using a different device.'
          )
          break
        case PasskeyRegistrationError.PasskeyExists:
          setFailureReason(
            'This passkey has already been registered. Try using a different device.'
          )
          break
        case PasskeyRegistrationError.ServerError:
          setFailureReason(
            'The server encountered an error. Try registering your passkey again or using a different device.'
          )
          break
        case PasskeyRegistrationError.Unauthorized:
          setFailureReason(
            'The server rejected the request. Try registering your passkey again or using a different device.'
          )
          break
        case PasskeyRegistrationError.UnsupportedDevice:
          setFailureReason(
            'Your device may not be supported. Try registering your passkey again or using a different device.'
          )
          break
      }
      return
    }

    setCredentialId(credential.id)
    setStep(RegisterPasskeyStep.Testing)
  } catch (err) {
    // 2. (continued)  If the promise is rejected, abort the ceremony with a
    //    user-visible error, or otherwise guide the user experience as might
    //    be determinable from the context available in the rejected promise.
    //    For example if the promise is rejected with an error code equivalent
    //    to "InvalidStateError", the user might be instructed to use a
    //    different authenticator. For information on different error contexts
    //    and the circumstances leading to them, see § 6.3.2 The
    //    authenticatorMakeCredential Operation.
    if (!(err instanceof DOMException)) return
    setStep(RegisterPasskeyStep.Failure)
    if (err.name === 'InvalidStateError') {
      setFailureReason(
        'The browser reported an invalid state error. Try registering your passkey again or using a different device.'
      )
    } else if (err.name === 'NotAllowedError') {
      setFailureReason(
        'The operation timed out or the browser denied access to the authenticator. Try registering your passkey again or using a different device.'
      )
    } else {
      setFailureReason(err.message)
    }
  }
}

export default function RegisterPasskeyRegistering(props: RegisterPasskeyStepProps): JSX.Element {
  const { setOpen, setStep, setFailureReason } = props

  useEffect(() => {
    const beginRegistration = async () => {
      await register(props)
      globalRegistration = null
    }

    if (globalRegistration) return
    globalRegistration = beginRegistration()
  }, [])
  return (
    <>
      <div className="flex items-center justify-between">
        <Dialog.Title className="text-2xl font-semibold">Register new passkey</Dialog.Title>

        <button onClick={() => setOpen(false)}>
          <X size={24} />
        </button>
      </div>

      <Loader2 size={48} className="mx-auto my-4 animate-spin" />

      <p>Follow the on-screen instructions to complete the registration.</p>

      <div className="flex gap-4 items-center justify-center">
        <Button
          onClick={() => {
            setStep(RegisterPasskeyStep.Failure)
            setFailureReason('The registration was cancelled.')
          }}
          small
          minimal
          color="danger"
        >
          Cancel
        </Button>
      </div>
    </>
  )
}
