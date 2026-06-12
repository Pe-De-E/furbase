import NextAuth from 'next-auth'
import authConfig from './auth.config'
import { NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)
const { auth } = NextAuth(authConfig)

// matches /admin or /en/admin etc.
const isAdminRoute = (p: string) => /^\/(de\/|en\/)?admin/.test(p)
const isProfileRoute = (p: string) => /^\/(de\/|en\/)?profile$/.test(p)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isAdmin = req.auth?.user?.role === 'admin'

  if (isAdminRoute(nextUrl.pathname)) {
    if (!isLoggedIn)
      return NextResponse.redirect(new URL('/api/auth/signin', nextUrl))
    if (!isAdmin) return NextResponse.redirect(new URL('/', nextUrl))
  }

  if (isProfileRoute(nextUrl.pathname)) {
    if (!isLoggedIn)
      return NextResponse.redirect(new URL('/api/auth/signin', nextUrl))
  }

  return intlMiddleware(req)
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
