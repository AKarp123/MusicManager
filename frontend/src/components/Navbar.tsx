import { Link } from "wouter"

type NavbarProps = {
	onSignOut: () => void
}

const routes = [{
	name: 'Home',
	path: '/'

}, {
	name: 'Profile',
	path: '/'
}]

export default function Navbar({ onSignOut }: NavbarProps) {
	return (
		<nav className="flex w-[70vw] items-center justify-between border border-b-0 border-white/25 bg-black px-6 text-white">
			<p className="text-lg font-semibold">Music Manager</p>
			<div className="flex space-x-4">
				{routes.map((route) => (
					<Link
						key={route.path}
						to={route.path}
						
						className="cursor-pointer px-3 py-1 m-1 text-sm font-medium transition duration-300 hover:bg-gray-500 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
					>
						{route.name}
					</Link>
				))}
			</div>
			<button
				className="cursor-pointer border border-white/25 px-3 py-1 m-1 text-sm font-medium transition hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
				onClick={onSignOut}
			>
				Sign Out
			</button>
		</nav>
	)
}
