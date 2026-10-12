import { Hono } from 'hono'
import { listDirectories } from '../utils/io.ts'
import { type AuthEnv, requireAuth } from '../utils/requireAuth.ts'

const userRoutes = new Hono<AuthEnv>()

userRoutes.get('/state', requireAuth, async (c) => {
	try {
		const directories = await listDirectories(
			`/temp/${c.get('session').user.id}`
		)
		return c.json({
			directories
		})
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes('ENOENT')) {
				return c.json({
					directories: []
				})
			}
		}
		return c.json(
			{
				message: 'Failed to list directories.',
				error: error instanceof Error ? error.message : String(error)
			},
			500
		)
	}
})

export default userRoutes
