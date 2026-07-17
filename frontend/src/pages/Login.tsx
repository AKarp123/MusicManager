import { type FormEvent, useState, useEffect } from 'react'
import * as Form from '@radix-ui/react-form'
import { useLocation } from 'wouter'
import { authClient } from '@/authClient'

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
				console.error(error)
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
		<main className="flex min-h-screen items-center justify-center bg-black px-4 py-10 text-white">
			<section className="relative w-full max-w-md border border-white/30 bg-black p-8">
				<div className="mb-8 space-y-2">
					<p className="text-xs font-semibold uppercase tracking-[0.22em] text-white">
						Login
					</p>
				</div>

				<Form.Root className="space-y-5" onSubmit={handleSubmit}>
					<Form.Field className="space-y-2" name="username">
						<div className="flex items-center justify-between">
							<Form.Label className="text-sm font-medium text-white">
								Username
							</Form.Label>
							<Form.Message
								className="text-xs text-white/70"
								match="valueMissing"
							>
								Required
							</Form.Message>
						</div>
						<Form.Control asChild>
							<input
								className="w-full border border-white/25 bg-black px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-white focus:ring-2 focus:ring-white/35"
								type="text"
								name="username"
								autoComplete="username"
								placeholder="username"
								required
								value={username}
								onChange={(event) => setUsername(event.target.value)}
							/>
						</Form.Control>
					</Form.Field>

					<Form.Field className="space-y-2" name="password">
						<div className="flex items-center justify-between">
							<Form.Label className="text-sm font-medium text-white">
								Password
							</Form.Label>
							<Form.Message
								className="text-xs text-white/70"
								match="valueMissing"
							>
								Required
							</Form.Message>
						</div>
						<Form.Control asChild>
							<input
								className="w-full border border-white/25 bg-black px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-white focus:ring-2 focus:ring-white/35"
								type="password"
								name="password"
								autoComplete="current-password"
								placeholder="Enter your password"
								required
								value={password}
								onChange={(event) => setPassword(event.target.value)}
							/>
						</Form.Control>
					</Form.Field>

					<Form.Submit asChild>
						<button
							className="inline-flex w-full items-center justify-center border border-white bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
							type="submit"
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Signing in...' : 'Sign in'}
						</button>
					</Form.Submit>
				</Form.Root>

				{status ? (
					<p className="mt-5 border border-white/30 bg-white/10 px-3 py-2 text-sm text-white/85">
						{status}
					</p>
				) : null}
			</section>
		</main>
	)
}
