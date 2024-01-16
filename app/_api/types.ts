import { Role } from '@prisma/client'
import { Enum } from 'kiyoi'

export type UserSession = {
  userId: string
  role: Role
  expires: number
}

/**
 * Enum representing possible errors that can occur during an action.
 */
export type ActionError = Enum<typeof ActionError>
export const ActionError = Enum({
  ServerError: 'ServerError',
  Unauthorized: 'Unauthorized',
  NotFound: 'NotFound',
  BadRequest: 'BadRequest',
  InvalidState: 'InvalidState',
})
