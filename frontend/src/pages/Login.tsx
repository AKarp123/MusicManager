import { type FormEvent, useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { authClient } from '../authClient'

export default function Login() {
  const [, setLocation] = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if user is already authenticated and redirect
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession()
        if (session?.data?.session) {
          // User is already logged in, redirect to return path or home
          const params = new URLSearchParams(window.location.search)
          const returnPath = params.get('return')
          setLocation(returnPath || '/')
        }
      } catch (error) {
        // Not authenticated, stay on login page
      }
    }

    checkAuth()
  }, [setLocation])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus(null)

    const { data, error } = await authClient.signIn.username({
      username,
      password
    })

    if (error) {
      setStatus(error.message || 'Unable to sign in.')
      setIsSubmitting(false)
    } else if (data?.user) {
      // Successfully signed in, redirect to return path or home
      const params = new URLSearchParams(window.location.search)
      const returnPath = params.get('return')
      setLocation(returnPath || '/')
    } else {
      setStatus('Signed in.')
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Username
            <input
              type="text"
              name="username"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      {status ? <p>{status}</p> : null}
    </main>
  )
}

