'use server'

import { ActionError } from '@/_api/types'
import { prisma } from '@/_lib/database'
import { sendEmail } from '@/_lib/email'
import { fullName } from '@/_lib/format'
import ResetPassword from '@emails/ResetPassword'
import * as bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { Result, decrypt, encrypt } from 'kiyoi'
import { PasswordResetData, PasswordResetError } from './_types'

export async function forgotPassword(email: string): Result.Async<void, ActionError> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return Result.error(ActionError.NotFound)

  const hash = crypto.createHash('sha256').update(user.password).digest('hex')

  const data: PasswordResetData = {
    id: user.id,
    expires: Date.now() + 1000 * 60 * 60 * 24,
    hash,
  }

  const token = await encrypt(data)

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${encodeURIComponent(
    token,
  )}`

  await sendEmail(ResetPassword, {
    to: user.email,
    subject: 'Reset your password',
    props: { name: fullName(user), url },
  })

  return Result.ok()
}

export async function resetPassword(
  token: string,
  password: string,
  confirmPassword: string,
): Result.Async<void, PasswordResetError> {
  const data = await decrypt<PasswordResetData>(token)
  if (!data) return Result.error(PasswordResetError.InvalidToken)

  if (data.expires < Date.now()) return Result.error(PasswordResetError.ExpiredToken)
  if (password !== confirmPassword) return Result.error(PasswordResetError.PasswordMismatch)

  const user = await prisma.user.findUnique({ where: { id: data.id } })
  if (!user) return Result.error(PasswordResetError.InvalidToken)

  const tokenHash = crypto.createHash('sha256').update(user.password).digest('hex')
  if (tokenHash !== data.hash) return Result.error(PasswordResetError.InvalidToken)

  const hashedPassword = await bcrypt.hash(password, 10)
  await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } })

  return Result.ok()
}

export async function isPasswordResetTokenValid(
  token: string,
): Result.Async<void, PasswordResetError> {
  const data = await decrypt<PasswordResetData>(token)
  if (!data) return Result.error(PasswordResetError.InvalidToken)

  if (data.expires < Date.now()) return Result.error(PasswordResetError.ExpiredToken)

  const user = await prisma.user.findUnique({ where: { id: data.id } })
  if (!user) return Result.error(PasswordResetError.InvalidToken)

  const tokenHash = crypto.createHash('sha256').update(user.password).digest('hex')
  if (tokenHash !== data.hash) return Result.error(PasswordResetError.AlreadyUsed)

  return Result.ok()
}
