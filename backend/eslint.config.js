import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import stylistic from '@stylistic/eslint-plugin'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default defineConfig([
	globalIgnores([
		'node_modules',
		'dist',
		'build',
		'coverage',
		'drizzle',
		'src/better-auth_migrations'
	]),
	{
		files: ['**/*.ts'],
		extends: [js.configs.recommended, tseslint.configs.recommended],
		plugins: {
			'@stylistic': stylistic
		},
		languageOptions: {
			ecmaVersion: 2020,
			globals: {
				...globals.node,
				Bun: 'readonly'
			}
		},
		rules: {
			'@stylistic/indent': ['error', 'tab']
		}
	},
	eslintPluginPrettierRecommended
])
