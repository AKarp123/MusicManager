import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './utils/auth'
import { createInitialUser } from './init'
import userRoutes from './routes/userRoutes'
import uploadRoutes from './routes/uploadRoutes'
import { getMigrations } from 'better-auth/db/migration'

const app = new Hono()

const initializeDatabase = async () => {
	const { runMigrations } = await getMigrations(auth.options)
	await runMigrations()
	await createInitialUser()
}

initializeDatabase().catch((error) => {
	console.error('Failed to initialize the database:', error)
})

app.get('/', (c) => {
	return c.text('Hello Hono!')
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

Deno.serve({ port: 3000 }, app.fetch)
