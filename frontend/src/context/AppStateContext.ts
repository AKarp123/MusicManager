import { createContext, type Dispatch, useContext } from 'react'

export type AppState = {
	currentDirectories: string[]
}

export type AppStateAction =
	| { type: 'setCurrentDirectories'; directories: string[] }
	| { type: 'addCurrentDirectories'; directories: string[] }
	| { type: 'clearCurrentDirectories' }

export type AppStateContextValue = {
	state: AppState
	dispatch: Dispatch<AppStateAction>
}

export const initialAppState: AppState = {
	currentDirectories: []
}

const uniqueDirectories = (directories: string[]) =>
	[...new Set(directories)].sort((first, second) => first.localeCompare(second))

export const appStateReducer = (
	state: AppState,
	action: AppStateAction
): AppState => {
	switch (action.type) {
		case 'setCurrentDirectories':
			return {
				...state,
				currentDirectories: uniqueDirectories(action.directories)
			}
		case 'addCurrentDirectories':
			return {
				...state,
				currentDirectories: uniqueDirectories([
					...state.currentDirectories,
					...action.directories
				])
			}
		case 'clearCurrentDirectories':
			return {
				...state,
				currentDirectories: []
			}
	}
}

export const AppStateContext = createContext<AppStateContextValue | null>(null)

export function useAppState() {
	const context = useContext(AppStateContext)

	if (!context) {
		throw new Error('useAppState must be used within AppStateProvider')
	}

	return context
}
