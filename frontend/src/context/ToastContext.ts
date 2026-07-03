import { createContext, useContext } from 'react'

export type ToastType = 'success' | 'warning' | 'error' | 'info'

export type ToastOptions = {
	title: string
	message?: string
	type?: ToastType
	showClose?: boolean
	duration?: number
}

export type ToastContextValue = {
	showToast: (toast: ToastOptions) => void
	hideToast: () => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
	const context = useContext(ToastContext)

	if (!context) {
		throw new Error('useToast must be used within ToastProvider')
	}

	return context
}
