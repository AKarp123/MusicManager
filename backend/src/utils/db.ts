import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import * as authSchema from '../../auth-schema'

const sqlite = new Database('musicmanager.db')
export const db = drizzle({
	client: sqlite,
	schema: {
		...authSchema
	}
})
