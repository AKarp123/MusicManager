import type { MiddlewareHandler } from 'hono'
import { auth } from './auth.ts'

type AuthSession = {
	session: { id: string }
	user: { id: string }
}

export type AuthEnv = {
	Variables: {
		session: AuthSession
	}
}

export const requireAuth: MiddlewareHandler<AuthEnv> = async (c, next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers })

	if (!session) {
		return c.json({ error: 'Authentication is required.' }, 401)
	}

	c.set('session', session)
	return next()
}
