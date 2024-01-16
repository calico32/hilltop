'use server'

import { ActionError } from '@/_api/types'
import { prisma } from '@/_lib/database'
import { Result } from 'kiyoi'

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
