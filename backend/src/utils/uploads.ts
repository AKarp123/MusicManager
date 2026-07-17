import { lstat, mkdir, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, join } from 'node:path'
import { createExtractorFromFile } from 'node-unrar-js'
import * as unzipper from 'unzipper'

const tempDirectory = '/temp'
const archiveExtensions = ['.zip', '.rar']

const isMacMetadata = (name: string): boolean => {
	const normalizedName = name.toLowerCase()
	return normalizedName === '__macosx' || normalizedName === '.ds_store'
}

export type UploadMode = 'archive' | 'folder'

const normalizeRelativePath = (path: string): string => {
	const normalizedPath = path.replaceAll('\\', '/')

	if (
		normalizedPath.length === 0 ||
		normalizedPath.startsWith('/') ||
		normalizedPath
			.split('/')
			.some((part) => part === '' || part === '.' || part === '..')
	) {
		throw new Error('Upload paths must be relative paths without traversal.')
	}

	return normalizedPath
}

const archiveDirectoryName = (filename: string): string => {
	const lowercaseFilename = filename.toLowerCase()
	const extension = archiveExtensions.find((candidate) =>
		lowercaseFilename.endsWith(candidate)
	)
	const name = basename(filename, extension ?? extname(filename)).trim()

	return name.replaceAll(/[<>:"/\\|?*]/g, '_') || 'archive'
}

const removeMacMetadata = async (directory: string): Promise<void> => {
	const entries = await readdir(directory, { withFileTypes: true })

	for (const entry of entries) {
		const path = join(directory, entry.name)

		if (isMacMetadata(entry.name)) {
			await rm(path, { recursive: true, force: true })
		} else if (entry.isDirectory()) {
			await removeMacMetadata(path)
		}
	}
}

const assertSafeExtractedFiles = async (directory: string): Promise<void> => {
	const entries = await readdir(directory, { withFileTypes: true })

	for (const entry of entries) {
		const path = join(directory, entry.name)
		const stats = await lstat(path)

		if (stats.isDirectory()) {
			await assertSafeExtractedFiles(path)
			continue
		}

		if (!stats.isFile()) {
			throw new Error(
				'Archives may only contain regular files and directories.'
			)
		}
	}
}

const assertSafeArchivePath = (path: string): string => {
	const normalizedPath = path.replaceAll('\\', '/').replace(/\/+$/, '')

	if (
		normalizedPath.length === 0 ||
		normalizedPath.startsWith('/') ||
		normalizedPath
			.split('/')
			.some((part) => part === '' || part === '.' || part === '..')
	) {
		throw new Error('Archive contains an unsafe file path.')
	}

	return normalizedPath
}

const extractZipArchive = async (
	archivePath: string,
	extractedDirectory: string
): Promise<void> => {
	const archive = await unzipper.Open.file(archivePath)

	for (const entry of archive.files) {
		assertSafeArchivePath(entry.path)

		if (entry.type !== 'Directory' && entry.type !== 'File') {
			throw new Error(
				'Archives may only contain regular files and directories.'
			)
		}
	}

	await archive.extract({ path: extractedDirectory })
}

const extractRarArchive = async (
	archivePath: string,
	extractedDirectory: string
): Promise<void> => {
	const extractor = await createExtractorFromFile({
		filepath: archivePath,
		targetPath: extractedDirectory,
		filenameTransform: assertSafeArchivePath
	})
	const { fileHeaders } = extractor.getFileList()

	for (const fileHeader of fileHeaders) {
		assertSafeArchivePath(fileHeader.name)
	}

	const { files } = extractor.extract()
	for (const file of files) {
		void file
		// Exhausting this generator completes extraction and releases native resources.
	}
}

const stageDirectory = (sessionDirectory: string): string =>
	join(sessionDirectory, `.upload-${crypto.randomUUID()}`)

export const getSessionUploadDirectory = async (
	sessionId: string
): Promise<string> => {
	const directory = join(tempDirectory, sessionId)
	await mkdir(directory, { recursive: true })
	return directory
}

export const clearSessionUploadDirectory = async (
	sessionId: string
): Promise<void> => {
	await rm(join(tempDirectory, sessionId), { recursive: true, force: true })
}

export const stageFolderUpload = async (
	sessionDirectory: string,
	files: File[],
	relativePaths: string[]
): Promise<string[]> => {
	if (files.length !== relativePaths.length) {
		throw new Error('Each uploaded file must have a matching relative path.')
	}

	const paths = relativePaths.map(normalizeRelativePath)
	const uniquePaths = new Set(paths)

	if (uniquePaths.size !== paths.length) {
		throw new Error('An upload cannot contain the same path more than once.')
	}

	const rootNames = [...new Set(paths.map((path) => path.split('/')[0]))]

	const stagingDirectory = stageDirectory(sessionDirectory)
	await mkdir(stagingDirectory, { recursive: true })

	try {
		for (const [index, file] of files.entries()) {
			const targetPath = join(stagingDirectory, paths[index])

			await mkdir(dirname(targetPath), { recursive: true })
			await writeFile(targetPath, new Uint8Array(await file.arrayBuffer()), {
				flag: 'w'
			})
		}

		for (const rootName of rootNames) {
			await rm(join(sessionDirectory, rootName), {
				recursive: true,
				force: true
			})
			await rename(
				join(stagingDirectory, rootName),
				join(sessionDirectory, rootName)
			)
		}

		return rootNames
	} finally {
		await rm(stagingDirectory, { recursive: true, force: true })
	}
}

export const extractArchiveUpload = async (
	sessionDirectory: string,
	file: File
): Promise<string> => {
	const filename = basename(file.name)
	const lowercaseFilename = filename.toLowerCase()

	if (
		!archiveExtensions.some((extension) =>
			lowercaseFilename.endsWith(extension)
		)
	) {
		throw new Error(`Unsupported archive type: ${filename}`)
	}

	const stagingDirectory = stageDirectory(sessionDirectory)
	const archivePath = join(stagingDirectory, filename)
	const extractedDirectory = join(stagingDirectory, 'extracted')
	await mkdir(extractedDirectory, { recursive: true })

	try {
		await writeFile(archivePath, new Uint8Array(await file.arrayBuffer()), {
			flag: 'w'
		})

		if (lowercaseFilename.endsWith('.zip')) {
			await extractZipArchive(archivePath, extractedDirectory)
		} else {
			await extractRarArchive(archivePath, extractedDirectory)
		}

		await removeMacMetadata(extractedDirectory)
		await assertSafeExtractedFiles(extractedDirectory)
		const extractedItems = await readdir(extractedDirectory, {
			withFileTypes: true
		})

		if (extractedItems.length === 0) {
			throw new Error('Archive does not contain any files or folders.')
		}

		const shouldWrapContents =
			extractedItems.some((item) => item.isFile()) ||
			extractedItems.filter((item) => item.isDirectory()).length > 1
		const destination = join(
			sessionDirectory,
			shouldWrapContents
				? archiveDirectoryName(filename)
				: extractedItems[0].name
		)
		await rm(destination, { recursive: true, force: true })

		if (shouldWrapContents) {
			await mkdir(destination, { recursive: true })

			for (const item of extractedItems) {
				await rename(
					join(extractedDirectory, item.name),
					join(destination, item.name)
				)
			}

			return destination
		}

		await rename(join(extractedDirectory, extractedItems[0].name), destination)

		return destination
	} finally {
		await rm(stagingDirectory, { recursive: true, force: true })
	}
}
