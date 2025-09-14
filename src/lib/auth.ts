import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from './db-adapter'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        userType: { label: 'User Type', type: 'text' } // 'student' or 'recruiter'
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.userType) {
          return null
        }

        try {
          let user
          
          if (credentials.userType === 'student') {
            user = await db.getStudentByEmail(credentials.email)
            if (!user) {
              return null // Student must exist in database
            }
          } else if (credentials.userType === 'recruiter') {
            user = await db.getRecruiterByEmail(credentials.email)
            if (!user) {
              return null // Recruiter must exist in database
            }
          } else {
            return null
          }

          // User exists in database
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            userType: credentials.userType,
          }
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userType = user.userType
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string
        session.user.userType = token.userType as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup'
  },
  session: {
    strategy: 'jwt' as const
  }
}

export default NextAuth(authOptions)