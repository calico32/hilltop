import { User } from '@prisma/client'
import MD5 from 'md5.js'

export function gravatar(email: string) {
  const hash = new MD5().update(email).digest('hex')
  return `https://gravatar.com/avatar/${hash}?d=mp`
}

export function avatar(user: User) {
  if (user.avatarId) return `/avatars/${user.avatarId}`
  return gravatar(user.email)
}
