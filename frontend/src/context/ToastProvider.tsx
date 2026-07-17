import * as ToastPrimitive from '@radix-ui/react-toast'
import { type ReactNode, useCallback, useMemo, useState } from 'react'
import DisplayToast from '@/components/util/Toast'
import { ToastContext, type ToastOptions } from './ToastContext'

type ToastState = ToastOptions & {
	id: number
	open: boolean
}

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toast, setToast] = useState<ToastState | null>(null)

	const hideToast = useCallback(() => {
		setToast((currentToast) =>
			currentToast ? { ...currentToast, open: false } : null
		)
	}, [])

	const showToast = useCallback((nextToast: ToastOptions) => {
		setToast({
			id: Date.now(),
			type: 'error',
			open: true,
			...nextToast
		})
	}, [])

	const contextValue = useMemo(
		() => ({
			showToast,
			hideToast
		}),
		[hideToast, showToast]
	)

	return (
		<ToastContext.Provider value={contextValue}>
			<ToastPrimitive.Provider swipeDirection="left">
				{children}
				{toast ? <DisplayToast {...toast} onClose={hideToast} /> : null}
				<ToastPrimitive.Viewport className="ToastViewport" />
			</ToastPrimitive.Provider>
		</ToastContext.Provider>
	)
}
