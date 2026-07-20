import { type ReactNode, useEffect, useMemo, useReducer } from 'react'
import {
	appStateReducer,
	AppStateContext,
	initialAppState
} from './AppStateContext'

type StateResponse = {
	directories: string[]
}

export function AppStateProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(appStateReducer, initialAppState)

	useEffect(() => {
		let isActive = true

		const loadCurrentDirectories = async () => {
			try {
				const response = await fetch('/api/state', {
					credentials: 'include'
				})

				if (!response.ok) {
					return
				}

				const { directories } = (await response.json()) as StateResponse

				if (isActive) {
					dispatch({ type: 'setCurrentDirectories', directories })
				}
			} catch (error) {
				console.error('Unable to load current directories:', error)
			}
		}

		void loadCurrentDirectories()

		return () => {
			isActive = false
		}
	}, [])

	const contextValue = useMemo(() => ({ state, dispatch }), [state])

	return (
		<AppStateContext.Provider value={contextValue}>
			{children}
		</AppStateContext.Provider>
	)
}
