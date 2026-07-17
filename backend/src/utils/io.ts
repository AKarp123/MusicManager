import { readdir } from 'fs/promises'

/**
 * Directory & File Utilities
 */

const baseDirectory = '/library'

const normalizePath = (path: string): string => {
	if (!path.startsWith(baseDirectory)) {
		throw new Error(`Path must start with ${baseDirectory}`)
	}
	return path
}

export const listDirectories = async (path: string): Promise<string[]> => {
	try {
		path = normalizePath(path)
		const entries = await readdir(path, { withFileTypes: true })
		const directories = entries
			.filter((entry) => entry.isDirectory())
			.map((entry) => entry.name)
		return directories
	} catch (error) {
		console.error(`Error reading directory ${path}:`, error)
		throw error
	}
}
