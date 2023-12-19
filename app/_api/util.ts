import { COSEAlgorithm, COSEKey } from '@/_lib/cose'
import crypto, { webcrypto } from 'crypto'
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers'

export function getRpId(headers: ReadonlyHeaders) {
  return headers.get('origin')?.includes('localhost:3000') ? 'localhost' : 'hilltop.works'
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
    comboBuffer
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
