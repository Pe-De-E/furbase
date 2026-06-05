import NextAuth from 'next-auth'
import authConfig from './auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isAdmin = req.auth?.user?.role === 'admin'

  if (nextUrl.pathname.startsWith('/admin')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/api/auth/signin', nextUrl))
    if (!isAdmin)    return NextResponse.redirect(new URL('/', nextUrl))
  }

  if (nextUrl.pathname === '/profile') {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/api/auth/signin', nextUrl))
  }
})

export const config = {
  matcher: ['/admin/:path*', '/profile'],
}
