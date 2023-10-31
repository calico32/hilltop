'use server'

import {
  ActionError,
  AuthenticatorData,
  PasskeyLoginError,
  RegisterPasskeyError,
} from '@/_api/types'
import { getRpId, verifySignature } from '@/_api/util'
import { COSEAlgorithm } from '@/_lib/cose'
import { prisma } from '@/_lib/database'
import { fullName } from '@/_lib/name'
import { User } from '@prisma/client'
import { decode as cborDecode } from 'cbor-x'
import crypto from 'crypto'
import { Result, Session, expires } from 'kiyoi'
import { cookies, headers } from 'next/headers'

// Numbered statements in this section refer to the following section of the WebAuthn spec:
// https://w3c.github.io/webauthn/#sctn-registering-a-new-credential

export interface PasskeyCreateOptions extends PublicKeyCredentialCreationOptions {
  challengeId: string
  expires: number
}

export async function beginPasskeyRegistration(): Result.Async<
  PasskeyCreateOptions,
  RegisterPasskeyError
> {
  const session = await Session.get(cookies())
  if (!session.ok) return Result.error(RegisterPasskeyError.Unauthorized)

  const user = await prisma.user.findUnique({ where: { id: session.value.userId } })
  if (!user) return Result.error(RegisterPasskeyError.Unauthorized)

  // 1. Let options be a new PublicKeyCredentialCreationOptions structure
  //    configured to the Relying Party's needs for the ceremony.
  const challenge = await prisma.passkeyChallenge.create({
    data: {
      challenge: crypto.randomBytes(64),
      expires: new Date(Date.now() + 120000),
    },
  })

  const existingPasskeys = await prisma.passkey.findMany({
    where: {
      userId: user.id,
    },
  })

  const options: PasskeyCreateOptions = {
    challengeId: challenge.id,
    challenge: Uint8Array.from(challenge.challenge),
    rp: {
      name: 'Hilltop',
      id: getRpId(headers()),
    },
    user: {
      id: Uint8Array.from(user.id, (c) => c.charCodeAt(0)),
      name: user.email,
      displayName: fullName(user)!,
    },
    pubKeyCredParams: [
      { alg: -8, type: 'public-key' }, // EdDSA
      { alg: -7, type: 'public-key' }, // ES256
      { alg: -257, type: 'public-key' }, // RS256
    ],
    authenticatorSelection: {
      userVerification: 'required',
      residentKey: 'required',
      requireResidentKey: true,
    },
    timeout: 115000,
    attestation: 'direct',
    expires: Date.now() + 115000,
    excludeCredentials: existingPasskeys.map((passkey) => ({
      id: new Uint8Array(Buffer.from(passkey.credentialId, 'hex')),
      type: passkey.type as 'public-key',
    })),
  }

  return Result.ok(options)
}

interface CollectedClientData {
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

interface Attestation {
  authData: Uint8Array
  fmt: string
  attStmt: {
    sig: Uint8Array
    x5c: Uint8Array[]
  }
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

export async function registerPasskey(
  credential: PasskeyRegistrationData
): Result.Async<void, RegisterPasskeyError> {
  const session = await Session.get(cookies())
  if (!session.ok) return Result.error(ActionError.Unauthorized)

  const user = await prisma.user.findUnique({ where: { id: session.value.userId } })
  if (!user) return Result.error(ActionError.Unauthorized)

  // 5. Let [clientDataJSON] be the result of running UTF-8 decode on the value of
  //    response.clientDataJSON.
  const clientDataJSON = Buffer.from(Uint8Array.from(credential.clientDataBuffer)).toString('utf8')

  // 6. Let [clientData], the client data claimed as collected during the credential
  //    creation, be the result of running an implementation-specific JSON
  //    parser on [clientDataJSON].
  const clientData = JSON.parse(clientDataJSON) as CollectedClientData

  // 7. Verify that the value of [clientData].type is webauthn.create.
  if (clientData.type !== 'webauthn.create') {
    return Result.error(RegisterPasskeyError.InvalidData)
  }

  // 8. Verify that the value of [clientData].challenge equals the base64url encoding of
  //    options.challenge.
  const challenge = Buffer.from(clientData.challenge, 'base64url')
  const storedChallenge = await prisma.passkeyChallenge.findUnique({
    where: { id: credential.challengeId },
  })
  if (!storedChallenge || storedChallenge.expires.getTime() < Date.now()) {
    await prisma.passkeyChallenge.deleteMany({ where: { id: credential.challengeId } })
    return Result.error(RegisterPasskeyError.ChallengeMismatch)
  }
  if (!challenge.equals(storedChallenge.challenge)) {
    await prisma.passkeyChallenge.deleteMany({ where: { id: credential.challengeId } })
    return Result.error(RegisterPasskeyError.ChallengeMismatch)
  }
  await prisma.passkeyChallenge.deleteMany({ where: { id: credential.challengeId } })

  // 9. Verify that the value of [clientData].origin is an origin expected by the Relying
  //    Party.
  if (
    clientData.origin !== 'https://hilltop.works' &&
    clientData.origin !== 'http://localhost:3000'
  ) {
    return Result.error(RegisterPasskeyError.InvalidData)
  }

  // 10. If [clientData].topOrigin is present:
  if (clientData.topOrigin) {
    // 1. Verify that the Relying Party expects that this credential would have
    //    been created within an iframe that is not same-origin with its
    //    ancestors.
    return Result.error(RegisterPasskeyError.InvalidData) // we do not allow cross-origin registration
  }

  // 11. Let hash be the result of computing a hash over response.clientDataJSON using SHA-256.
  // const hash = crypto.createHash('sha256').update(Buffer.from(response.clientDataJSON)).digest()

  // 12. Perform CBOR decoding on the attestationObject field of the
  //     AuthenticatorAttestationResponse structure to obtain the attestation
  //     statement format fmt, the authenticator data authData, and the
  //     attestation statement attStmt.
  const {
    authData: authDataBuffer,
    // fmt,
    // attStmt,
  } = cborDecode(Buffer.from(Uint8Array.from(credential.attestationObjectBuffer))) as Attestation
  const authData = new AuthenticatorData(Buffer.from(authDataBuffer))
  if (!authData.attestedCredentialIncluded || !authData.attestedCredentialData)
    return Result.error(RegisterPasskeyError.InvalidData)

  // 13. Verify that the rpIdHash in authData is the SHA-256 hash of the RP ID
  //     expected by the Relying Party.
  const rpIdHash = crypto
    .createHash('sha256')
    .update(Buffer.from(getRpId(headers())))
    .digest()
  if (!Buffer.from(authData.rpIdHash).equals(rpIdHash))
    return Result.error(RegisterPasskeyError.InvalidData)

  // 14. Verify that the UP bit of the flags in authData is set.
  if (!authData.userPresent) return Result.error(RegisterPasskeyError.InvalidData)

  // 15. If the Relying Party requires user verification for this registration,
  //     verify that the UV bit of the flags in authData is set.
  if (!authData.userVerified) return Result.error(RegisterPasskeyError.InvalidData)

  // 16. If the BE bit of the flags in authData is not set, verify that the BS
  //     bit is not set.
  if (!authData.backupEligible && authData.backupState)
    return Result.error(RegisterPasskeyError.InvalidData)

  // 17. If the Relying Party uses the credential’s backup eligibility to inform
  //     its user experience flows and/or policies, evaluate the BE bit of the
  //     flags in authData. (we do not use backup eligibility)
  // 18. If the Relying Party uses the credential’s backup state to inform its
  //     user experience flows and/or policies, evaluate the BS bit of the flags
  //     in authData. (we do not use backup state)

  // 19. Verify that the "alg" parameter in the credential public key in
  //     authData matches the alg attribute of one of the items in
  //     options.pubKeyCredParams.
  const alg = authData.attestedCredentialData.publicKey.alg
  if (![-7, -8, -257].includes(alg)) return Result.error(RegisterPasskeyError.UnsupportedDevice)

  // 20. Verify that the values of the client extension outputs in
  //     clientExtensionResults and the authenticator extension outputs in the
  //     extensions in authData are as expected, considering the client
  //     extension input values that were given in options.extensions and any
  //     specific policy of the Relying Party regarding unsolicited extensions,
  //     i.e., those that were not specified as part of options.extensions. In
  //     the general case, the meaning of "are as expected" is specific to the
  //     Relying Party and which extensions are in use. (we do not use
  //     extensions)

  // 21. Determine the attestation statement format by performing a USASCII
  //     case-sensitive match on fmt against the set of supported WebAuthn
  //     Attestation Statement Format Identifier values. An up-to-date list of
  //     registered WebAuthn Attestation Statement Format Identifier values is
  //     maintained in the IANA "WebAuthn Attestation Statement Format
  //     Identifiers" registry [IANA-WebAuthn-Registries] established by
  //     [RFC8809].
  // 22. Verify that attStmt is a correct attestation statement, conveying a
  //     valid attestation signature, by using the attestation statement format
  //     fmt’s verification procedure given attStmt, authData and hash.
  // 23. If validation is successful, obtain a list of acceptable trust anchors
  //     (i.e. attestation root certificates) for that attestation type and
  //     attestation statement format fmt, from a trusted source or from policy.
  //     For example, the FIDO Metadata Service [FIDOMetadataService] provides
  //     one way to obtain such information, using the aaguid in the
  //     attestedCredentialData in authData.
  // 24. Assess the attestation trustworthiness using the outputs of the
  //     verification procedure in step 21, as follows:
  //     - If no attestation was provided, verify that None attestation is
  //       acceptable under Relying Party policy.
  //     - If self attestation was used, verify that self attestation is
  //       acceptable under Relying Party policy.
  //     - Otherwise, use the X.509 certificates returned as the attestation
  //       trust path from the verification procedure to verify that the
  //       attestation public key either correctly chains up to an acceptable
  //       root certificate, or is itself an acceptable certificate (i.e., it
  //       and the root certificate obtained in Step 22 may be the same).

  // TODO: implement attestation verification

  // 25. Verify that the credentialId is ≤ 1023 bytes. Credential IDs larger
  //     than this many bytes SHOULD cause the RP to fail this registration
  //     ceremony.
  if (authData.attestedCredentialData?.credentialId.length > 1023)
    return Result.error(RegisterPasskeyError.InvalidData)

  // 26. Verify that the credentialId is not yet registered for any user. If the
  //     credentialId is already known then the Relying Party SHOULD fail this
  //     registration ceremony.
  const existingPasskey = await prisma.passkey.findUnique({
    where: {
      credentialId: credential.id,
    },
  })
  if (existingPasskey) return Result.error(RegisterPasskeyError.PasskeyExists)

  // 27. If the attestation statement attStmt verified successfully and is
  //     found to be trustworthy, then create and store a new credential record
  //     in the user account that was denoted in options.user.
  await prisma.passkey.create({
    data: {
      userId: user.id,
      credentialId: credential.id,
      type: credential.type,
      publicKey: Buffer.from(authData.attestedCredentialData.credentialPublicKey),
      signCount: authData.signCount,
      uvInitialized: authData.userVerified,
      transports: credential.transports,
      backupEligible: authData.backupEligible,
      backupState: authData.backupState,
      algorithm: authData.attestedCredentialData.publicKey.alg,
    },
  })

  // 28. If the attestation statement attStmt successfully verified but is not
  //     trustworthy per step 23 above, the Relying Party SHOULD fail the
  //     registration ceremony.

  // TODO: implement attestation verification

  return Result.ok()
}

export interface PasskeyRequestOptions extends PublicKeyCredentialRequestOptions {
  challengeId: string
}

// Numbered statements after this line refer to the following section of the WebAuthn spec:
// https://w3c.github.io/webauthn/#sctn-verifying-assertion

export async function beginPasskeyTest(
  credentialId: string
): Result.Async<PasskeyRequestOptions, PasskeyLoginError> {
  const session = await Session.get(cookies())
  if (!session.ok) return Result.error(ActionError.Unauthorized)

  const user = await prisma.user.findUnique({ where: { id: session.value.userId } })
  if (!user) return Result.error(ActionError.Unauthorized)

  const passkey = await prisma.passkey.findUnique({
    where: {
      userId: user.id,
      credentialId,
    },
  })
  if (!passkey) return Result.error(PasskeyLoginError.PasskeyNotFound)

  const challenge = await prisma.passkeyChallenge.create({
    data: {
      challenge: crypto.randomBytes(64),
      expires: new Date(Date.now() + 120000),
    },
  })

  // 1. Let options be a new PublicKeyCredentialRequestOptions structure
  //    configured to the Relying Party's needs for the ceremony.
  const options: PasskeyRequestOptions = {
    challengeId: challenge.id,
    challenge: Uint8Array.from(challenge.challenge),
    timeout: 115000,
    rpId: getRpId(headers()),
    userVerification: 'required',
    allowCredentials: [
      {
        id: new Uint8Array(Buffer.from(passkey.credentialId, 'base64url')),
        type: passkey.type as 'public-key',
        transports: passkey.transports as AuthenticatorTransport[],
      },
    ],
  }

  return Result.ok(options)
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

export async function testPasskey(
  credential: PasskeyLoginData
): Result.Async<void, PasskeyLoginError> {
  // 6. Identify the user being authenticated and let credentialRecord be the
  //    credential record for the credential.
  // 7. Verify that the identified user account contains a credential record
  //    whose id equals credential.rawId. Let credentialRecord be that
  //    credential record. If response.userHandle is present, verify that it
  //    equals the user handle of the user account.
  const session = await Session.get(cookies())
  if (!session.ok) return Result.error(PasskeyLoginError.Unauthorized)

  const user = await prisma.user.findUnique({ where: { id: session.value.userId } })
  if (!user) return Result.error(PasskeyLoginError.Unauthorized)

  if (credential.userHandleBuffer) {
    const userHandleBuffer = Buffer.from(Uint8Array.from(credential.userHandleBuffer))
    const userHandle = userHandleBuffer.toString('utf8')
    if (userHandle !== user.id) return Result.error(PasskeyLoginError.Unauthorized)
  }

  const passkey = await prisma.passkey.findUnique({ where: { credentialId: credential.id } })
  if (!passkey) return Result.error(PasskeyLoginError.PasskeyNotFound)
  if (passkey.userId !== user.id) return Result.error(PasskeyLoginError.Unauthorized)

  // 9. Let cData, authData and sig denote the value of response’s
  //    clientDataJSON, authenticatorData, and signature respectively.
  const cData = Buffer.from(Uint8Array.from(credential.clientDataBuffer))
  const authDataBuffer = Buffer.from(Uint8Array.from(credential.authenticatorDataBuffer))
  const authData = new AuthenticatorData(authDataBuffer)
  const sig = Buffer.from(Uint8Array.from(credential.signatureBuffer))

  // 10. Let JSONtext be the result of running UTF-8 decode on the value of
  //     cData.
  const JSONtext = cData.toString('utf8')

  // 11. Let C, the client data claimed as used for the signature, be the result of running an implementation-specific JSON parser on JSONtext.
  const C = JSON.parse(JSONtext) as CollectedClientData

  // 12. Verify that the value of C.type is the string webauthn.get.
  if (C.type !== 'webauthn.get') return Result.error(PasskeyLoginError.InvalidData)

  // 13. Verify that the value of C.challenge equals the base64url encoding of
  //     options.challenge.
  const challenge = Buffer.from(C.challenge, 'base64')
  const storedChallenge = await prisma.passkeyChallenge.findUnique({
    where: { id: credential.challengeId },
  })
  if (!storedChallenge || storedChallenge.expires.getTime() < Date.now()) {
    await prisma.passkeyChallenge.deleteMany({ where: { id: credential.challengeId } })
    return Result.error(PasskeyLoginError.ChallengeMismatch)
  }
  if (!challenge.equals(storedChallenge.challenge)) {
    await prisma.passkeyChallenge.deleteMany({ where: { id: credential.challengeId } })
    return Result.error(PasskeyLoginError.ChallengeMismatch)
  }
  await prisma.passkeyChallenge.deleteMany({ where: { id: credential.challengeId } })

  // 14. Verify that the value of C.origin is an origin expected by the Relying
  //     Party. See § 13.4.9 Validating the origin of a credential for guidance.
  if (C.origin !== 'https://hilltop.works' && C.origin !== 'http://localhost:3000')
    return Result.error(PasskeyLoginError.InvalidData)

  // 15. If C.topOrigin is present:
  if (C.topOrigin) {
    // Verify that the Relying Party expects this credential to be used within
    // an iframe that is not same-origin with its ancestors.
    return Result.error(PasskeyLoginError.InvalidData) // we do not allow cross-origin login
  }

  // 16.  Verify that the rpIdHash in authData is the SHA-256 hash of the RP ID
  //      expected by the Relying Party.
  const rpIdHash = crypto
    .createHash('sha256')
    .update(Buffer.from(getRpId(headers())))
    .digest()
  if (!Buffer.from(authData.rpIdHash).equals(rpIdHash))
    return Result.error(PasskeyLoginError.InvalidData)

  // 17. Verify that the UP bit of the flags in authData is set.
  if (!authData.userPresent) return Result.error(PasskeyLoginError.InvalidData)

  // 18. Determine whether user verification is required for this assertion.
  //     User verification SHOULD be required if, and only if,
  //     options.userVerification is set to required. If user verification was
  //     determined to be required, verify that the UV bit of the flags in
  //     authData is set. Otherwise, ignore the value of the UV flag.
  if (!authData.userVerified) return Result.error(PasskeyLoginError.InvalidData)

  // 19. If the BE bit of the flags in authData is not set, verify that the BS
  //     bit is not set.
  if (!authData.backupEligible && authData.backupState)
    return Result.error(PasskeyLoginError.InvalidData)

  // 20. If the credential backup state is used as part of Relying Party
  //     business logic or policy, let currentBe and currentBs be the values of
  //     the BE and BS bits, respectively, of the flags in authData. Compare
  //     currentBe and currentBs with credentialRecord.backupEligible and
  //     credentialRecord.backupState:
  //     - If credentialRecord.backupEligible is set, verify that currentBe is
  //       set.
  //     - If credentialRecord.backupEligible is not set, verify that currentBe
  //       is not set.
  //     - Apply Relying Party policy, if any.

  // TODO: implement backup state verification

  // 21. Verify that the values of the client extension outputs in
  //     clientExtensionResults and the authenticator extension outputs in the
  //     extensions in authData are as expected, considering the client
  //     extension input values that were given in options.extensions and any
  //     specific policy of the Relying Party regarding unsolicited extensions,
  //     i.e., those that were not specified as part of options.extensions. In
  //     the general case, the meaning of "are as expected" is specific to the
  //     Relying Party and which extensions are in use.

  // TODO: implement extension verification

  const alg = COSEAlgorithm[passkey.algorithm]

  if (!alg) {
    return Result.error(PasskeyLoginError.UnsupportedDevice)
  }

  if (
    !verifySignature({
      algorithm: passkey.algorithm,
      authenticatorData: authDataBuffer,
      clientData: cData,
      publicKey: passkey.publicKey,
      signature: sig,
    })
  ) {
    return Result.error(PasskeyLoginError.VerificationFailed)
  }

  // 24. If authData.signCount is nonzero or credentialRecord.signCount is
  //     nonzero, then run the following sub-step:
  //     - If authData.signCount is:
  //       - greater than credentialRecord.signCount: The signature counter is
  //         valid.
  //       - less than or equal to credentialRecord.signCount: This is a signal
  //         that the authenticator may be cloned, i.e. at least two copies of
  //         the credential private key may exist and are being used in
  //         parallel. Relying Parties should incorporate this information into
  //         their risk scoring. Whether the Relying Party updates
  //         credentialRecord.signCount below in this case, or not, or fails the
  //         authentication ceremony or not, is Relying Party-specific.
  const currentSignCount = authData.signCount
  if (currentSignCount > passkey.signCount) {
    // OK
  } else {
    // TODO: implement sign count verification
  }

  // 25. If response.attestationObject is present and the Relying Party wishes
  //     to verify the attestation then perform CBOR decoding on
  //     attestationObject to obtain the attestation statement format fmt, and
  //     the attestation statement attStmt.
  //     1. Verify that the AT bit in the flags field of authData is set,
  //        indicating that attested credential data is included.
  //     2. Verify that the credentialPublicKey and credentialId fields of the
  //        attested credential data in authData match
  //        credentialRecord.publicKey and credentialRecord.id, respectively.
  //     3. Determine the attestation statement format by performing a USASCII
  //        case-sensitive match on fmt against the set of supported WebAuthn
  //        Attestation Statement Format Identifier values. An up-to-date list
  //        of registered WebAuthn Attestation Statement Format Identifier
  //        values is maintained in the IANA "WebAuthn Attestation Statement
  //        Format Identifiers" registry [IANA-WebAuthn-Registries] established
  //        by [RFC8809].
  //     4. Verify that attStmt is a correct attestation statement, conveying a
  //        valid attestation signature, by using the attestation statement
  //        format fmt’s verification procedure given attStmt, authData and
  //        hash.
  //     5. If validation is successful, obtain a list of acceptable trust
  //        anchors (i.e. attestation root certificates) for that attestation
  //        type and attestation statement format fmt, from a trusted source or
  //        from policy. The aaguid in the attested credential data can be used
  //        to guide this lookup.

  // TODO: implement attestation verification

  // 26. Update credentialRecord with new state values:
  //     1. Update credentialRecord.signCount to the value of
  //        authData.signCount.
  //     2. Update credentialRecord.backupState to the value of currentBs.
  //     3. If credentialRecord.uvInitialized is false, update it to the value
  //        of the UV bit in the flags in authData. This change SHOULD require
  //        authorization by an additional authentication factor equivalent to
  //        WebAuthn user verification; if not authorized, skip this step.
  //     4. OPTIONALLY, if response.attestationObject is present, update
  //        credentialRecord.attestationObject to the value of
  //        response.attestationObject and update
  //        credentialRecord.attestationClientDataJSON to the value of
  //        response.clientDataJSON.

  await prisma.passkey.update({
    where: {
      credentialId: credential.id,
    },
    data: {
      signCount: currentSignCount,
      uvInitialized: authData.userVerified,
    },
  })

  return Result.ok()
}

export async function beginPasskeyLogin(): Promise<PasskeyRequestOptions> {
  const challenge = await prisma.passkeyChallenge.create({
    data: {
      challenge: crypto.randomBytes(64),
      expires: new Date(Date.now() + 120000),
    },
  })

  // 1. Let options be a new PublicKeyCredentialRequestOptions structure
  //    configured to the Relying Party's needs for the ceremony.
  const options: PasskeyRequestOptions = {
    challengeId: challenge.id,
    challenge: Uint8Array.from(challenge.challenge),
    timeout: 115000,
    rpId: getRpId(headers()),
    userVerification: 'required',
  }

  return options
}

export async function passkeyLogin(
  credential: PasskeyLoginData
): Result.Async<User, PasskeyLoginError> {
  // 6. Identify the user being authenticated and let credentialRecord be the
  //    credential record for the credential.
  // 7. Verify that the identified user account contains a credential record
  //    whose id equals credential.rawId. Let credentialRecord be that
  //    credential record. If response.userHandle is present, verify that it
  //    equals the user handle of the user account.

  const passkey = await prisma.passkey.findUnique({ where: { credentialId: credential.id } })
  if (!passkey) return Result.error(PasskeyLoginError.PasskeyNotFound)

  let user
  if (credential.userHandleBuffer) {
    const userHandle = Buffer.from(Uint8Array.from(credential.userHandleBuffer)).toString('utf8')
    user = await prisma.user.findUnique({ where: { id: userHandle } })
  } else {
    user = await prisma.user.findUnique({ where: { id: passkey.userId } })
  }

  if (!user) return Result.error(PasskeyLoginError.Unauthorized)
  if (passkey.userId !== user.id) return Result.error(PasskeyLoginError.Unauthorized)

  // 9. Let cData, authData and sig denote the value of response’s
  //    clientDataJSON, authenticatorData, and signature respectively.
  const cData = Buffer.from(Uint8Array.from(credential.clientDataBuffer))
  const authDataBuffer = Buffer.from(Uint8Array.from(credential.authenticatorDataBuffer))
  const authData = new AuthenticatorData(authDataBuffer)
  const sig = Buffer.from(Uint8Array.from(credential.signatureBuffer))

  // 10. Let JSONtext be the result of running UTF-8 decode on the value of
  //     cData.
  const JSONtext = cData.toString('utf8')

  // 11. Let C, the client data claimed as used for the signature, be the result of running an implementation-specific JSON parser on JSONtext.
  const C = JSON.parse(JSONtext) as CollectedClientData

  // 12. Verify that the value of C.type is the string webauthn.get.
  if (C.type !== 'webauthn.get') return Result.error(PasskeyLoginError.InvalidData)

  // 13. Verify that the value of C.challenge equals the base64url encoding of
  //     options.challenge.
  const challenge = Buffer.from(C.challenge, 'base64')
  const storedChallenge = await prisma.passkeyChallenge.findUnique({
    where: { id: credential.challengeId },
  })
  if (!storedChallenge || storedChallenge.expires.getTime() < Date.now()) {
    await prisma.passkeyChallenge.deleteMany({ where: { id: credential.challengeId } })
    return Result.error(PasskeyLoginError.ChallengeMismatch)
  }
  if (!challenge.equals(storedChallenge.challenge)) {
    await prisma.passkeyChallenge.deleteMany({ where: { id: credential.challengeId } })
    return Result.error(PasskeyLoginError.ChallengeMismatch)
  }
  await prisma.passkeyChallenge.deleteMany({ where: { id: credential.challengeId } })

  // 14. Verify that the value of C.origin is an origin expected by the Relying
  //     Party. See § 13.4.9 Validating the origin of a credential for guidance.
  if (C.origin !== 'https://hilltop.works' && C.origin !== 'http://localhost:3000')
    return Result.error(PasskeyLoginError.InvalidData)

  // 15. If C.topOrigin is present:
  if (C.topOrigin) {
    // Verify that the Relying Party expects this credential to be used within
    // an iframe that is not same-origin with its ancestors.
    return Result.error(PasskeyLoginError.InvalidData) // we do not allow cross-origin login
  }

  // 16.  Verify that the rpIdHash in authData is the SHA-256 hash of the RP ID
  //      expected by the Relying Party.
  const rpIdHash = crypto
    .createHash('sha256')
    .update(Buffer.from(getRpId(headers())))
    .digest()
  if (!Buffer.from(authData.rpIdHash).equals(rpIdHash))
    return Result.error(PasskeyLoginError.InvalidData)

  // 17. Verify that the UP bit of the flags in authData is set.
  if (!authData.userPresent) return Result.error(PasskeyLoginError.InvalidData)

  // 18. Determine whether user verification is required for this assertion.
  //     User verification SHOULD be required if, and only if,
  //     options.userVerification is set to required. If user verification was
  //     determined to be required, verify that the UV bit of the flags in
  //     authData is set. Otherwise, ignore the value of the UV flag.
  if (!authData.userVerified) return Result.error(PasskeyLoginError.InvalidData)

  // 19. If the BE bit of the flags in authData is not set, verify that the BS
  //     bit is not set.
  if (!authData.backupEligible && authData.backupState)
    return Result.error(PasskeyLoginError.InvalidData)

  // 20. If the credential backup state is used as part of Relying Party
  //     business logic or policy, let currentBe and currentBs be the values of
  //     the BE and BS bits, respectively, of the flags in authData. Compare
  //     currentBe and currentBs with credentialRecord.backupEligible and
  //     credentialRecord.backupState:
  //     - If credentialRecord.backupEligible is set, verify that currentBe is
  //       set.
  //     - If credentialRecord.backupEligible is not set, verify that currentBe
  //       is not set.
  //     - Apply Relying Party policy, if any.

  // TODO: implement backup state verification

  // 21. Verify that the values of the client extension outputs in
  //     clientExtensionResults and the authenticator extension outputs in the
  //     extensions in authData are as expected, considering the client
  //     extension input values that were given in options.extensions and any
  //     specific policy of the Relying Party regarding unsolicited extensions,
  //     i.e., those that were not specified as part of options.extensions. In
  //     the general case, the meaning of "are as expected" is specific to the
  //     Relying Party and which extensions are in use.

  // TODO: implement extension verification

  // 22. Let hash be the result of computing a hash over the cData using
  //     SHA-256.

  // 23. Using credentialRecord.publicKey, verify that sig is a valid signature
  //     over the binary concatenation of authData and hash.

  const alg = COSEAlgorithm[passkey.algorithm]

  if (!alg) {
    return Result.error(PasskeyLoginError.UnsupportedDevice)
  }

  if (
    !verifySignature({
      algorithm: passkey.algorithm,
      authenticatorData: authDataBuffer,
      clientData: cData,
      publicKey: passkey.publicKey,
      signature: sig,
    })
  ) {
    return Result.error(PasskeyLoginError.VerificationFailed)
  }

  // 24. If authData.signCount is nonzero or credentialRecord.signCount is
  //     nonzero, then run the following sub-step:
  //     - If authData.signCount is:
  //       - greater than credentialRecord.signCount: The signature counter is
  //         valid.
  //       - less than or equal to credentialRecord.signCount: This is a signal
  //         that the authenticator may be cloned, i.e. at least two copies of
  //         the credential private key may exist and are being used in
  //         parallel. Relying Parties should incorporate this information into
  //         their risk scoring. Whether the Relying Party updates
  //         credentialRecord.signCount below in this case, or not, or fails the
  //         authentication ceremony or not, is Relying Party-specific.
  const currentSignCount = authData.signCount
  if (currentSignCount > passkey.signCount) {
    // OK
  } else {
    // TODO: implement this
  }

  // 25. If response.attestationObject is present and the Relying Party wishes
  //     to verify the attestation then perform CBOR decoding on
  //     attestationObject to obtain the attestation statement format fmt, and
  //     the attestation statement attStmt.
  //     1. Verify that the AT bit in the flags field of authData is set,
  //        indicating that attested credential data is included.
  //     2. Verify that the credentialPublicKey and credentialId fields of the
  //        attested credential data in authData match
  //        credentialRecord.publicKey and credentialRecord.id, respectively.
  //     3. Determine the attestation statement format by performing a USASCII
  //        case-sensitive match on fmt against the set of supported WebAuthn
  //        Attestation Statement Format Identifier values. An up-to-date list
  //        of registered WebAuthn Attestation Statement Format Identifier
  //        values is maintained in the IANA "WebAuthn Attestation Statement
  //        Format Identifiers" registry [IANA-WebAuthn-Registries] established
  //        by [RFC8809].
  //     4. Verify that attStmt is a correct attestation statement, conveying a
  //        valid attestation signature, by using the attestation statement
  //        format fmt’s verification procedure given attStmt, authData and
  //        hash.
  //     5. If validation is successful, obtain a list of acceptable trust
  //        anchors (i.e. attestation root certificates) for that attestation
  //        type and attestation statement format fmt, from a trusted source or
  //        from policy. The aaguid in the attested credential data can be used
  //        to guide this lookup.

  // TODO: implement attestation verification

  // 26. Update credentialRecord with new state values:
  //     1. Update credentialRecord.signCount to the value of
  //        authData.signCount.
  //     2. Update credentialRecord.backupState to the value of currentBs.
  //     3. If credentialRecord.uvInitialized is false, update it to the value
  //        of the UV bit in the flags in authData. This change SHOULD require
  //        authorization by an additional authentication factor equivalent to
  //        WebAuthn user verification; if not authorized, skip this step.
  //     4. OPTIONALLY, if response.attestationObject is present, update
  //        credentialRecord.attestationObject to the value of
  //        response.attestationObject and update
  //        credentialRecord.attestationClientDataJSON to the value of
  //        response.clientDataJSON.
  await prisma.passkey.update({
    where: {
      credentialId: credential.id,
    },
    data: {
      signCount: currentSignCount,
      uvInitialized: authData.userVerified,
    },
  })

  // Handle login
  const session = Session.create(
    {
      userId: user.id,
      role: user.role,
    },
    [expires(60 * 60 * 24 * 30)]
  )
  await Session.save(session, cookies())

  return Result.ok(user)
}

export async function nicknamePasskey(
  credentialId: string,
  nickname: string | null
): Result.Async<void, ActionError> {
  const session = await Session.get(cookies())
  if (!session.ok) return Result.error(ActionError.Unauthorized)

  const user = await prisma.user.findUnique({ where: { id: session.value.userId } })
  if (!user) return Result.error(ActionError.Unauthorized)

  await prisma.passkey.update({
    where: {
      userId: user.id,
      credentialId,
    },
    data: {
      nickname,
    },
  })

  return Result.ok()
}

export async function getPasskeys(): Promise<
  {
    credentialId: string
    nickname: string | null
    created: Date
    updated: Date
    transports: string[]
  }[]
> {
  const session = await Session.get(cookies())
  if (!session.ok) return []

  const user = await prisma.user.findUnique({ where: { id: session.value.userId } })
  if (!user) return []

  const passkeys = await prisma.passkey.findMany({
    where: {
      userId: user.id,
    },
    select: {
      credentialId: true,
      nickname: true,
      created: true,
      updated: true,
      transports: true,
    },
    orderBy: {
      created: 'asc',
    },
  })

  return passkeys
}

export async function deletePasskey(credentialId: string) {
  const session = await Session.get(cookies())
  if (!session.ok) return Result.error(ActionError.Unauthorized)

  const user = await prisma.user.findUnique({ where: { id: session.value.userId } })
  if (!user) return Result.error(ActionError.Unauthorized)

  await prisma.passkey.delete({
    where: {
      userId: user.id,
      credentialId,
    },
  })

  return Result.ok()
}
