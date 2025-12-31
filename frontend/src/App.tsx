import { type FormEvent, useState } from 'react'
import { authClient } from './authClient'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    } else if (data?.user?.username) {
      setStatus(`Signed in as ${data.user.username}`)
    } else if (data?.user?.email) {
      setStatus(`Signed in as ${data.user.email}`)
    } else {
      setStatus('Signed in.')
    }

    setIsSubmitting(false)
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

export default App
