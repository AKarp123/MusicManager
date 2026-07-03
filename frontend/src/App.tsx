import { type ReactNode } from 'react'
import { Router, Route, useLocation } from 'wouter'
import Login from '@/pages/Login'
import AuthRoute from '@/components/AuthRoute'
import { Home } from '@/pages/Home'
import { authClient } from '@/authClient'
import Navbar from '@/components/Navbar'
import { ToastProvider } from '@/context/ToastProvider'

function AppContainer({ children }: { children: ReactNode }) {
	const [, setLocation] = useLocation()

	const handleSignOut = async () => {
		try {
			await authClient.signOut()
			setLocation('/login')
		} catch (error) {
			console.error('Error signing out:', error)
		}
	}

	return (
		<main className="flex min-h-screen flex-col items-center bg-black px-4 py-2 justify-center text-white">
			<div className="flex w-full max-w-6xl flex-col">
				<Navbar onSignOut={handleSignOut} />
				<div className="flex min-h-[80vh] flex-col border border-white/25 bg-black p-6">
					{children}
				</div>
			</div>
		</main>
	)
}

function App() {
	return (
		<ToastProvider>
			<Router>
				<Route path="/login" component={Login} />
				<Route path="/">
					<AuthRoute>
						<AppContainer>
							<Home />
						</AppContainer>
					</AuthRoute>
				</Route>
			</Router>
		</ToastProvider>
	)
}

export default App
