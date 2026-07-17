import { readdir } from 'fs/promises'
import { resolve } from 'path'

/**
 * Directory & File Utilities
 */

export type DirectoryEntry = {
	name: string
	isDirectory: boolean
}

const baseDirectory = '/library'

const normalizePath = (path: string): string => {
	if (!resolve(path).startsWith(resolve(baseDirectory))) {
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
/**
 *
 * @param path - Directory Path
 * @returns List of file and directory names
 */
export const readDirectory = async (
	path: string
): Promise<DirectoryEntry[]> => {
	try {
		path = normalizePath(path)
		const entries = await readdir(path, { withFileTypes: true })
		const directoryEntries = entries.map((entry) => ({
			name: entry.name,
			isDirectory: entry.isDirectory()
		}))
		return directoryEntries
	} catch (error) {
		console.error(`Error reading directory ${path}:`, error)
		throw error
	}
}
