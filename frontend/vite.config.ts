import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': new URL('./src', import.meta.url).pathname
		}
	},
	server: {
		host: true,
		proxy: {
			'/api': {
				target: process.env.VITE_BACKEND_URL || 'http://backend:3000',
				changeOrigin: true
			}
		}
	}
})
