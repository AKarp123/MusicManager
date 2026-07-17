import { Hono } from 'hono'
import { listDirectories } from '../utils/io.ts'
import { type AuthEnv, requireAuth } from '../utils/requireAuth.ts'

const userRoutes = new Hono<AuthEnv>()

userRoutes.get('/user', (c) => {
	return c.json({
		message: 'List users route not implemented.'
	})
})

userRoutes.post('/user', (c) => {
	return c.json(
		{
			message: 'Create user route not implemented.'
		},
		501
	)
})

userRoutes.get('/user/:id', (c) => {
	return c.json({
		id: c.req.param('id'),
		message: 'Get user route not implemented.'
	})
})

userRoutes.patch('/user/:id', (c) => {
	return c.json(
		{
			id: c.req.param('id'),
			message: 'Update user route not implemented.'
		},
		501
	)
})

userRoutes.delete('/user/:id', (c) => {
	return c.json(
		{
			id: c.req.param('id'),
			message: 'Delete user route not implemented.'
		},
		501
	)
})

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
