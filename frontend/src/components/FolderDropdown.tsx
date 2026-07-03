import { useState } from 'react'
import { type QueuedUpload } from '../types/upload'

type FolderDropdownProps = {
	folder: string
	files: QueuedUpload[]
}

const FolderDropdown = ({ folder, files }: FolderDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<li className="p-4">
			<button
				aria-expanded={isOpen}
				className="flex w-full cursor-pointer items-center justify-between gap-3 text-left transition hover:text-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
				type="button"
				onClick={() => setIsOpen(!isOpen)}
			>
				<span className="min-w-0">
					<span className="block break-all text-sm text-white">{folder}</span>
					<span className="mt-1 block text-xs uppercase text-white/50">
						folder / {files.length} file{files.length === 1 ? '' : 's'}
					</span>
				</span>
				<span className="shrink-0 border border-white/25 px-2 py-1 text-xs font-semibold text-white">
					{isOpen ? 'Hide' : 'Show'}
				</span>
			</button>
			{isOpen && (
				<ul className="mt-4 space-y-3 border-t border-white/10 pt-4">
					{files.map((file) => (
						<li key={file.id} className="break-all text-sm text-white/75">
							{file.relativePath}
						</li>
					))}
				</ul>
			)}
		</li>
	)
}

export default FolderDropdown
