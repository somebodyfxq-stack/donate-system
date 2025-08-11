import NextAuth, { NextAuthOptions } from 'next-auth'
import TwitchProvider from 'next-auth/providers/twitch'
import { prisma } from '../../../../lib/prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    TwitchProvider({
      clientId: process.env.TWITCH_CLIENT_ID!,
      clientSecret: process.env.TWITCH_CLIENT_SECRET!
    })
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      await prisma.user.upsert({
        where: { email: user.email },
        update: { name: user.name ?? undefined },
        create: { email: user.email, name: user.name ?? undefined }
      })
      return true
    }
  },
  secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
