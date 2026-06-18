import { Hono } from 'hono'

const userRoutes = new Hono()

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

export default userRoutes
