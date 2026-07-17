import {
	access,
	lstat,
	mkdir,
	readdir,
	rename,
	rm,
	writeFile
} from 'fs/promises'
import { basename, extname, join, relative, resolve } from 'path'
import { createExtractorFromFile } from 'node-unrar-js'
import * as unzipper from 'unzipper'

const tempDirectory = '/temp'
const archiveExtensions = ['.zip', '.rar']

export type UploadMode = 'archive' | 'folder'

const isWithinDirectory = (path: string, directory: string): boolean => {
	const pathRelativeToDirectory = relative(directory, path)

	return (
		pathRelativeToDirectory !== '' &&
		!pathRelativeToDirectory.startsWith('..') &&
		!pathRelativeToDirectory.startsWith('/')
	)
}

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

const hasPath = async (path: string): Promise<boolean> => {
	try {
		await access(path)
		return true
	} catch {
		return false
	}
}

const uniqueDirectory = async (
	parentDirectory: string,
	requestedName: string
): Promise<{ name: string; path: string }> => {
	const safeName = requestedName || 'upload'
	let suffix = 0

	while (true) {
		const name = suffix === 0 ? safeName : `${safeName} (${suffix + 1})`
		const path = join(parentDirectory, name)

		if (!(await hasPath(path))) {
			return { name, path }
		}

		suffix += 1
	}
}

const archiveDirectoryName = (filename: string): string => {
	const lowercaseFilename = filename.toLowerCase()
	const extension = archiveExtensions.find((candidate) =>
		lowercaseFilename.endsWith(candidate)
	)
	const name = basename(filename, extension ?? extname(filename)).trim()

	return name.replaceAll(/[<>:"/\\|?*]/g, '_') || 'archive'
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
	for (const rootName of rootNames) {
		if (await hasPath(join(sessionDirectory, rootName))) {
			throw new Error(`An upload named "${rootName}" already exists.`)
		}
	}

	const stagingDirectory = stageDirectory(sessionDirectory)
	await mkdir(stagingDirectory, { recursive: true })

	try {
		for (const [index, file] of files.entries()) {
			const targetPath = resolve(stagingDirectory, paths[index])

			if (!isWithinDirectory(targetPath, stagingDirectory)) {
				throw new Error('Upload path is outside the staging directory.')
			}

			await mkdir(resolve(targetPath, '..'), { recursive: true })
			await writeFile(targetPath, new Uint8Array(await file.arrayBuffer()), {
				flag: 'wx'
			})
		}

		for (const rootName of rootNames) {
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
			flag: 'wx'
		})

		if (lowercaseFilename.endsWith('.zip')) {
			await extractZipArchive(archivePath, extractedDirectory)
		} else {
			await extractRarArchive(archivePath, extractedDirectory)
		}

		await assertSafeExtractedFiles(extractedDirectory)
		const destination = await uniqueDirectory(
			sessionDirectory,
			archiveDirectoryName(filename)
		)
		await rename(extractedDirectory, destination.path)

		return destination.name
	} finally {
		await rm(stagingDirectory, { recursive: true, force: true })
	}
}
