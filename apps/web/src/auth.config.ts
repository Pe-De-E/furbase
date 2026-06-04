import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)

export default {
  providers: [Google],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user: u }) {
      if (u) {
        token.id   = u.id
        token.role = adminEmails().includes(u.email ?? '') ? 'admin' : 'user'
      }
      return token
    },
    session({ session, token }) {
      session.user.id   = token.id as string
      session.user.role = token.role as 'user' | 'admin'
      return session
    },
  },
} satisfies NextAuthConfig
