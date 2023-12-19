import asn1 from 'asn1.js'
import { decodeMultiple } from 'cbor-x'

export abstract class COSEKey {
  alg: COSEAlgorithm
  kty: COSEKeyType
  kid?: Buffer

  protected constructor(public key: Buffer, public raw: { [key: number]: any }) {
    this.alg = this.raw[COSEKeys.alg]
    this.kty = this.raw[COSEKeys.kty]
    this.kid = this.raw[COSEKeys.kid]
  }

  static from(key: Buffer): COSEKey {
    const raw = (decodeMultiple(key) as any)[0]
    switch (raw[COSEKeys.kty]) {
      case COSEKeyType.OKP:
        return new COSEOKPKey(key, raw)
      case COSEKeyType.EC2:
        return new COSEEC2Key(key, raw)
      case COSEKeyType.RSA:
        return new COSERSAKey(key, raw)
      default:
        throw new Error('Unsupported key type ' + raw[COSEKeys.kty])
    }
  }

  abstract toSPKI(): Buffer
  abstract toJWK(): JsonWebKey

  isOKP(): this is COSEOKPKey {
    return this.kty === COSEKeyType.OKP
  }

  isEC2(): this is COSEEC2Key {
    return this.kty === COSEKeyType.EC2
  }

  isRSA(): this is COSERSAKey {
    return this.kty === COSEKeyType.RSA
  }
}

export class COSEOKPKey extends COSEKey {
  crv: COSEEllipticCurves
  x: Buffer
  d?: Buffer
  constructor(public key: Buffer, public raw: { [key: number]: any }) {
    super(key, raw)
    this.crv = this.raw[COSEType1Keys.crv]
    this.x = this.raw[COSEType1Keys.x]
    this.d = this.raw[COSEType1Keys.d]
  }

  toSPKI(): Buffer {
    return SubjectPublicKeyInfo.encode(
      {
        algorithm: {
          algorithm: COSECurveOIDs[this.crv],
          parameters: null, // No parameters for OKP
        },
        subjectPublicKey: {
          unused: 0,
          data: this.x,
        },
      },
      'der'
    )
  }

  toJWK(): JsonWebKey {
    return {
      kty: 'OKP',
      crv: COSEEllipticCurves[this.crv],
      alg: COSEAlgorithm[this.alg],
      x: this.x.toString('base64'),
      d: this.d?.toString('base64'),
    }
  }
}

export class COSEEC2Key extends COSEKey {
  crv: COSEEllipticCurves
  x: Buffer
  y: Buffer
  d?: Buffer
  constructor(public key: Buffer, public raw: { [key: number]: any }) {
    super(key, raw)
    this.crv = this.raw[COSEType2Keys.crv]
    this.x = this.raw[COSEType2Keys.x]
    this.y = this.raw[COSEType2Keys.y]
    this.d = this.raw[COSEType2Keys.d]
  }

  toSPKI(): Buffer {
    const publicKey = Buffer.concat([Buffer.from([0x04]), this.x, this.y])

    return SubjectPublicKeyInfo.encode(
      {
        algorithm: {
          algorithm: COSECurveOIDs[this.crv],
          parameters: COSECurveOIDs[this.crv],
        },
        subjectPublicKey: {
          unused: 0,
          data: publicKey,
        },
      },
      'der'
    )
  }

  toJWK(): JsonWebKey {
    return {
      kty: 'EC',
      alg: COSEAlgorithm[this.alg],
      crv: COSEEllipticCurves[this.crv],
      x: this.x.toString('base64'),
      y: this.y.toString('base64'),
      d: this.d?.toString('base64'),
    }
  }
}

export class COSERSAKey extends COSEKey {
  n: Buffer
  e: Buffer
  d?: Buffer
  p?: Buffer
  q?: Buffer
  dP?: Buffer
  dQ?: Buffer
  qInv?: Buffer
  other?: Buffer[]
  r_i?: Buffer
  d_i?: Buffer
  t_i?: Buffer
  constructor(public key: Buffer, public raw: { [key: number]: any }) {
    super(key, raw)
    this.n = this.raw[COSEType3Keys.n]
    this.e = this.raw[COSEType3Keys.e]
    this.d = this.raw[COSEType3Keys.d]
    this.p = this.raw[COSEType3Keys.p]
    this.q = this.raw[COSEType3Keys.q]
    this.dP = this.raw[COSEType3Keys.dP]
    this.dQ = this.raw[COSEType3Keys.dQ]
    this.qInv = this.raw[COSEType3Keys.qInv]
    this.other = this.raw[COSEType3Keys.other]
    this.r_i = this.raw[COSEType3Keys.r_i]
    this.d_i = this.raw[COSEType3Keys.d_i]
    this.t_i = this.raw[COSEType3Keys.t_i]
  }

  toSPKI(): Buffer {
    const oid = [1, 2, 840, 113549, 1, 1, 1]

    const rsaPublicKey = RSAPublicKey.encode(
      {
        modulus: this.n,
        publicExponent: this.e,
      },
      'der'
    )

    return SubjectPublicKeyInfo.encode(
      {
        algorithm: {
          algorithm: oid,
          parameters: null,
        },
        subjectPublicKey: {
          unused: 0,
          data: rsaPublicKey,
        },
      },
      'der'
    )
  }

  toJWK(): JsonWebKey {
    return {
      kty: 'RSA',
      alg: COSEAlgorithm[this.alg],
      n: this.n.toString('base64'),
      e: this.e.toString('base64'),
      d: this.d?.toString('base64'),
      p: this.p?.toString('base64'),
      q: this.q?.toString('base64'),
      dp: this.dP?.toString('base64'),
      dq: this.dQ?.toString('base64'),
      qi: this.qInv?.toString('base64'),
    }
  }
}

export const enum COSEKeys {
  kty = 1,
  kid = 2,
  alg = 3,
}

export enum COSEType1Keys {
  /** int/tstr: EC identifier -- Taken from the "COSE Elliptic Curves" registry */
  crv = -1,
  /** bstr: Public Key */
  x = -2,
  /** bstr: Private Key */
  d = -4,
}

export enum COSEType2Keys {
  /** int/tstr: EC identifier -- Taken from the "COSE Elliptic Curves" registry [RFC9053] */
  crv = -1,
  /** bstr: x-coordinate [RFC9053] */
  x = -2,
  /** bstr/bool: y-coordinate [RFC9053] */
  y = -3,
  /** bstr: Private Key [RFC9053] */
  d = -4,
}

export enum COSEType3Keys {
  /** bstr: the RSA modulus n [RFC8230] */
  n = -1,
  /** bstr: the RSA public exponent e [RFC8230] */
  e = -2,
  /** bstr: the RSA private exponent d [RFC8230] */
  d = -3,
  /** bstr: the prime factor p of n [RFC8230] */
  p = -4,
  /** bstr: the prime factor q of n [RFC8230] */
  q = -5,
  /** bstr: dP is d mod (p - 1) [RFC8230] */
  dP = -6,
  /** bstr: dQ is d mod (q - 1) [RFC8230] */
  dQ = -7,
  /** bstr: qInv is the CRT coefficient q^(-1) mod p [RFC8230] */
  qInv = -8,
  /** array: other prime infos, an array [RFC8230] */
  other = -9,
  /** bstr: a prime factor r_i of n, where i >= 3 [RFC8230] */
  r_i = -10,
  /** bstr: d_i = d mod (r_i - 1) [RFC8230] */
  d_i = -11,
  /** bstr: the CRT coefficient t_i = (r_1 * r_2 * ... * r_(i-1))^(-1) mod r_i [RFC8230] */
  t_i = -12,
}

export enum COSEEllipticCurves {
  /** EC2	NIST P-256 also known as secp256r1 [RFC9053] */
  'P-256' = 1,
  /** EC2	NIST P-384 also known as secp384r1 [RFC9053] */
  'P-384' = 2,
  /** EC2	NIST P-521 also known as secp521r1 [RFC9053] */
  'P-521' = 3,
  /** OKP	X25519 for use w/ ECDH only [RFC9053] */
  X25519 = 4,
  /** OKP	X448 for use w/ ECDH only [RFC9053] */
  X448 = 5,
  /** OKP	Ed25519 for use w/ EdDSA only [RFC9053] */
  Ed25519 = 6,
  /** OKP	Ed448 for use w/ EdDSA only [RFC9053] */
  Ed448 = 7,
  /** EC2	SECG secp256k1 curve [RFC8812] */
  secp256k1 = 8,
}

export enum COSEAlgorithm {
  /** ECDSA w/ SHA-256 */
  ES256 = -7,
  /** EdDSA */
  EdDSA = -8,
  /** RSASSA-PSS w/ SHA-256 */
  PS256 = -37,
  /** RSASSA-PKCS1-v1_5 using SHA-256 */
  RS256 = -257,
}

export enum COSEKeyType {
  OKP = 1,
  EC2 = 2,
  RSA = 3,
}

export const COSECurveOIDs = {
  [COSEEllipticCurves['P-256']]: [1, 2, 840, 10045, 3, 1, 7],
  [COSEEllipticCurves['P-384']]: [1, 3, 132, 0, 34],
  [COSEEllipticCurves['P-521']]: [1, 3, 132, 0, 35],
  [COSEEllipticCurves.X25519]: [1, 3, 101, 110],
  [COSEEllipticCurves.X448]: [1, 3, 101, 111],
  [COSEEllipticCurves.Ed25519]: [1, 3, 6, 1, 4, 1, 11591, 15, 1],
  [COSEEllipticCurves.Ed448]: [1, 3, 6, 1, 4, 1, 11591, 15, 2],
  [COSEEllipticCurves.secp256k1]: [1, 3, 132, 0, 10],
}

export const ECPoint = asn1.define('ECPoint', function () {
  this.octstr()
})

export const AlgorithmIdentifier = asn1.define('AlgorithmIdentifier', function () {
  this.seq().obj(this.key('algorithm').objid(), this.key('parameters').objid())
})

export const SubjectPublicKeyInfo = asn1.define('SubjectPublicKeyInfo', function () {
  this.seq().obj(
    this.key('algorithm').use(AlgorithmIdentifier),
    this.key('subjectPublicKey').bitstr()
  )
})

export const RSAPublicKey = asn1.define('RSAPublicKey', function () {
  this.seq().obj(
    this.key('modulus').int(), // n
    this.key('publicExponent').int() // e
  )
})
