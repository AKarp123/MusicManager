import { betterAuth } from 'better-auth'
import { username } from 'better-auth/plugins'
import { db } from './db'

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
		requireEmailVerification: false
	},
	database: db
})
