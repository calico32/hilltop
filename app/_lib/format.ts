import { PayType, User } from '@prisma/client'
import MD5 from 'md5.js'
import { FormatEnum } from 'sharp'

export function displayName(user: User | null) {
  if (!user) return null
  if (user.preferredName) {
    return user.preferredName.split(' ')[0]
  }

  return user.firstName
}

export function fullName(user: Pick<User, 'preferredName' | 'firstName' | 'lastName'> | null) {
  if (!user) return null
  if (user.preferredName) {
    if (user.preferredName.split(' ').length > 1) {
      return user.preferredName
    }

    return `${user.preferredName} ${user.lastName}`
  }

  return `${user.firstName} ${user.lastName}`
}

export function age(dob: Date | string) {
  const date = new Date(dob)
  const diff = Date.now() - date.getTime()
  const age = new Date(diff)
  return Math.abs(age.getUTCFullYear() - 1970)
}

export function gravatar(email: string) {
  const hash = new MD5().update(email).digest('hex')
  return `https://gravatar.com/avatar/${hash}?d=mp`
}

export function avatar(
  user: Pick<User, 'avatarId' | 'email'>,
  { size = 64, format = 'png' }: { size?: number; format?: keyof FormatEnum } = {}
) {
  if (user.avatarId) return `/avatars/${user.avatarId}?size=${size}&format=${format}`
  return gravatar(user.email)
}

export function phoneNumber(phone: string | null) {
  return phone?.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
}

export function taxId(taxId: string | null) {
  if (taxId === '*********') return '••• •• ••••'

  if (taxId?.includes('*')) return taxId.replace(/(.{3})(.{2})(.{4})/, '••• •• $3')
  return taxId?.replace(/(.{3})(.{2})(.{4})/, '$1-$2-$3')
}

export function formatPay(
  type: PayType,
  min: string,
  max: string | undefined,
  full = false
): string {
  if (type === PayType.Hourly) {
    const amount = !max || min === max ? `${min}` : `${min}-${max}`
    const suffix = full ? ' hourly' : '/hr'
    return `$${amount}${suffix}`
  } else {
    const amount = !max || min === max ? `$${min}` : `$${min}-$${max}`
    const suffix = full ? ' salary' : ''
    return amount + suffix
  }
}

export function formatBytes(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  if (i === 0) return `${bytes} ${sizes[i]}`
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}
