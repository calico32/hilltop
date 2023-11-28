import { prisma } from '@/_lib/database'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const item = await prisma.storage.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return new NextResponse(item.data, {
    headers: {
      'content-type': item.type,
      'content-disposition': `inline; filename="${item.name}"`,
    },
  })
}
