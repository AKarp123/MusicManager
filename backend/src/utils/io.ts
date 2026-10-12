import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

/**
 * Directory & File Utilities
 */

export type DirectoryEntry = {
	name: string
	isDirectory: boolean
}

export const validDirectories = ['/library', '/temp']

export const validatePath = (path: string): string => {
	if (!resolve(path).startsWith(resolve(validDirectories[0]))) {
		throw new Error(
			`Path must start with one of ${validDirectories.join(', ')}`
		)
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
 * Read directory and returns its contents
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
