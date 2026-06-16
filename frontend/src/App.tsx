import { Router, Route } from 'wouter'
import { useLocation } from 'wouter'
import Login from './pages/Login'
import AuthRoute from './components/AuthRoute'
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
		<main>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '20px' 
				}}
			>
				<h1>Home</h1>
				<button onClick={handleSignOut} style={{ padding: '8px 16px', cursor: 'pointer' }}>
					Sign Out
				</button>
			</div>
			<p>This is a protected route</p>
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
