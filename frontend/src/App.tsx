import { type ReactNode } from 'react'
import { Router, Route, Switch, useLocation } from 'wouter'
import Login from '@/pages/Login'
import AuthRoute from '@/components/AuthRoute'
import { Home } from '@/pages/Home'
import { Process } from '@/pages/Process'
import { authClient } from '@/authClient'
import Navbar from '@/components/Navbar'
import { AppStateProvider } from '@/context/AppStateProvider'
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
		<main className="flex min-h-screen flex-col items-center bg-black px-4 py-2 text-white">
			<div className="flex min-h-0 w-full max-w-6xl flex-1 flex-col">
				<Navbar onSignOut={handleSignOut} />
				<div className="flex min-h-0 flex-1 flex-col border border-white/25 bg-black p-6">
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
				<Switch>
					<Route path="/login" component={Login} />
					<Route path="/" nest>
						<AuthRoute>
							<AppStateProvider>
								<AppContainer>
									<Switch>
										<Route path="/process" component={Process} />
										<Route path="/" component={Home} />
									</Switch>
								</AppContainer>
							</AppStateProvider>
						</AuthRoute>
					</Route>
				</Switch>
			</Router>
		</ToastProvider>
	)
}

export default App
