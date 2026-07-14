import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)

export default {
  providers: [Google],
  session: { strategy: 'jwt' },
  trustHost: true,
  callbacks: {
    jwt({ token, user: u }) {
      if (u) {
        token.id = u.id
        token.role = adminEmails().includes(u.email ?? '') ? 'admin' : 'user'
        token.picture = u.image
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as 'user' | 'admin'
      session.user.image = (token.picture as string) ?? null
      return session
    },
  },
} satisfies NextAuthConfig
