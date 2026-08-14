import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import { db, user } from '@furbase/db'
import { eq } from 'drizzle-orm'

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
    async jwt({ token, user: u }) {
      if (u?.id) {
        token.id = u.id
        token.picture = u.image

        // DB role is the primary source of truth (editable in /admin/users).
        // ADMIN_EMAILS is a bootstrap fallback so an admin always survives a
        // DB reset — listed emails get write-through admin on every sign-in.
        const isEnvAdmin = adminEmails().includes(u.email ?? '')
        if (isEnvAdmin) {
          await db.update(user).set({ role: 'admin' }).where(eq(user.id, u.id))
          token.role = 'admin'
        } else {
          const row = await db
            .select({ role: user.role })
            .from(user)
            .where(eq(user.id, u.id))
            .then((r) => r[0])
          token.role = row?.role ?? 'user'
        }
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
