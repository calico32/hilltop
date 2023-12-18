import { Role } from '@prisma/client'
import { decodeMultiple as cborDecodeMultiple } from 'cbor-x'
import { Enum } from 'kiyoi'
import z from 'zod'

export type UserSession = {
  userId: string
  role: Role
  expires: number
}

/**
 * Enum representing possible errors that can occur during an action.
 */
export type ActionError = Enum<typeof ActionError>
export const ActionError = Enum({
  ServerError: 'ServerError',
  Unauthorized: 'Unauthorized',
  NotFound: 'NotFound',
  BadRequest: 'BadRequest',
  InvalidState: 'InvalidState',
})

/**
 * Data stored in the reset password token. This is encrypted and sent to the
 * user in an email, and thus does not have to be stored in the database.
 */
export interface PasswordResetData {
  /**
   * The user's ID, used to identify the user when resetting their password
   */
  id: string

  /**
   * The millisecond timestamp at which the reset password link expires.
   */
  expires: number

  /**
   * SHA256 hash of the user's password hash at the time of the request. This
   * ensures that the user has not changed their password since the request was
   * made (so each reset password link can only be used once)
   */
  hash: string
}

export interface VerifyEmailData {
  /**
   * The user's ID, used to identify the user when resetting their password
   */
  id: string

  /**
   * The user's email address at the time of the request. This ensures that the
   * email that is being verified is the same one that was sent the verification
   */
  email: string

  /**
   * The millisecond timestamp at which the reset password link expires.
   */
  expires: number
}

/**
 * Represents the possible errors that can occur during a password reset.
 */
export type PasswordResetError = Enum<typeof PasswordResetError>
export const PasswordResetError = Enum(ActionError, {
  InvalidToken: 'InvalidToken',
  ExpiredToken: 'ExpiredToken',
  PasswordMismatch: 'PasswordMismatch',
})

/**
 * Enum representing errors that can occur when sending a verification email.
 */
export type SendVerificationEmailError = Enum<typeof SendVerificationEmailError>
export const SendVerificationEmailError = Enum(ActionError, {
  SendEmailFailed: 'SendEmailFailed',
  AlreadyVerified: 'AlreadyVerified',
})

/**
 * Represents an error that can occur during email verification.
 */
export type VerifyEmailError = Enum<typeof VerifyEmailError>
export const VerifyEmailError = Enum(ActionError, {
  InvalidToken: 'InvalidToken',
  ExpiredToken: 'ExpiredToken',
  EmailMismatch: 'EmailMismatch',
  AlreadyVerified: 'AlreadyVerified',
})

/**
 * Represents the possible errors that can occur during a login attempt.
 */
export type LoginError = Enum<typeof LoginError>
export const LoginError = Enum(ActionError, {
  InvalidCredentials: 'InvalidCredentials',
})

/**
 * Represents the data required to register a user.
 */
export type RegisterData = z.infer<typeof RegisterData>
export const RegisterData = z.object({
  firstName: z.string(),
  middleInitial: z.string().length(1).optional(),
  lastName: z.string(),
  preferredName: z.string().optional(),

  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  taxId: z.string().regex(/^\d{3}-\d{2}-\d{4}$/),

  phone: z.string().regex(/^\d{10}$/),
  email: z.string().email(),

  address1: z.string(),
  address2: z.string().optional(),
  city: z.string(),
  state: z.string().length(2),
  zip: z.string().regex(/^\d{5}$/),

  password: z.string().min(8),
  confirmPassword: z.string().min(8),

  terms: z.boolean(),
  privacy: z.boolean(),
  disclaimer: z.boolean(),
  emailUpdates: z.boolean(),
})

/**
 * Enum representing the possible errors that can occur during registration.
 */
export type RegisterError = Enum<typeof RegisterError>
export const RegisterError = Enum(ActionError, {
  InvalidData: 'InvalidData',
  EmailExists: 'EmailExists',
  TermsNotAccepted: 'TermsNotAccepted',
  PasswordMismatch: 'PasswordMismatch',
  SendEmailFailed: 'SendEmailFailed',
})

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

/**
 * Class representing the authenticator data returned by the authenticator. See
 * <https://w3c.github.io/webauthn/#authenticator-data> for more information.
 */
export class AuthenticatorData {
  rpIdHash: Uint8Array
  flags: number
  signCount: number
  attestedCredentialData?: AttestedCredentialData
  extensions?: Uint8Array

  constructor(public data: Buffer) {
    this.rpIdHash = Uint8Array.prototype.slice.call(data, 0, 32)
    this.flags = data[32]
    this.signCount = data.readUInt32BE(33)
    const rest = Buffer.from(Uint8Array.prototype.slice.call(data, 37))
    if (this.attestedCredentialIncluded) {
      ;[this.attestedCredentialData, this.extensions] = parseRest(rest)
    }
  }

  get userPresent(): boolean {
    return (this.flags & (1 << 0)) !== 0
  }

  get userVerified(): boolean {
    return (this.flags & (1 << 2)) !== 0
  }

  get backupEligible(): boolean {
    return (this.flags & (1 << 3)) !== 0
  }

  get backupState(): boolean {
    return (this.flags & (1 << 4)) !== 0
  }

  get attestedCredentialIncluded(): boolean {
    return (this.flags & (1 << 6)) !== 0
  }

  get extensionDataIncluded(): boolean {
    return (this.flags & (1 << 7)) !== 0
  }
}

export interface AttestedCredentialData {
  aaguid: Uint8Array
  credentialIdLength: number
  credentialId: Uint8Array
  credentialPublicKey: Uint8Array
  publicKey: {
    kty: string
    alg: number
    [key: string]: unknown
  }
}

export function parseRest(data: Buffer): [AttestedCredentialData, any] {
  const obj: AttestedCredentialData = {} as AttestedCredentialData
  obj.aaguid = Uint8Array.prototype.slice.call(data, 0, 16)
  obj.credentialIdLength = data.readUInt16BE(16)
  obj.credentialId = Uint8Array.prototype.slice.call(data, 18, 18 + obj.credentialIdLength)
  obj.credentialPublicKey = Uint8Array.prototype.slice.call(data, 18 + obj.credentialIdLength)

  let extensions
    // @ts-ignore cbor-x types are wrong
  ;[obj.publicKey, extensions] = cborDecodeMultiple(obj.credentialPublicKey)

  if (obj.publicKey['3']) {
    obj.publicKey.alg = obj.publicKey['3'] as number
  }

  if (obj.publicKey['1']) {
    obj.publicKey.kty = obj.publicKey['1'] as string
  }

  return [obj, extensions]
}

export interface CollectedClientData {
  /**
   * This member contains the string "webauthn.create" when creating new
   * credentials, and "webauthn.get" when getting an assertion from an existing
   * credential. The purpose of this member is to prevent certain types of
   * signature confusion attacks (where an attacker substitutes one legitimate
   * signature for another).
   */
  type: string
  /**
   * This member contains the base64url encoding of the challenge provided by
   * the [Relying Party](https://w3c.github.io/webauthn/#relying-party). See the
   * [§ 13.4.3 Cryptographic
   * Challenges](https://w3c.github.io/webauthn/#sctn-cryptographic-challenges)
   * security consideration.
   */
  challenge: string
  /**
   * This member contains the fully qualified origin of the requester, as
   * provided to the authenticator by the client, in the syntax defined by
   * [[RFC6454]](https://w3c.github.io/webauthn/#biblio-rfc6454).
   */
  origin: string
  /**
   * This OPTIONAL member contains the fully qualified top-level origin of the
   * requester, in the syntax defined by
   * [[RFC6454]](https://w3c.github.io/webauthn/#biblio-rfc6454). It is set only
   * if the call was made from context that is not same-origin with its
   * ancestors, i.e. if `crossOrigin` is true.
   */
  topOrigin?: string
  crossOrigin?: boolean
}

export interface Attestation {
  authData: Uint8Array
  fmt: string
  attStmt: {
    sig: Uint8Array
    x5c: Uint8Array[]
  }
}

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
