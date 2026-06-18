import { Router, Route } from 'wouter'
import { useLocation } from 'wouter'
import Login from './pages/Login'
import AuthRoute from './components/AuthRoute'
import Navbar from './components/Navbar'
import { authClient } from './authClient'

// Example protected page - replace with your actual pages
function Home() {
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
		<main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
			<Navbar onSignOut={handleSignOut} />
			<section className="flex min-h-[80vh] min-w-[70vw] flex-col justify-between border border-white/25 bg-black p-6">
				<h1 className="text-3xl font-semibold">Home</h1>
				<p className="text-white/80">This is a protected route</p>
			</section>
		</main>
	)
}

function App() {
	return (
		<Router>
			<Route path="/login" component={Login} />
			<Route path="/">
				<AuthRoute>
					<Home />
				</AuthRoute>
			</Route>
		</Router>
	)
}

export default App
