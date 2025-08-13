'use client'

import { SessionProvider } from 'next-auth/react'

export function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>
}

export const authConfig = {
  providers: [],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role
        session.user.department = token.department
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.department = user.department
      }
      return token
    }
  }
} 