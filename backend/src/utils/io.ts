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

export const normalizePath = (path: string): string => {
	if (!resolve(path).startsWith(resolve(baseDirectory))) {
		throw new Error(`Path must start with ${baseDirectory}`)
	}

	return path
}

export const listDirectories = async (path: string): Promise<string[]> => {
	const entries = await readdir(path, { withFileTypes: true })
	const directories = entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
	return directories
}
/**
 *
 * @param path - Directory Path
 * @returns List of file and directory names
 */
export const readDirectory = async (
	path: string
): Promise<DirectoryEntry[]> => {
	const entries = await readdir(path, { withFileTypes: true })
	const directoryEntries = entries.map((entry) => ({
		name: entry.name,
		isDirectory: entry.isDirectory()
	}))
	return directoryEntries
}
