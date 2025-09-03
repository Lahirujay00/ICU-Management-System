import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

// Debug: Check if environment variables are loaded
console.log('🔧 NextAuth Debug - Environment check:')
console.log('- GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID || '❌ Missing (using fallback)')
console.log('- GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set (length: ' + process.env.GOOGLE_CLIENT_SECRET.length + ')' : '❌ Missing (using fallback)')
console.log('- NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '❌ Missing (will auto-detect)')
console.log('- NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Set' : '❌ Missing (using fallback)')
console.log('- NODE_ENV:', process.env.NODE_ENV)
console.log('- All env keys containing GOOGLE:', Object.keys(process.env).filter(key => key.includes('GOOGLE')))
console.log('🔧 Using hardcoded Google OAuth credentials as fallback')

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '249106193059-hn2u8r0p4klh3kgh0mko4e5vj7om5gnr.apps.googleusercontent.com',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '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',
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
      console.log('🔐 SignIn callback triggered:', { 
        provider: account?.provider, 
        email: user?.email,
        name: user?.name 
      })
      
      // For Google sign-in, check if the user is an admin
      if (account?.provider === 'google') {
        // Define admin emails - in production, this should be stored in your database
        const adminEmails = [
          'admin@icu.com',
          'doctor@icu.com',
          'nurse@icu.com',
          // Add your Gmail address here for testing
          'lahirutharaka02@gmail.com' // Replace with your actual Gmail address
        ];
        
        console.log('👤 Checking admin access for:', user.email)
        console.log('📋 Admin emails list:', adminEmails)
        
        // Check if the user's email is in the admin list
        if (adminEmails.includes(user.email)) {
          console.log('✅ Admin access granted for:', user.email)
          // Set admin role based on email domain or specific emails
          user.role = 'admin';
          user.department = 'ICU';
          return true;
        } else {
          console.log('❌ Admin access denied for:', user.email)
          // Reject sign-in for non-admin users
          return false;
        }
      }
      
      // For credentials provider, allow sign-in (already handled in authorize)
      console.log('✅ Credentials sign-in allowed')
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