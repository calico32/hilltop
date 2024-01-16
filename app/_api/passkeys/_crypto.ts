import { COSEAlgorithm, COSEKey } from '@/_lib/cose'
import crypto, { webcrypto } from 'crypto'
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers'

export function getRpId(headers: ReadonlyHeaders) {
  return headers.get('origin')?.includes('localhost:3000') ? 'localhost' : 'hilltop.works'
}

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

interface VerifyData {
  algorithm: COSEAlgorithm
  publicKey: Buffer
  authenticatorData: Buffer
  clientData: Buffer
  signature: Buffer
}

const algoParams: Record<COSEAlgorithm, AlgoParams> = {
  [COSEAlgorithm.RS256]: {
    name: 'RSASSA-PKCS1-v1_5',
    hash: 'SHA-256',
  },
  [COSEAlgorithm.ES256]: {
    name: 'ECDSA',
    namedCurve: 'P-256',
    hash: 'SHA-256',
  },
  [COSEAlgorithm.EdDSA]: {
    name: 'Ed25519',
    hash: 'SHA-256',
  },
  [COSEAlgorithm.PS256]: {
    name: 'RSA-PSS',
    hash: 'SHA-256',
  },
}

type AlgoParams = RsaHashedImportParams | EcKeyImportParams | EcdsaParams

async function parseCryptoKey(algoParams: AlgoParams, jwk: JsonWebKey): Promise<CryptoKey> {
  return webcrypto.subtle.importKey('jwk', jwk, algoParams, true, ['verify'])
}

export async function verifySignature({
  algorithm,
  publicKey,
  authenticatorData,
  clientData,
  signature,
}: VerifyData): Promise<boolean> {
  const coseKey = COSEKey.from(publicKey)
  const cryptoKey = await parseCryptoKey(algoParams[algorithm], coseKey.toJWK())

  // 22. Let hash be the result of computing a hash over the cData using
  //     SHA-256.
  const clientHash = crypto.createHash('sha256').update(clientData).digest()

  console.debug('Crypto Algo: ' + JSON.stringify(algoParams[algorithm]))
  console.debug('Public key: ' + publicKey)
  console.debug('Signature: ' + signature)

  if (coseKey.alg === COSEAlgorithm.ES256) {
    signature = convertASN1toRaw(signature)
  }

  // 23. Using credentialRecord.publicKey, verify that sig is a valid signature
  //     over the binary concatenation of authData and hash.
  let comboBuffer = Buffer.concat([authenticatorData, clientHash])
  const isValid = await webcrypto.subtle.verify(
    algoParams[algorithm],
    cryptoKey,
    signature,
    comboBuffer,
  )

  return isValid
}

function convertASN1toRaw(signatureBuffer: ArrayBuffer) {
  // Convert signature from ASN.1 sequence to "raw" format
  const usignature = new Uint8Array(signatureBuffer)
  const rStart = usignature[4] === 0 ? 5 : 4
  const rEnd = rStart + 32
  const sStart = usignature[rEnd + 2] === 0 ? rEnd + 3 : rEnd + 2
  const r = usignature.slice(rStart, rEnd)
  const s = usignature.slice(sStart)
  return Buffer.from(new Uint8Array([...r, ...s]))
}
