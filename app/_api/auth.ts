'use server'

import { Prisma, User } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import crypto from 'crypto'
import * as Iron from 'iron-webcrypto'
import { cookies } from 'next/headers'

import {
  LoginError,
  PasswordResetData,
  PasswordResetError,
  RegisterData,
  RegisterError,
} from '@/_api/types'
import { prisma } from '@/_lib/database'
import { Result, Session, encrypt, expires } from 'kiyoi'

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

export async function passkeyLogin(passkey: any): Result.Async<User, LoginError> {
  throw new Error('Not implemented')
}

export async function logout(): Result.Async<void, never> {
  Session.destroy(cookies())

  await new Promise((resolve) => setTimeout(resolve, 250))

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
    const user = await prisma.user.create({
      data: {
        ...data,
        dob,
        taxId,
        password,
      },
    })

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

    return Result.error(RegisterError.ServerError)
  }
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

  const token = await Iron.seal(crypto, data, process.env.SESSION_SECRET!, Iron.defaults)

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
  const data = (await Iron.unseal(
    crypto,
    token,
    process.env.SESSION_SECRET!,
    Iron.defaults
  )) as PasswordResetData
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
  const data = (await Iron.unseal(
    crypto,
    token,
    process.env.SESSION_SECRET!,
    Iron.defaults
  )) as PasswordResetData
  if (!data) return Result.error(PasswordResetError.InvalidToken)

  if (data.expires < Date.now()) return Result.error(PasswordResetError.ExpiredToken)

  const user = await prisma.user.findUnique({ where: { id: data.id } })
  if (!user) return Result.error(PasswordResetError.InvalidToken)

  const tokenHash = crypto.createHash('sha256').update(user.password).digest('hex')
  if (tokenHash !== data.hash) return Result.error(PasswordResetError.InvalidToken)

  return Result.ok()
}
