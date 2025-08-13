import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // For now, let's use a simple demo authentication
          // In production, this should call your backend API
          if (credentials.email === 'admin@icu.com' && credentials.password === 'admin123') {
            return {
              id: '1',
              email: credentials.email,
              name: 'Admin User',
              role: 'admin',
              department: 'ICU'
            }
          }
          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
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
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
  session: {
    strategy: 'jwt',
  }
})

export { handler as GET, handler as POST } 