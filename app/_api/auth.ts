/**
 * @file This file contains functions related to user authentication and authorization.
 * @summary This module exports functions for user login, logout, registration, email verification, password reset, and user deletion.
 */
'use server'

import { Prisma, User } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { cookies } from 'next/headers'

import {
  ActionError,
  LoginError,
  PasswordResetData,
  PasswordResetError,
  RegisterData,
  RegisterError,
  SendVerificationEmailError,
  VerifyEmailData,
  VerifyEmailError,
} from '@/_api/types'
import { prisma } from '@/_lib/database'
import { sendEmail } from '@/_lib/email'
import { Result, Session, decrypt, encrypt, expires } from 'kiyoi'
import VerifyEmail from '../../emails/VerifyEmail'

/**
 * Authenticates a user with the provided email and password.
 * @param email The email of the user to authenticate.
 * @param password The password of the user to authenticate.
 * @returns An asynchronous result containing either the authenticated user or a login error.
 */
export async function login(email: string, password: string): Result.Async<User, LoginError> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return Result.error(LoginError.InvalidCredentials)

  const passwordValid = await bcrypt.compare(password, user.password)
  if (!passwordValid) return Result.error(LoginError.InvalidCredentials)

  prisma.redact(user, ['password', 'dob', 'taxId'])

  const session = Session.create(
    {
      userId: user.id,
      role: user.role,
    },
    [expires(60 * 60 * 24 * 30)]
  )
  await Session.save(session, cookies())

  return Result.ok(user)
}

export async function logout(): Result.Async<void, never> {
  Session.destroy(cookies())
  return Result.ok()
}

export async function register(
  data: RegisterData
): Result.Async<Pick<User, 'id' | 'role'>, RegisterError> {
  const result = await RegisterData.safeParseAsync(data)
  if (!result.success) Result.error(RegisterError.InvalidData)

  if (!data.terms || !data.privacy || !data.disclaimer)
    if (data.password !== data.confirmPassword) Result.error(RegisterError.PasswordMismatch)

  const [dob, taxId, password] = await Promise.all([
    encrypt(data.dob),
    encrypt(data.taxId),
    bcrypt.hash(data.password, 10),
  ])

  try {
    const userData: RegisterData = data
    prisma.redact(userData, [
      'password',
      'confirmPassword',
      'terms',
      'privacy',
      'disclaimer',
      'dob',
      'taxId',
    ])
    const user = await prisma.user.create({
      data: {
        ...userData,
        dob,
        taxId,
        password,
      },
    })

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

    if (!res.ok) return Result.error(RegisterError.SendEmailFailed)

    return Result.ok({
      id: user.id,
      role: user.role,
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        if (err.meta?.target?.toString().includes('email') ?? false) {
          return Result.error(RegisterError.EmailExists)
        }
      }
    }

    console.error(err)

    return Result.error(RegisterError.ServerError)
  }
}

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

export async function forgotPassword(email: string): Result.Async<void, never> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return Result.ok()

  const hash = crypto.createHash('sha256').update(user.password).digest('hex')

  const data: PasswordResetData = {
    id: user.id,
    expires: Date.now() + 1000 * 60 * 60 * 24,
    hash,
  }

  const token = await encrypt(data)

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${encodeURIComponent(
    token
  )}`

  // await transport.sendMail({
  //   from: process.env.EMAIL_FROM,
  //   replyTo: process.env.EMAIL_REPLY_TO,
  //   to: user.email,
  //   subject: 'Reset your password',
  //   html: render(React.createElement(ResetPassword, { url })),
  //   text: render(React.createElement(ResetPassword, { url }), { plainText: true }),
  // })

  return Result.ok()
}

export async function resetPassword(
  token: string,
  password: string,
  confirmPassword: string
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
  token: string
): Result.Async<void, PasswordResetError> {
  const data = await decrypt<PasswordResetData>(token)
  if (!data) return Result.error(PasswordResetError.InvalidToken)

  if (data.expires < Date.now()) return Result.error(PasswordResetError.ExpiredToken)

  const user = await prisma.user.findUnique({ where: { id: data.id } })
  if (!user) return Result.error(PasswordResetError.InvalidToken)

  const tokenHash = crypto.createHash('sha256').update(user.password).digest('hex')
  if (tokenHash !== data.hash) return Result.error(PasswordResetError.InvalidToken)

  return Result.ok()
}

export async function developmentDeleteUser(key: string): Result.Async<void, ActionError> {
  if (
    process.env.NODE_ENV !== 'development' ||
    !key ||
    key !== process.env.NEXT_PUBLIC_DELETE_USER_KEY
  )
    return Result.error(ActionError.ServerError)
  try {
    await prisma.user.deleteMany({
      where: { email: 'john@example.org' },
    })
    return Result.ok()
  } catch (err) {
    console.log(err)
    return Result.error(ActionError.ServerError)
  }
}
