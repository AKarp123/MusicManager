import { Hono } from 'hono'
import { listDirectories, validatePath } from '../utils/io.ts'
import { requireAuth, type AuthEnv } from '../utils/requireAuth.ts'

const directoryRoutes = new Hono<AuthEnv>()

directoryRoutes.use(requireAuth)

directoryRoutes.get('/directory', async (c) => {
	const path = c.req.query('path')
	if (!path) return c.body(null, 400)

	try {
		validatePath(path)
	} catch (error) {
		console.error(`Error validating path ${path}:`, error)
		return c.body(null, 400)
	}

	const directories = await listDirectories(path).catch((error) => {
		console.error(`Error listing directories for path ${path}:`, error)
		return c.body(null, 500)
	})

	return c.json({
		directories
	})
})

directoryRoutes.get('/directory/info', async (c) => {
	const path = c.req.query('path')
	if (!path) return c.body(null, 400)

	try {
		validatePath(path)
	} catch (error) {
		console.error(`Error validating path ${path}:`, error)
		return c.body(null, 400)
	}

	return c.json({
		path
	})
})

export default directoryRoutes
