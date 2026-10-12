import { Link } from 'wouter'
import { authClient } from '@/authClient'
import { Menu } from 'lucide-react'
import { Button } from '@/components/Button'

type NavbarProps = {
	onSignOut: () => void
}

const routes = [
	{
		name: 'Upload',
		path: '/'
	},
	{
		name: 'Process',
		path: '/process'
	},
	{
		name: 'Browse',
		path: '/browse'
	},
	{
		name: 'Users',
		path: '/users'
	}
]

export default function Navbar({ onSignOut }: NavbarProps) {
	const { data: session } = authClient.useSession()
	const isAdmin = session?.user.role?.split(',').includes('admin')

	return (
		<nav className="flex w-full items-center justify-between border border-b-0 border-white/25 bg-black px-2 text-white">
			<div className="flex space-x-4">
				{routes
					.filter((route) => route.path !== '/users' || isAdmin)
					.map((route) => (
						<Link
							key={route.path}
							to={route.path}
							className="cursor-pointer px-3 py-1 m-1 text-sm font-medium transition duration-300 hover:bg-gray-500 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
						>
							{route.name}
						</Link>
					))}
			</div>
			<div className="flex items-center space-x-2">
				<Button
					className="m-1 border-0 px-3 py-1 text-sm font-medium"
					variant="plain"
					size="small"
					onClick={onSignOut}
				>
					Sign Out
				</Button>
				<Menu />
			</div>
		</nav>
	)
}
