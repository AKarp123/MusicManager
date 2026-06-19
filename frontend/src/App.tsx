import { Router, Route } from 'wouter'
import Login from '@/pages/Login'
import AuthRoute from '@/components/AuthRoute'
import { Home } from '@/pages/Home'

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
