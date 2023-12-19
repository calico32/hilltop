import { prisma } from '@/_lib/database'
import { NextRequest, NextResponse } from 'next/server'
import sharp, { FormatEnum } from 'sharp'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const query = new URL(req.nextUrl, req.nextUrl).searchParams

  const item = await prisma.storage.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!item || !item.type.startsWith('image/'))
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const size = parseInt(query.get('size') ?? '64')
  const format = (query.get('format') ?? 'png') as keyof FormatEnum

  const validFormats: (keyof FormatEnum)[] = ['avif', 'jpeg', 'png', 'webp', 'gif']

  if (size > 1024) {
    return NextResponse.json({ error: 'Invalid size' }, { status: 400 })
  }

  if (!validFormats.includes(format)) {
    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  }

  const buffer = await sharp(item.data).resize(size).toFormat(format).toBuffer()

  return new NextResponse(buffer, {
    headers: {
      'content-type': `image/${format}`,
      'content-disposition': `inline; filename="${item.name}"`,
      'X-Robots-Tag': 'noindex',
    },
  })
}
