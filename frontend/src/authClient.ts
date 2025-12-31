import { createAuthClient } from 'better-auth/client'
import { usernameClient } from 'better-auth/client/plugins'

const baseURL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3000'

export const authClient = createAuthClient({
  baseURL,
  basePath: '/api/auth',
  plugins: [usernameClient()]
})
