import { Role } from '@prisma/client'
import { Enum } from 'kiyoi'
import z from 'zod'

export type UserSession = {
  userId: string
  role: Role
  expires: number
}

export const ActionError = Enum({
  ServerError: 'ServerError',
})
export type ActionError = Enum<typeof ActionError>

export const LoginError = Enum(ActionError, {
  InvalidCredentials: 'InvalidCredentials',
})
export type LoginError = Enum<typeof LoginError>

export const RegisterData = z.object({
  firstName: z.string(),
  middleInitial: z.string().length(1).optional(),
  lastName: z.string(),
  preferredName: z.string().optional(),

  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  taxId: z.string().regex(/^\d{3}-\d{2}-\d{4}$/),

  phone: z.string().regex(/^\d{10}$/),
  email: z.string().email(),

  address1: z.string(),
  address2: z.string().optional(),
  city: z.string(),
  state: z.string().length(2),
  zip: z.string().regex(/^\d{5}$/),

  password: z.string().min(8),
  confirmPassword: z.string().min(8),

  terms: z.boolean(),
  privacy: z.boolean(),
  disclaimer: z.boolean(),
  emailUpdates: z.boolean(),
})

export type RegisterData = z.infer<typeof RegisterData>

export const RegisterError = Enum(ActionError, {
  InvalidData: 'InvalidData',
  EmailExists: 'EmailExists',
  TermsNotAccepted: 'TermsNotAccepted',
  PasswordMismatch: 'PasswordMismatch',
})
export type RegisterError = Enum<typeof RegisterError>

/**
 * Data stored in the reset password token. This is encrypted and sent to the
 * user in an email, and thus does not have to be stored in the database.
 */
export interface PasswordResetData {
  /**
   * The user's ID, used to identify the user when resetting their password
   */
  id: string

  /**
   * The millisecond timestamp at which the reset password link expires.
   */
  expires: number

  /**
   * SHA256 hash of the user's password hash at the time of the request. This
   * ensures that the user has not changed their password since the request was
   * made (so each reset password link can only be used once)
   */
  hash: string
}

export const PasswordResetError = Enum(ActionError, {
  InvalidToken: 'InvalidToken',
  ExpiredToken: 'ExpiredToken',
  PasswordMismatch: 'PasswordMismatch',
})

export type PasswordResetError = Enum<typeof PasswordResetError>
