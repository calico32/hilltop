'use client'

import api from '@/_api/client'
import { LoginError, PasskeyLoginError } from '@/_api/types'
import Button from '@/_components/Button'
import Input from '@/_components/Input'
import { KeyRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface LoginFormValues {
  email: string
  password: string
}

export default function LoginForm(): JSX.Element {
  const router = useRouter()
  const [passkeyLoading, setPasskeyLoading] = useState(false)
  const [passkeyError, setPasskeyError] = useState<string | null>(null)
  const form = useForm<LoginFormValues>()
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    // instead of:
    // const response = await fetch('/api/login', { method: 'POST',        body: JSON.stringify(data) })
    //                               ^ not type-safe        ^ not type-safe      ^ not type-safe
    // const result = await response.json()
    //                      ^ not type-safe, can throw errors

    // we can do:
    const result = await api.login(data.email, data.password)
    //    ^ Result<User, LoginError>

    if (!result.ok) {
      switch (result.error) {
        case LoginError.ServerError:
          toast.error('An error occurred while logging in. Please try again later.')
          break
        case LoginError.InvalidCredentials:
          toast.error('The email or password you entered is incorrect.')
          break
      }
      return
    }

    await api.$mutate('getUser', [], result.value)
    toast.success('Successfully logged in!')
    router.push('/dashboard')
  }

  return (
    <>
      <Button
        unstyled
        className="flex items-center justify-center w-full gap-4 p-3 font-semibold text-white rounded-md bg-navyblue-0 hover:brightness-125"
        loading={passkeyLoading}
        onClick={async () => {
          setPasskeyLoading(true)
          const success = await passkeyLogin({ setPasskeyError })
          setPasskeyLoading(false)
          if (success) {
            await api.$mutate('getUser', [], null)
            toast.success('Successfully logged in!')
            router.push('/dashboard')
          }
        }}
      >
        <KeyRound strokeWidth={1.5} />
        <span>Sign in with Passkey</span>
      </Button>
      {passkeyError && <p className="text-red-600 -mt-2">{passkeyError}</p>}
      <div className="flex items-center w-full gap-2">
        <hr className="flex-grow border-gray-400" />
        <span className="tracking-wider text-gray-400">OR</span>
        <hr className="flex-grow border-gray-400" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full gap-4">
        <FormProvider {...form}>
          <div className="flex flex-col w-full">
            <label htmlFor="email" className="text-lg font-semibold">
              Email
            </label>
            <Input<LoginFormValues>
              name="email"
              type="email"
              autoComplete="email"
              rules={{ required: 'An email is required.' }}
            />
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="password" className="text-lg font-semibold">
              Password
            </label>
            <Input<LoginFormValues>
              name="password"
              type="password"
              autoComplete="current-password"
              rules={{ required: 'A password is required.' }}
            />
          </div>

          <Button
            loading={isSubmitting}
            large
            color="accent"
            type="submit"
            className="self-center p-3 px-10 mt-2 text-xl font-semibold rounded-md w-max"
            disabled={isSubmitting}
          >
            Sign in
          </Button>
        </FormProvider>
      </form>
    </>
  )
}

async function passkeyLogin({
  setPasskeyError,
}: {
  setPasskeyError: (error: string | null) => void
}) {
  // 1. Let options be a new PublicKeyCredentialRequestOptions structure
  //    configured to the Relying Party's needs for the ceremony.
  const options = await api.beginPasskeyLogin()
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
      setPasskeyError(
        'The browser returned an invalid credential. Please try again or use a different device.'
      )
      return
    }
    // 3. Let response be credential.response. If response is not an instance of
    //    AuthenticatorAssertionResponse, abort the ceremony with a user-visible
    //    error.
    const { response } = credential
    if (!(response instanceof AuthenticatorAssertionResponse)) {
      setPasskeyError(
        'The browser returned an invalid response. Please try again or use a different device.'
      )
      return
    }
    // 4. Let clientExtensionResults be the result of calling
    //    credential.getClientExtensionResults().
    // const clientExtensionResults = credential.getClientExtensionResults()
    // (not used)

    // Steps 5 and onward are handled by the server.
    const result = await api.passkeyLogin({
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
      switch (result.error) {
        case PasskeyLoginError.ChallengeMismatch:
          setPasskeyError(
            'The browser returned an invalid challenge response. Try again or using a different device.'
          )
          break
        case PasskeyLoginError.InvalidData:
          setPasskeyError(
            'The browser returned an invalid response. Try again or using a different device.'
          )
          break
        case PasskeyLoginError.PasskeyNotFound:
          setPasskeyError(
            'The browser returned an invalid credential. Try again or using a different device.'
          )
          break
        case PasskeyLoginError.ServerError:
          setPasskeyError('The server encountered an error. Try again or using a different device.')
          break
        case PasskeyLoginError.Unauthorized:
          setPasskeyError(
            'The server rejected your passkey. Try again or using a different device.'
          )
          break
        case PasskeyLoginError.UnsupportedDevice:
          setPasskeyError(
            'Your device may not be supported. Try again or using a different device.'
          )
          break
        case PasskeyLoginError.VerificationFailed:
          setPasskeyError(
            'The credential could not prove its authenticity. Try again or using a different device.'
          )
          break
      }
      return false
    }

    return true
  } catch (err) {
    // 2. (continued) If the promise is rejected, abort the ceremony with a
    //    user-visible error, or otherwise guide the user experience as might be
    //    determinable from the context available in the rejected promise. For
    //    information on different error contexts and the circumstances leading to
    //    them, see § 6.3.3 The authenticatorGetAssertion Operation.
    if (!(err instanceof DOMException)) return
    if (err.name === 'InvalidStateError') {
      setPasskeyError(
        'The browser reported an invalid state error. Try again or using a different device.'
      )
    } else if (err.name === 'NotAllowedError') {
      setPasskeyError(
        'The operation timed out or the browser denied access to the authenticator. Try again or using a different device.'
      )
    } else {
      setPasskeyError(err.message)
    }
    return false
  }
}
