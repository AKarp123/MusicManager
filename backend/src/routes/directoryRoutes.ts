import { Hono } from 'hono'
import { listDirectories, normalizePath } from '../utils/io.ts'

const directoryRoutes = new Hono()

directoryRoutes.get('/directory/:directoryId', async (c) => {
	const b64path = c.req.param('directoryId')
	const path = atob(b64path)
	try {
		normalizePath(path)
	} catch (error) {
		console.error(`Error normalizing path ${path}:`, error)
		return c.body(null, 400)
	}

	const directories = await listDirectories(path).catch((error) => {
		console.error(`Error listing directories for path ${path}:`, error)
		return c.body(null, 500)
	})

	return c.json({
		path,
		directories
	})
})
