import { User } from '@prisma/client'

export function displayName(user: User | null) {
  if (!user) return null
  if (user.preferredName) {
    return user.preferredName.split(' ')[0]
  }

  return user.firstName
}

export function fullName(user: User | null) {
  if (!user) return null
  if (user.preferredName) {
    if (user.preferredName.split(' ').length > 1) {
      return user.preferredName
    }

    return `${user.preferredName} ${user.lastName}`
  }

  return `${user.firstName} ${user.lastName}`
}
