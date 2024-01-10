'use server'

import { Prisma, User } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

import { LoginError, RegisterData, RegisterError, VerifyEmailData } from '@/_api/types'
import { prisma } from '@/_lib/database'
import { sendEmail } from '@/_lib/email'
import { Result, Session, encrypt, expires } from 'kiyoi'
import VerifyEmail from '../../../emails/VerifyEmail'

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
    [expires(60 * 60 * 24 * 30)],
  )
  await Session.save(session, cookies())

  return Result.ok(user)
}

export async function logout(): Result.Async<void, never> {
  Session.destroy(cookies())
  return Result.ok()
}

export async function register(
  data: RegisterData,
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
