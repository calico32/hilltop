import { ActionError } from '@/_api/types'
import { Enum } from 'kiyoi'

/**
 * Represents the possible errors that can occur during passkey registration.
 */
export type PasskeyRegistrationError = Enum<typeof PasskeyRegistrationError>
export const PasskeyRegistrationError = Enum(ActionError, {
  InvalidData: 'InvalidData',
  ChallengeMismatch: 'ChallengeMismatch',
  PasskeyExists: 'PasskeyExists',
  UnsupportedDevice: 'UnsupportedDevice',
})

/**
 * Represents the possible errors that can occur during passkey login.
 */
export type PasskeyLoginError = Enum<typeof PasskeyLoginError>
export const PasskeyLoginError = Enum(ActionError, {
  InvalidData: 'InvalidData',
  ChallengeMismatch: 'ChallengeMismatch',
  PasskeyNotFound: 'PasskeyNotFound',
  UnsupportedDevice: 'UnsupportedDevice',
  VerificationFailed: 'VerificationFailed',
})

export interface PasskeyCreateOptions extends PublicKeyCredentialCreationOptions {
  challengeId: string
  expires: number
}

export interface PasskeyRegistrationData {
  challengeId: string
  /** `PublicKeyCredential#id` */
  id: string
  /** `PublicKeyCredential#type` */
  type: string
  /** `PublicKeyCredential#response.clientDataJSON` */
  clientDataBuffer: Iterable<number>
  /** `PublicKeyCredential#response.attestationObject` */
  attestationObjectBuffer: Iterable<number>
  /** `PublicKeyCredential#response.getTransports()` */
  transports: string[]
}

export interface PasskeyRequestOptions extends PublicKeyCredentialRequestOptions {
  challengeId: string
}

export interface PasskeyLoginData {
  challengeId: string
  /** `PublicKeyCredential#id` */
  id: string
  /** `PublicKeyCredential#type` */
  type: string
  /** `PublicKeyCredential#response.authenticatorData` */
  authenticatorDataBuffer: Iterable<number>
  /** `PublicKeyCredential#response.clientDataJSON` */
  clientDataBuffer: Iterable<number>
  /** `PublicKeyCredential#response.signature` */
  signatureBuffer: Iterable<number>
  /** `PublicKeyCredential#response.userHandle` */
  userHandleBuffer?: Iterable<number> | null
}
