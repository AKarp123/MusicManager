import {
	type ChangeEvent,
	type DragEvent,
	useMemo,
	useRef,
	useState
} from 'react'
import { type QueuedUpload, type UploadMode } from '../types/upload'
import FolderDropdown from '@/components/FolderDropdown'
import { useToast } from '@/context/ToastContext'

const archiveExtensions = ['.zip', '.rar']
const archiveAccept =
	'.zip,.rar,application/zip,application/vnd.rar,application/x-rar-compressed'

const formatBytes = (bytes: number) => {
	if (bytes === 0) {
		return '0 B'
	}

	const units = ['B', 'KB', 'MB', 'GB']
	const unitIndex = Math.min(
		Math.floor(Math.log(bytes) / Math.log(1024)),
		units.length - 1
	)
	const value = bytes / 1024 ** unitIndex

	return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

const isArchive = (file: File) => {
	const name = file.name.toLowerCase()

	return archiveExtensions.some((extension) => name.endsWith(extension))
}

const createUploadItem = (file: File, source: UploadMode): QueuedUpload => ({
	id: `${source}-${file.name}-${file.size}-${file.lastModified}-${file.webkitRelativePath}`,
	file,
	relativePath: file.webkitRelativePath || file.name,
	source
})

type UploadResponse = {
	error?: string
	folder?: string
	folders?: string[]
}

export function Home() {
	const archiveInputRef = useRef<HTMLInputElement | null>(null)
	const folderInputRef = useRef<HTMLInputElement | null>(null)
	const [activeMode, setActiveMode] = useState<UploadMode>('archive')
	const [queuedUploads, setQueuedUploads] = useState<QueuedUpload[]>([])
	const [isUploading, setIsUploading] = useState(false)
	const { showToast } = useToast()

	const totalSize = useMemo(
		() => queuedUploads.reduce((total, upload) => total + upload.file.size, 0),
		[queuedUploads]
	)

	const addFiles = (files: File[], source: UploadMode) => {
		const validFiles = source === 'archive' ? files.filter(isArchive) : files
		const skippedCount = files.length - validFiles.length

		if (validFiles.length === 0) {
			showToast({
				title: 'No files added',
				message:
					source === 'archive'
						? 'Choose a .zip or .rar archive.'
						: 'Choose a folder with files.',
				type: 'warning'
			})
			return
		}

		const nextUploads = validFiles.map((file) => createUploadItem(file, source))

		setQueuedUploads((currentUploads) => {
			const uploadsById = new Map(
				currentUploads.map((upload) => [upload.id, upload])
			)

			for (const upload of nextUploads) {
				uploadsById.set(upload.id, upload)
			}

			return [...uploadsById.values()].sort((first, second) =>
				first.relativePath.localeCompare(second.relativePath)
			)
		})

		showToast({
			title: 'Files added',
			message:
				skippedCount > 0
					? `Added ${validFiles.length} file${validFiles.length === 1 ? '' : 's'} and skipped ${skippedCount} unsupported file${skippedCount === 1 ? '' : 's'}.`
					: `Added ${validFiles.length} file${validFiles.length === 1 ? '' : 's'}.`,
			type: skippedCount > 0 ? 'warning' : 'success'
		})
	}

	const getFolders = useMemo(() => {
		const nonArchive = queuedUploads.filter(
			(upload) => upload.source === 'folder'
		)
		const folders: Record<string, QueuedUpload[]> = {}

		for (const upload of nonArchive) {
			const folder = upload.relativePath.split('/')[0]

			if (!folders[folder]) {
				folders[folder] = []
			}

			folders[folder].push(upload)
		}

		return folders
	}, [queuedUploads])

	const handleArchiveChange = (event: ChangeEvent<HTMLInputElement>) => {
		addFiles(Array.from(event.target.files ?? []), 'archive')
		event.target.value = ''
	}

	const handleFolderChange = (event: ChangeEvent<HTMLInputElement>) => {
		addFiles(Array.from(event.target.files ?? []), 'folder')
		event.target.value = ''
	}

	const handleDrop = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault()
		addFiles(Array.from(event.dataTransfer.files), activeMode)
	}

	const clearQueue = () => {
		setQueuedUploads([])
	}

	const uploadFiles = async (uploads: QueuedUpload[], mode: UploadMode) => {
		const formData = new FormData()
		formData.append('mode', mode)

		for (const upload of uploads) {
			formData.append('files', upload.file)

			if (mode === 'folder') {
				formData.append('relativePaths', upload.relativePath)
			}
		}

		const response = await fetch('/api/upload', {
			method: 'POST',
			body: formData,
			credentials: 'include'
		})
		const result = (await response.json().catch(() => ({}))) as UploadResponse

		if (!response.ok) {
			throw new Error(result.error || 'The upload could not be completed.')
		}

		return result.folders || (result.folder ? [result.folder] : [])
	}

	const submitUploads = async () => {
		if (queuedUploads.length === 0 || isUploading) {
			return
		}

		const archiveUploads = queuedUploads.filter(
			(upload) => upload.source === 'archive'
		)
		const folderUploads = queuedUploads.filter(
			(upload) => upload.source === 'folder'
		)
		const uploadedIds = new Set<string>()
		const uploadedFolders: string[] = []

		setIsUploading(true)

		try {
			if (archiveUploads.length > 0) {
				uploadedFolders.push(...(await uploadFiles(archiveUploads, 'archive')))
				archiveUploads.forEach((upload) => uploadedIds.add(upload.id))
			}

			if (folderUploads.length > 0) {
				uploadedFolders.push(...(await uploadFiles(folderUploads, 'folder')))
				folderUploads.forEach((upload) => uploadedIds.add(upload.id))
			}

			setQueuedUploads((uploads) =>
				uploads.filter((upload) => !uploadedIds.has(upload.id))
			)
			showToast({
				title: 'Upload complete',
				message: `Staged ${uploadedFolders.length} folder${uploadedFolders.length === 1 ? '' : 's'} for processing.`,
				type: 'success'
			})
		} catch (error) {
			setQueuedUploads((uploads) =>
				uploads.filter((upload) => !uploadedIds.has(upload.id))
			)
			showToast({
				title: 'Upload failed',
				message:
					error instanceof Error
						? error.message
						: 'The upload could not be completed.',
				type: 'error'
			})
		} finally {
			setIsUploading(false)
		}
	}

	return (
		<>
			<div className="flex flex-col gap-5 border-b border-white/20 pb-5 md:flex-row md:items-end md:justify-between">
				<div>
					<p className="text-sm font-semibold uppercase text-white/60">
						Upload
					</p>
					<h1 className="mt-1 text-3xl font-semibold">Add Music</h1>
				</div>
				<div className="grid w-full grid-cols-2 border border-white/25 md:w-72">
					<button
						className={`cursor-pointer px-4 py-2 text-sm font-semibold transition ${activeMode === 'archive' ? 'bg-white text-black' : 'bg-black text-white hover:bg-white/10'}`}
						type="button"
						disabled={isUploading}
						onClick={() => setActiveMode('archive')}
					>
						Archive
					</button>
					<button
						className={`cursor-pointer px-4 py-2 text-sm font-semibold transition ${activeMode === 'folder' ? 'bg-white text-black' : 'bg-black text-white hover:bg-white/10'}`}
						type="button"
						disabled={isUploading}
						onClick={() => setActiveMode('folder')}
					>
						Folder
					</button>
				</div>
			</div>

			<div className="grid flex-1 gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
				<div
					className="flex min-h-80 flex-col items-center justify-center border border-dashed border-white/35 p-8 text-center transition hover:border-white"
					onDragOver={(event) => event.preventDefault()}
					onDrop={handleDrop}
				>
					<input
						ref={archiveInputRef}
						className="hidden"
						type="file"
						accept={archiveAccept}
						multiple
						onChange={handleArchiveChange}
					/>
					<input
						ref={(node) => {
							folderInputRef.current = node

							if (node) {
								node.setAttribute('webkitdirectory', '')
								node.setAttribute('directory', '')
							}
						}}
						className="hidden"
						type="file"
						multiple
						onChange={handleFolderChange}
					/>

					<div className="max-w-xl space-y-5">
						<div className="space-y-2">
							<h2 className="text-2xl font-semibold">
								{activeMode === 'archive'
									? 'Upload .zip or .rar archives'
									: 'Upload a full folder'}
							</h2>
							<p className="text-sm leading-6 text-white/70"></p>
						</div>

						<button
							className="cursor-pointer border border-white bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
							type="button"
							disabled={isUploading}
							onClick={() =>
								activeMode === 'archive'
									? archiveInputRef.current?.click()
									: folderInputRef.current?.click()
							}
						>
							{activeMode === 'archive' ? 'Choose Archives' : 'Choose Folder'}
						</button>
					</div>
				</div>

				<aside className="flex h-100 min-h-0 flex-col overflow-hidden border border-white/25">
					<div className="border-b border-white/20 p-4">
						<div className="flex items-center justify-between gap-3">
							<h2 className="text-lg font-semibold">Queue</h2>
							<div className="flex gap-2">
								<button
									className="cursor-pointer border border-white bg-white px-3 py-1 text-xs font-semibold text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
									type="button"
									disabled={queuedUploads.length === 0 || isUploading}
									onClick={submitUploads}
								>
									{isUploading ? 'Uploading...' : 'Upload'}
								</button>
								<button
									className="cursor-pointer border border-white/25 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
									type="button"
									disabled={queuedUploads.length === 0 || isUploading}
									onClick={clearQueue}
								>
									Clear
								</button>
							</div>
						</div>
						<p className="mt-2 text-sm text-white/60">
							{queuedUploads.length} file{queuedUploads.length === 1 ? '' : 's'}{' '}
							/ {formatBytes(totalSize)}
						</p>
					</div>

					<div className="min-h-0 flex-1 overflow-y-auto">
						{queuedUploads.length > 0 ? (
							<ul className="divide-y divide-white/10">
								{queuedUploads
									.filter((upload) => upload.source === 'archive')
									.map((upload) => (
										<li className="space-y-1 p-4" key={upload.id}>
											<p className="break-all text-sm text-white">
												{upload.relativePath}
											</p>
											<p className="text-xs uppercase text-white/50">
												{upload.source} / {formatBytes(upload.file.size)}
											</p>
										</li>
									))}
								{Object.entries(getFolders).map(([folder, uploads]) => (
									<FolderDropdown
										key={folder}
										folder={folder}
										files={uploads}
									/>
								))}
							</ul>
						) : (
							<p className="p-4 text-sm text-white/60">No files queued.</p>
						)}
					</div>
				</aside>
			</div>
		</>
	)
}
