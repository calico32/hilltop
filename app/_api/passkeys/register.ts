// Numbered statements in this section refer to the following section of the WebAuthn spec:
// https://w3c.github.io/webauthn/#sctn-registering-a-new-credential

import {
  ActionError,
  Attestation,
  AuthenticatorData,
  CollectedClientData,
  PasskeyCreateOptions,
  PasskeyRegistrationData,
  PasskeyRegistrationError,
} from '@/_api/types'
import { getRpId } from '@/_api/util'
import { caching, prisma } from '@/_lib/database'
import { fullName } from '@/_lib/format'
import { decode as cborDecode } from 'cbor-x'
import crypto from 'crypto'
import { Result, Session } from 'kiyoi'
import { cookies, headers } from 'next/headers'

export async function beginPasskeyRegistration(): Result.Async<
  PasskeyCreateOptions,
  PasskeyRegistrationError
> {
  const session = await Session.get(cookies())
  if (!session.ok) return Result.error(PasskeyRegistrationError.Unauthorized)

  const user = await prisma.user.findUnique({
    where: { id: session.value.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      preferredName: true,
    },
    cacheStrategy: caching.user,
  })
  if (!user) return Result.error(PasskeyRegistrationError.Unauthorized)

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

export async function registerPasskey(
  credential: PasskeyRegistrationData,
): Result.Async<void, PasskeyRegistrationError> {
  const session = await Session.get(cookies())
  if (!session.ok) return Result.error(ActionError.Unauthorized)

  const user = await prisma.user.findUnique({
    where: { id: session.value.userId },
    select: {
      id: true,
    },
    cacheStrategy: caching.user,
  })
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
    return Result.error(PasskeyRegistrationError.InvalidData)
  }

  // 8. Verify that the value of [clientData].challenge equals the base64url encoding of
  //    options.challenge.
  const challenge = Buffer.from(clientData.challenge, 'base64url')
  const storedChallenge = await prisma.passkeyChallenge.findUnique({
    where: { id: credential.challengeId },
  })
  if (!storedChallenge || storedChallenge.expires.getTime() < Date.now()) {
    await prisma.passkeyChallenge.deleteMany({ where: { id: credential.challengeId } })
    return Result.error(PasskeyRegistrationError.ChallengeMismatch)
  }
  if (!challenge.equals(storedChallenge.challenge)) {
    await prisma.passkeyChallenge.deleteMany({ where: { id: credential.challengeId } })
    return Result.error(PasskeyRegistrationError.ChallengeMismatch)
  }
  await prisma.passkeyChallenge.deleteMany({ where: { id: credential.challengeId } })

  // 9. Verify that the value of [clientData].origin is an origin expected by the Relying
  //    Party.
  if (
    clientData.origin !== 'https://hilltop.works' &&
    clientData.origin !== 'http://localhost:3000'
  ) {
    return Result.error(PasskeyRegistrationError.InvalidData)
  }

  // 10. If [clientData].topOrigin is present:
  if (clientData.topOrigin) {
    // 1. Verify that the Relying Party expects that this credential would have
    //    been created within an iframe that is not same-origin with its
    //    ancestors.
    return Result.error(PasskeyRegistrationError.InvalidData) // we do not allow cross-origin registration
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
    return Result.error(PasskeyRegistrationError.InvalidData)

  // 13. Verify that the rpIdHash in authData is the SHA-256 hash of the RP ID
  //     expected by the Relying Party.
  const rpIdHash = crypto
    .createHash('sha256')
    .update(Buffer.from(getRpId(headers())))
    .digest()
  if (!Buffer.from(authData.rpIdHash).equals(rpIdHash))
    return Result.error(PasskeyRegistrationError.InvalidData)

  // 14. Verify that the UP bit of the flags in authData is set.
  if (!authData.userPresent) return Result.error(PasskeyRegistrationError.InvalidData)

  // 15. If the Relying Party requires user verification for this registration,
  //     verify that the UV bit of the flags in authData is set.
  if (!authData.userVerified) return Result.error(PasskeyRegistrationError.InvalidData)

  // 16. If the BE bit of the flags in authData is not set, verify that the BS
  //     bit is not set.
  if (!authData.backupEligible && authData.backupState)
    return Result.error(PasskeyRegistrationError.InvalidData)

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
  if (![-7, -8, -257].includes(alg)) return Result.error(PasskeyRegistrationError.UnsupportedDevice)

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
    return Result.error(PasskeyRegistrationError.InvalidData)

  // 26. Verify that the credentialId is not yet registered for any user. If the
  //     credentialId is already known then the Relying Party SHOULD fail this
  //     registration ceremony.
  const existingPasskey = await prisma.passkey.findUnique({
    where: {
      credentialId: credential.id,
    },
  })
  if (existingPasskey) return Result.error(PasskeyRegistrationError.PasskeyExists)

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
