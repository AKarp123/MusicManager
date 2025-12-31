import { auth } from './utils/auth'
import { db } from './utils/db'
import { user } from '../auth-schema'
import { password } from 'bun'

const DEFAULT_USERNAME = process.env.DEFAULT_USER_NAME || 'admin'

export const createInitialUser = async () => {
  const defaultPassword = process.env.DEFAULT_USER_PWD
  if (!defaultPassword) {
	  console.warn('DEFAULT_USER_PWD is missing; skipping default user creation.')
	  return
	}
	
	const existingUser = await db.query.user.findFirst({
		where: (user, { eq }) => eq(user.username, DEFAULT_USERNAME)
	})
	if (existingUser) {
		console.log('Default user already exists; skipping creation.')
		return
	}
	else {
		try {
			const ctx = await auth.$context;
			const hashedPassword = await password.hash(defaultPassword);
			console.log('Default user created with username:', DEFAULT_USERNAME);
			const newUser = await ctx.internalAdapter.createUser({
				username: DEFAULT_USERNAME,
				password: hashedPassword,
				email: 'a@a.com',
				name: 'Admin',
			});
			console.log('Created user:', newUser);

			await ctx.internalAdapter.linkAccount({
				userId: newUser.id,
				providerId: 'credential',
				accountId: DEFAULT_USERNAME,
				password: hashedPassword,
			});
			console.log('Linked internal account for user:', newUser.id);
			
			

		}
		catch (error) {
			console.error('Error creating default user:', error)
			return
		}

	} 
}
