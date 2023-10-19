import { UserSession } from '@/_api/types'
import { Session } from 'kiyoi'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const result = await Session.get<UserSession>(req.cookies)

  const path = req.nextUrl.pathname

  let res: NextResponse

  if (path.startsWith('/login') || path.startsWith('/register')) {
    if (result.ok) {
      res = NextResponse.redirect(new URL('/dashboard', req.url))
    } else {
      res = NextResponse.next()
    }
  } else if (
    path.startsWith('/applications') ||
    path.startsWith('/dashboard') ||
    path.startsWith('/profile') ||
    path.startsWith('/settings')
  ) {
    if (!result.ok) {
      res = NextResponse.redirect(new URL('/login?next=' + encodeURIComponent(path), req.url))
    }
  }

  res ??= NextResponse.next()
  if (result.ok) {
    Session.touch(result.value)
    Session.save(result.value, res.cookies)
  }
  return res
}

export const config = {
  matcher: [
    '/applications/:path*',
    '/dashboard',
    '/admin',
    '/jobs/new',
    '/jobs/:id/:path*',
    '/profile/:path*',
    '/settings',
    '/login',
    '/register',
  ],
}
