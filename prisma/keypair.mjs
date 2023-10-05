import crypto from 'crypto'
import fs from 'fs/promises'

const keypair = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
    cipher: 'aes-256-cbc',
    passphrase: 'top secret',
  },
})

await fs.writeFile('public.pem', keypair.publicKey)
await fs.writeFile('private.pem', keypair.privateKey)
