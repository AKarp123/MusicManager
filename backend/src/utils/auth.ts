import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { username, admin } from 'better-auth/plugins'
import { db } from './db'
import { account, session, user, verification } from '../../auth-schema'

const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:3000'
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173'

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || '',
  baseURL,
  trustedOrigins: [frontendURL],
  plugins: [username()],

  disabledPaths: [
    '/is-username-available',
    '/sign-in/email',
    '/sign-up/email',
    '/verify-email',
    '/send-verification-email',
    '/change-email',
    '/request-password-reset',
    '/reset-password'
  ],
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    requireEmailVerification: false,
    password: {
      hash: async (pwd: string) => {
        const { password } = await import('bun')
        return await password.hash(pwd)
      },
      verify: async (data: { hash: string; password: string }) => {
        const { password } = await import('bun')
        return await password.verify(data.password, data.hash)
      }
    }
  },
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      account,
      session,
      user,
      verification
    }
  })
})
