'use server'

import { ActionError } from '@/_api/types'
import { caching, prisma } from '@/_lib/database'
import { Result, Session } from 'kiyoi'
import { cookies } from 'next/headers'

export async function nicknamePasskey(
  credentialId: string,
  nickname: string | null,
): Result.Async<void, ActionError> {
  const session = await Session.get(cookies())
  if (!session.ok) return Result.error(ActionError.Unauthorized)

  const user = await prisma.user.findUnique({
    where: { id: session.value.userId },
    select: {
      id: true,
    },
    cacheStrategy: caching.user,
  })
  if (!user) return Result.error(ActionError.Unauthorized)

  await prisma.passkey.update({
    where: {
      userId: user.id,
      credentialId,
    },
    data: {
      nickname,
    },
  })

  return Result.ok()
}

export async function getPasskeys(): Promise<
  {
    credentialId: string
    nickname: string | null
    created: Date
    updated: Date
    transports: string[]
  }[]
> {
  const session = await Session.get(cookies())
  if (!session.ok) return []

  const user = await prisma.user.findUnique({
    where: { id: session.value.userId },
    select: { id: true },
    cacheStrategy: caching.user,
  })
  if (!user) return []

  const passkeys = await prisma.passkey.findMany({
    where: {
      userId: user.id,
    },
    select: {
      credentialId: true,
      nickname: true,
      created: true,
      updated: true,
      transports: true,
    },
    orderBy: {
      created: 'asc',
    },
  })

  return passkeys
}

export async function deletePasskey(credentialId: string) {
  const session = await Session.get(cookies())
  if (!session.ok) return Result.error(ActionError.Unauthorized)

  const user = await prisma.user.findUnique({
    where: { id: session.value.userId },
    select: { id: true },
    cacheStrategy: caching.user,
  })
  if (!user) return Result.error(ActionError.Unauthorized)

  await prisma.passkey.delete({
    where: {
      userId: user.id,
      credentialId,
    },
  })

  return Result.ok()
}
