import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db, user, account, session, verificationToken } from '@shelter-os/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: user,
    accountsTable: account,
    sessionsTable: session,
    verificationTokensTable: verificationToken,
  }),
  providers: [Google],
  callbacks: {
    session({ session, user: u }) {
      session.user.id = u.id
      return session
    },
  },
})
