import { prisma } from '@/_lib/database'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false },
      {
        status: 401,
      }
    )
  }

  await prisma.passkeyChallenge.deleteMany({
    where: {
      expires: {
        lte: new Date(),
      },
    },
  })

  return NextResponse.json({ success: true })
}
