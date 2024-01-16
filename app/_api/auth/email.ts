'use server'

import { prisma } from '@/_lib/database'
import { sendEmail } from '@/_lib/email'
import VerifyEmail from '@emails/VerifyEmail'
import { Result, Session, decrypt, encrypt } from 'kiyoi'
import { cookies } from 'next/headers'
import { SendVerificationEmailError, VerifyEmailData, VerifyEmailError } from './_types'

export async function sendVerificationEmail(): Result.Async<void, SendVerificationEmailError> {
  const session = await Session.get(cookies())
  if (!session.ok) return Result.error(SendVerificationEmailError.Unauthorized)

  const user = await prisma.user.findUnique({ where: { id: session.value.userId } })
  if (!user) return Result.error(SendVerificationEmailError.Unauthorized)

  const tokenData: VerifyEmailData = {
    id: user.id,
    email: user.email,
    expires: Date.now() + 1000 * 60 * 60 * 24,
  }

  const token = await encrypt(tokenData)

  const res = await sendEmail(VerifyEmail, {
    subject: 'Verify your email on Hilltop',
    to: user.email,
    props: {
      name: user.preferredName?.split(' ')[0] ?? user.firstName,
      token,
    },
  })

  if (!res.ok) return Result.error(SendVerificationEmailError.SendEmailFailed)

  return Result.ok()
}

export async function verifyEmail(token: string): Result.Async<void, VerifyEmailError> {
  const data = await decrypt<VerifyEmailData>(token)
  if (!data) return Result.error(VerifyEmailError.ServerError)

  if (data.expires < Date.now()) return Result.error(VerifyEmailError.ExpiredToken)

  const user = await prisma.user.findUnique({ where: { id: data.id } })
  if (!user) return Result.error(VerifyEmailError.InvalidToken)

  if (user.emailVerified) return Result.error(VerifyEmailError.AlreadyVerified)

  if (user.email !== data.email) return Result.error(VerifyEmailError.EmailMismatch)

  await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } })

  return Result.ok()
}
