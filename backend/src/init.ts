import { auth } from './utils/auth'
import { db } from './utils/db'

const DEFAULT_USERNAME = process.env.DEFAULT_USER_NAME || 'admin'

export const createInitialUser = async () => {
	const existingUser = db
		.prepare('select id, role from user where username = ? limit 1')
		.get(DEFAULT_USERNAME) as { id: string; role: string | null } | undefined
	if (existingUser) {
		if (!existingUser.role) {
			db.prepare('update user set role = ? where id = ?').run(
				'admin',
				existingUser.id
			)
		}
		return
	}

	const defaultPassword = process.env.DEFAULT_USER_PWD
	if (!defaultPassword) {
		console.warn('DEFAULT_USER_PWD is missing; skipping default user creation.')
		return
	}

	try {
		await auth.api.createUser({
			body: {
				email: process.env.DEFAULT_USER_EMAIL || 'admin@localhost.local',
				name: 'Admin',
				password: defaultPassword,
				role: 'admin',
				data: { username: DEFAULT_USERNAME }
			}
		})
		console.log('Default admin user created.')
	} catch (error) {
		console.error('Error creating default admin user:', error)
	}
}
