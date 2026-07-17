import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './utils/auth'
import { createInitialUser } from './init'
import userRoutes from './routes/userRoutes'
import uploadRoutes from './routes/uploadRoutes'

const app = new Hono()
const configuredMaxUploadSize = Number(process.env.MAX_UPLOAD_SIZE_BYTES)
const maxUploadSize =
	Number.isFinite(configuredMaxUploadSize) && configuredMaxUploadSize > 0
		? configuredMaxUploadSize
		: 1024 * 1024 * 1024

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

app.route('/api', userRoutes)
app.route('/api', uploadRoutes)

export default {
	fetch: app.fetch,
	port: 3000,
	maxRequestBodySize: maxUploadSize
}
