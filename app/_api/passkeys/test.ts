// Numbered statements after this line refer to the following section of the WebAuthn spec:
// https://w3c.github.io/webauthn/#sctn-verifying-assertion

import {
  ActionError,
  AuthenticatorData,
  CollectedClientData,
  PasskeyLoginData,
  PasskeyLoginError,
  PasskeyRequestOptions,
} from '@/_api/types'
import { getRpId, verifySignature } from '@/_api/util'
import { COSEAlgorithm } from '@/_lib/cose'
import { caching, prisma } from '@/_lib/database'
import crypto from 'crypto'
import { Result, Session } from 'kiyoi'
import { cookies, headers } from 'next/headers'

export async function beginPasskeyTest(
  credentialId: string,
): Result.Async<PasskeyRequestOptions, PasskeyLoginError> {
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

export async function testPasskey(
  credential: PasskeyLoginData,
): Result.Async<void, PasskeyLoginError> {
  // 6. Identify the user being authenticated and let credentialRecord be the
  //    credential record for the credential.
  // 7. Verify that the identified user account contains a credential record
  //    whose id equals credential.rawId. Let credentialRecord be that
  //    credential record. If response.userHandle is present, verify that it
  //    equals the user handle of the user account.
  const session = await Session.get(cookies())
  if (!session.ok) return Result.error(PasskeyLoginError.Unauthorized)

  const user = await prisma.user.findUnique({
    where: { id: session.value.userId },
    select: {
      id: true,
    },
    cacheStrategy: caching.user,
  })
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
