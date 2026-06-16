import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './utils/auth'
import { createInitialUser } from './init'

const app = new Hono()

createInitialUser().catch((error) => {
	console.error('Failed to create default user:', error)
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

export default {
	fetch: app.fetch,
	port: 3000
}
