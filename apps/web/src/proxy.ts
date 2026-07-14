import { getToken } from 'next-auth/jwt'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

// matches /admin or /en/admin etc.
const isAdminRoute = (p: string) => /^\/(de\/|en\/)?admin/.test(p)
const isProfileRoute = (p: string) => /^\/(de\/|en\/)?profile$/.test(p)

// Reads the session JWT directly from the cookie instead of wrapping the
// request in next-auth's auth() middleware helper — that helper rebuilds the
// request object when AUTH_URL is set (to correct the host behind Render's
// reverse proxy), which strips internal Next.js routing state that next-intl
// needs for the prefix-less default locale, causing an infinite redirect loop
// on "/". getToken() only reads the cookie, so it never touches that path.
export default async function proxy(req: NextRequest) {
  const { nextUrl } = req

  if (isAdminRoute(nextUrl.pathname) || isProfileRoute(nextUrl.pathname)) {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
      // Render's proxy setup makes protocol auto-detection unreliable (same
      // root cause as the AUTH_URL/host issues) — without this, getToken()
      // can look for the wrong cookie name (missing the __Secure- prefix)
      // and silently find no token even for a logged-in user.
      secureCookie: process.env.NODE_ENV === 'production',
    })
    const isLoggedIn = !!token
    const isAdmin = token?.role === 'admin'

    if (isAdminRoute(nextUrl.pathname)) {
      if (!isLoggedIn)
        return NextResponse.redirect(new URL('/api/auth/signin', nextUrl))
      if (!isAdmin) return NextResponse.redirect(new URL('/', nextUrl))
    }

    if (isProfileRoute(nextUrl.pathname)) {
      if (!isLoggedIn)
        return NextResponse.redirect(new URL('/api/auth/signin', nextUrl))
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
