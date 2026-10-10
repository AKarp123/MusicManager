import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './utils/auth.ts'
import { createInitialUser } from './init.ts'
import userRoutes from './routes/userRoutes.ts'
import uploadRoutes from './routes/uploadRoutes.ts'
import directoryRoutes from './routes/directoryRoutes.ts'

import { getMigrations } from 'better-auth/db/migration'
import { AuthEnv } from './utils/requireAuth.ts'

const app = new Hono<AuthEnv>()

const initializeDatabase = async () => {
	const { runMigrations } = await getMigrations(auth.options)
	await runMigrations()
	await createInitialUser()
}

initializeDatabase().catch((error) => {
	console.error('Failed to initialize the database:', error)
})

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
app.use(
	'/api/auth/*',
	cors({
		origin: frontendUrl,
		credentials: true
	})
)

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
	return auth.handler(c.req.raw)
})

app.route('/api', userRoutes)
app.route('/api', uploadRoutes)
app.route('/api', directoryRoutes)

Deno.serve({ port: 3000 }, app.fetch)
