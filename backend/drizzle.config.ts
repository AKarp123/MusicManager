import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './auth-schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'file:./musicmanager.db'
  }
})
