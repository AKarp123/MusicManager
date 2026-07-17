import { Hono } from 'hono'
import { listDirectories } from '../utils/io'

const directoryRoutes = new Hono()

directoryRoutes.get('/directory/:directoryId', async (c) => {
	const b64path = c.req.param('directoryId')
	const path = atob(b64path)

	const directories = await listDirectories(path).catch((error) => {
		console.error(`Error listing directories for path ${path}:`, error)
		return c.body(null, 500)
	})

	return c.json({
		path,
		directories
	})
})
