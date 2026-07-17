import {
	type ChangeEvent,
	type DragEvent,
	useMemo,
	useRef,
	useState
} from 'react'
import axios from 'axios'
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

type SelectedFile = {
	file: File
	relativePath?: string
}

type DroppedFileEntry = {
	isFile: true
	isDirectory: false
	name: string
	file: (
		successCallback: (file: File) => void,
		errorCallback: (error: DOMException) => void
	) => void
}

type DroppedDirectoryEntry = {
	isFile: false
	isDirectory: true
	name: string
	createReader: () => {
		readEntries: (
			successCallback: (entries: DroppedEntry[]) => void,
			errorCallback: (error: DOMException) => void
		) => void
	}
}

type DroppedEntry = DroppedFileEntry | DroppedDirectoryEntry

type DroppedDataTransferItem = {
	webkitGetAsEntry?: () => DroppedEntry | null
}

const createUploadItem = (
	file: File,
	source: UploadMode,
	relativePath = file.webkitRelativePath || file.name
): QueuedUpload => ({
	id: `${source}-${file.name}-${file.size}-${file.lastModified}-${relativePath}`,
	file,
	relativePath,
	source
})

const readEntries = async (
	reader: ReturnType<DroppedDirectoryEntry['createReader']>
): Promise<DroppedEntry[]> => {
	const entries: DroppedEntry[] = []

	while (true) {
		const batch = await new Promise<DroppedEntry[]>((resolve, reject) => {
			reader.readEntries(resolve, reject)
		})

		if (batch.length === 0) {
			return entries
		}

		entries.push(...batch)
	}
}

const getDroppedFiles = async (
	entry: DroppedEntry,
	parentPath = ''
): Promise<SelectedFile[]> => {
	const relativePath = parentPath ? `${parentPath}/${entry.name}` : entry.name

	if (entry.isFile) {
		const file = await new Promise<File>((resolve, reject) => {
			entry.file(resolve, reject)
		})

		return [{ file, relativePath }]
	}

	const entries = await readEntries(entry.createReader())
	const files = await Promise.all(
		entries.map((child) => getDroppedFiles(child, relativePath))
	)

	return files.flat()
}

type UploadResponse = {
	error?: string
	folder?: string
	folders?: string[]
}

const uploadFiles = async (
	uploads: QueuedUpload[],
	mode: UploadMode,
	onProgress: (progress: number) => void
): Promise<string[]> => {
	const formData = new FormData()
	formData.append('mode', mode)

	for (const upload of uploads) {
		formData.append('files', upload.file)

		if (mode === 'folder') {
			formData.append('relativePaths', upload.relativePath)
		}
	}

	try {
		const { data } = await axios.post<UploadResponse>('/api/upload', formData, {
			withCredentials: true,
			onUploadProgress: (event) => {
				if (event.total) {
					onProgress(Math.min(event.loaded / event.total, 1))
				}
			}
		})

		onProgress(1)
		return data.folders || []
	} catch (error) {
		if (axios.isAxiosError<UploadResponse>(error)) {
			throw new Error(
				error.response?.data.error || 'The upload could not be completed.'
			)
		}

		throw error
	}
}

export function Home() {
	const archiveInputRef = useRef<HTMLInputElement | null>(null)
	const folderInputRef = useRef<HTMLInputElement | null>(null)
	const [activeMode, setActiveMode] = useState<UploadMode>('archive')
	const [queuedUploads, setQueuedUploads] = useState<QueuedUpload[]>([])
	const [isUploading, setIsUploading] = useState(false)
	const [uploadProgress, setUploadProgress] = useState<number | null>(null)
	const [isClearingTemp, setIsClearingTemp] = useState(false)
	const { showToast } = useToast()

	const totalSize = useMemo(
		() => queuedUploads.reduce((total, upload) => total + upload.file.size, 0),
		[queuedUploads]
	)

	const addFiles = (files: SelectedFile[], source: UploadMode) => {
		const validFiles =
			source === 'archive' ? files.filter(({ file }) => isArchive(file)) : files
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

		const nextUploads = validFiles.map(({ file, relativePath }) =>
			createUploadItem(file, source, relativePath)
		)

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
		addFiles(
			Array.from(event.target.files ?? []).map((file) => ({ file })),
			'archive'
		)
		event.target.value = ''
	}

	const handleFolderChange = (event: ChangeEvent<HTMLInputElement>) => {
		addFiles(
			Array.from(event.target.files ?? []).map((file) => ({ file })),
			'folder'
		)
		event.target.value = ''
	}

	const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault()
		const mode = activeMode
		const items = Array.from(
			event.dataTransfer.items
		) as unknown as DroppedDataTransferItem[]
		const entries = items
			.map((item) => item.webkitGetAsEntry?.())
			.filter(
				(entry): entry is DroppedEntry => entry !== null && entry !== undefined
			)

		try {
			if (mode === 'folder' && entries.length > 0) {
				const files = await Promise.all(
					entries.map((entry) => getDroppedFiles(entry))
				)
				addFiles(files.flat(), mode)
				return
			}

			addFiles(
				Array.from(event.dataTransfer.files).map((file) => ({ file })),
				mode
			)
		} catch (error) {
			showToast({
				title: 'Unable to read dropped folder',
				message:
					error instanceof Error
						? error.message
						: 'The dropped folder could not be read.',
				type: 'error'
			})
		}
	}

	const clearQueue = () => {
		setQueuedUploads([])
	}

	const clearStagedUploads = async () => {
		if (isClearingTemp || isUploading) {
			return
		}

		setIsClearingTemp(true)

		try {
			const response = await fetch('/api/clear', {
				method: 'POST',
				credentials: 'include'
			})

			if (!response.ok) {
				const result = (await response
					.json()
					.catch(() => ({}))) as UploadResponse
				throw new Error(
					result.error || 'The staged uploads could not be cleared.'
				)
			}

			showToast({
				title: 'Staged uploads cleared',
				type: 'success'
			})
		} catch (error) {
			showToast({
				title: 'Unable to clear staged uploads',
				message:
					error instanceof Error
						? error.message
						: 'The staged uploads could not be cleared.',
				type: 'error'
			})
		} finally {
			setIsClearingTemp(false)
		}
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
		const totalUploadBytes = Math.max(
			queuedUploads.reduce((total, upload) => total + upload.file.size, 0),
			1
		)
		const archiveUploadBytes = archiveUploads.reduce(
			(total, upload) => total + upload.file.size,
			0
		)

		setIsUploading(true)
		setUploadProgress(0)

		try {
			if (archiveUploads.length > 0) {
				uploadedFolders.push(
					...(await uploadFiles(archiveUploads, 'archive', (progress) => {
						setUploadProgress(
							(archiveUploadBytes * progress) / totalUploadBytes
						)
					}))
				)
				archiveUploads.forEach((upload) => uploadedIds.add(upload.id))
			}

			if (folderUploads.length > 0) {
				uploadedFolders.push(
					...(await uploadFiles(folderUploads, 'folder', (progress) => {
						setUploadProgress(
							(archiveUploadBytes +
								(totalUploadBytes - archiveUploadBytes) * progress) /
								totalUploadBytes
						)
					}))
				)
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
			setUploadProgress(null)
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
								<button
									className="cursor-pointer border border-red-300/60 px-3 py-1 text-xs font-semibold text-red-100 transition hover:bg-red-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
									type="button"
									disabled={isUploading || isClearingTemp}
									onClick={clearStagedUploads}
								>
									{isClearingTemp ? 'Clearing Temp...' : 'Clear Temp'}
								</button>
							</div>
						</div>
						<p className="mt-2 text-sm text-white/60">
							{isUploading && uploadProgress !== null
								? `Uploading ${Math.round(uploadProgress * 100)}%`
								: `${queuedUploads.length} file${queuedUploads.length === 1 ? '' : 's'} / ${formatBytes(totalSize)}`}
						</p>
						{isUploading && uploadProgress !== null ? (
							<div
								className="mt-2 h-1 overflow-hidden bg-white/20"
								role="progressbar"
								aria-label="Upload progress"
								aria-valuemin={0}
								aria-valuemax={100}
								aria-valuenow={Math.round(uploadProgress * 100)}
							>
								<div
									className="h-full bg-white transition-[width] duration-150"
									style={{ width: `${uploadProgress * 100}%` }}
								/>
							</div>
						) : null}
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
