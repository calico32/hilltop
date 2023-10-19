// @ts-check

import crypto from 'crypto'
import dotenv from 'dotenv'
import fs from 'fs/promises'

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
})

if (!process.env.ENCRYPTION_PASSPHRASE) {
  throw new Error('ENCRYPTION_PASSPHRASE is not set')
}

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
    passphrase: process.env.ENCRYPTION_PASSPHRASE,
  },
})

const PK = 'NEXT_PUBLIC_KEY'
const SK = 'PRIVATE_KEY'

const vars = `
${PK}="${keypair.publicKey.replace(/\n/g, '\\n')}"
${SK}="${keypair.privateKey.replace(/\n/g, '\\n')}"
`

await fs.writeFile('public.pem', keypair.publicKey)
await fs.writeFile('private.pem', keypair.privateKey)

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'

const env = await fs.readFile(envFile, 'utf-8')

const newEnv = []
let publicAdded = false
let privateAdded = false

for (const line of env.split('\n')) {
  if (line.startsWith(PK + '=')) {
    publicAdded = true
    newEnv.push(`${PK}="${keypair.publicKey.replace(/\n/g, '\\n')}"`)
  } else if (line.startsWith(SK + '=')) {
    privateAdded = true
    newEnv.push(`${SK}="${keypair.privateKey.replace(/\n/g, '\\n')}"`)
  } else {
    newEnv.push(line)
  }
}

if (!publicAdded) {
  newEnv.push(`${PK}="${keypair.publicKey.replace(/\n/g, '\\n')}"`)
}

if (!privateAdded) {
  newEnv.push(`${SK}="${keypair.privateKey.replace(/\n/g, '\\n')}"`)
}

await fs.writeFile(envFile, newEnv.join('\n'))
