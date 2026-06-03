import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db, user, account, session, verificationToken } from '@furbase/db'
import { eq } from 'drizzle-orm'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: user,
    accountsTable: account,
    sessionsTable: session,
    verificationTokensTable: verificationToken,
  }),
  providers: [Google],
  callbacks: {
    async session({ session, user: u }) {
      session.user.id = u.id
      const [row] = await db.select({ role: user.role }).from(user).where(eq(user.id, u.id))
      session.user.role = row?.role ?? 'user'
      return session
    },
  },
})
