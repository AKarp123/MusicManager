import { useAppState } from '@/context/AppStateContext'

export function Process() {
	const { state } = useAppState()

	return (
		<div className="flex flex-1 flex-col gap-6">
			<div className="border-b border-white/20 pb-5">
				<p className="text-sm font-semibold uppercase text-white/60">Process</p>
				<h1 className="mt-1 text-3xl font-semibold">Current Directories</h1>
			</div>

			{state.currentDirectories.length > 0 ? (
				<ul className="divide-y divide-white/10 border border-white/25">
					{state.currentDirectories.map((directory) => (
						<li className="break-all p-4 text-sm text-white" key={directory}>
							{directory}
						</li>
					))}
				</ul>
			) : (
				<p className="text-sm text-white/60">No directories are staged.</p>
			)}
		</div>
	)
}
