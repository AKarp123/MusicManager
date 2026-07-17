import { Hono } from 'hono'
import { auth } from '../utils/auth.ts'
import {
	clearSessionUploadDirectory,
	extractArchiveUpload,
	getSessionUploadDirectory,
	stageFolderUpload,
	type UploadMode
} from '../utils/uploads.ts'

const uploadRoutes = new Hono()

const isUploadMode = (value: string): value is UploadMode =>
	value === 'archive' || value === 'folder'

const isFile = (value: FormDataEntryValue): value is File =>
	value instanceof File

uploadRoutes.post('/clear', async (c) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers })

	if (!session) {
		return c.json({ error: 'Authentication is required.' }, 401)
	}

	try {
		await clearSessionUploadDirectory(session.session.id)
		return c.body(null, 204)
	} catch (error) {
		console.error('Failed to clear staged uploads:', error)
		return c.json({ error: 'The staged uploads could not be cleared.' }, 500)
	}
})

uploadRoutes.post('/upload', async (c) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers })

	if (!session) {
		return c.json({ error: 'Authentication is required.' }, 401)
	}

	let formData: FormData
	try {
		formData = await c.req.raw.formData()
	} catch (error) {
		console.error('Invalid upload form data:', error)
		return c.json({ error: 'The upload request could not be read.' }, 400)
	}
	const mode = formData.get('mode')
	const files = formData.getAll('files').filter(isFile)

	if (typeof mode !== 'string' || !isUploadMode(mode)) {
		return c.json({ error: 'Upload mode must be archive or folder.' }, 400)
	}

	if (files.length === 0) {
		return c.json({ error: 'At least one file is required.' }, 400)
	}

	try {
		const sessionDirectory = await getSessionUploadDirectory(session.session.id)

		if (mode === 'archive') {
			const folders: string[] = []
			for (const file of files) {
				folders.push(await extractArchiveUpload(sessionDirectory, file))
			}

			return c.json({ folders }, 201)
		}

		const relativePaths = formData
			.getAll('relativePaths')
			.map((path, index) =>
				typeof path === 'string' ? path : files[index]?.name
			)
			.filter((path): path is string => typeof path === 'string')
		const folders = await stageFolderUpload(
			sessionDirectory,
			files,
			relativePaths.length === files.length
				? relativePaths
				: files.map((file) => file.name)
		)

		return c.json({ folders }, 201)
	} catch (error) {
		console.error('Upload failed:', error)
		const message = error instanceof Error ? error.message : 'Upload failed.'
		const status = message.includes('already exists') ? 409 : 400

		return c.json({ error: message }, status)
	}
})

export default uploadRoutes
