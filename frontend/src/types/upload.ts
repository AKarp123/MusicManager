export type UploadMode = 'archive' | 'folder'

export type QueuedUpload = {
	id: string
	file: File
	relativePath: string
	source: UploadMode
}

