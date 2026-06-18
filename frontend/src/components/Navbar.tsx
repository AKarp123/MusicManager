type NavbarProps = {
	onSignOut: () => void
}

export default function Navbar({ onSignOut }: NavbarProps) {
	return (
		<nav className="mb-2 flex w-[70vw] items-center justify-between border border-white/25 bg-black px-6 py-3 text-white">
			<p className="text-lg font-semibold">Music Manager</p>
			<button
				className="cursor-pointer border border-white/25 px-4 py-2 text-sm font-medium transition hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
				onClick={onSignOut}
			>
				Sign Out
			</button>
		</nav>
	)
}
