import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
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
    async signIn({ user, account, profile }) {
      // For Google sign-in, check if the user is an admin
      if (account?.provider === 'google') {
        // Define admin emails - in production, this should be stored in your database
        const adminEmails = [
          'admin@icu.com',
          'doctor@icu.com',
          'nurse@icu.com',
          // Add your Gmail address here for testing
          'your-gmail@gmail.com' // Replace with your actual Gmail address
        ];
        
        // Check if the user's email is in the admin list
        if (adminEmails.includes(user.email)) {
          // Set admin role based on email domain or specific emails
          user.role = 'admin';
          user.department = 'ICU';
          return true;
        } else {
          // Reject sign-in for non-admin users
          return false;
        }
      }
      
      // For credentials provider, allow sign-in (already handled in authorize)
      return true;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role
        session.user.department = token.department
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role || 'admin'
        token.department = user.department || 'ICU'
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