import { useEffect, useState } from 'react'
import { useLocation, Redirect } from 'wouter'
import { authClient } from '../authClient'

interface AuthRouteProps {
	children: React.ReactNode
}

export default function AuthRoute({ children }: AuthRouteProps) {
	const [location] = useLocation()
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const session = await authClient.getSession()
				setIsAuthenticated(!!session?.data?.session)
			} catch (error) {
				setIsAuthenticated(false)
			}
		}

		checkAuth()
	}, [])

	// Show loading state while checking authentication
	if (isAuthenticated === null) {
		return (
			<>
			</>
		)
	}

	// If not authenticated, redirect to login with return path
	if (!isAuthenticated) {
		const returnPath = encodeURIComponent(location)
		return <Redirect to={`/login?return=${returnPath}`} />
	}

	// If authenticated, render children
	return <>{children}</>
}

