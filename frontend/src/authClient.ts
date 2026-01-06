import { createAuthClient } from 'better-auth/client'
import { usernameClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
	baseURL: '', // Use relative URLs - Vite will proxy to backend
	basePath: '/api/auth',
	plugins: [usernameClient()]
})
