import { type FormEvent, useEffect, useState } from 'react'
import { authClient } from '@/authClient'
import { useToast } from '@/context/ToastContext'

type ManagedUser = {
	id: string
	name: string
	email: string
	username?: string | null
	role?: string | null
	banned?: boolean | null
}

export function Users() {
	const { data: session, isPending: sessionPending } = authClient.useSession()
	const { showToast } = useToast()
	const [users, setUsers] = useState<ManagedUser[]>([])
	const [name, setName] = useState('')
	const [username, setUsername] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [role, setRole] = useState<'user' | 'admin'>('user')
	const [busy, setBusy] = useState(false)
	const [loading, setLoading] = useState(true)
	const [total, setTotal] = useState(0)
	const [offset, setOffset] = useState(0)
	const limit = 20
	const isAdmin = session?.user.role?.split(',').includes('admin')

	useEffect(() => {
		if (!isAdmin) return
		let active = true
		authClient.admin
			.listUsers({ query: { limit, offset } })
			.then(({ data, error }) => {
				if (!active) return
				if (error) {
					showToast({
						title: 'Unable to load users',
						message: error.message,
						type: 'error'
					})
				} else {
					setUsers(data?.users ?? [])
					setTotal(data?.total ?? 0)
				}
				setLoading(false)
			})
		return () => {
			active = false
		}
	}, [isAdmin, offset, showToast])

	const refresh = async () => {
		const { data, error } = await authClient.admin.listUsers({
			query: { limit, offset }
		})
		if (error) {
			showToast({
				title: 'Unable to load users',
				message: error.message,
				type: 'error'
			})
			return
		}
		setUsers(data?.users ?? [])
		setTotal(data?.total ?? 0)
	}

	const createUser = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setBusy(true)
		try {
			const { error } = await authClient.admin.createUser({
				name: name.trim(),
				email: email.trim(),
				password,
				role,
				data: { username: username.trim() }
			})
			if (error) throw new Error(error.message)
			setName('')
			setUsername('')
			setEmail('')
			setPassword('')
			setRole('user')
			showToast({ title: 'User created', type: 'success' })
			await refresh()
		} catch (error) {
			showToast({
				title: 'Unable to create user',
				message: error instanceof Error ? error.message : undefined,
				type: 'error'
			})
		} finally {
			setBusy(false)
		}
	}

	const changeRole = async (user: ManagedUser) => {
		setBusy(true)
		const nextRole = user.role === 'admin' ? 'user' : 'admin'
		const { error } = await authClient.admin.setRole({
			userId: user.id,
			role: nextRole
		})
		if (error)
			showToast({
				title: 'Unable to change role',
				message: error.message,
				type: 'error'
			})
		else {
			showToast({ title: 'Role updated', type: 'success' })
			await refresh()
		}
		setBusy(false)
	}

	const renameUser = async (user: ManagedUser) => {
		const name = window.prompt('Name', user.name)?.trim()
		if (!name || name === user.name) return
		setBusy(true)
		const { error } = await authClient.admin.updateUser({
			userId: user.id,
			data: { name }
		})
		if (error)
			showToast({
				title: 'Unable to update user',
				message: error.message,
				type: 'error'
			})
		else {
			showToast({ title: 'User updated', type: 'success' })
			await refresh()
		}
		setBusy(false)
	}

	const changeBan = async (user: ManagedUser) => {
		setBusy(true)
		const { error } = user.banned
			? await authClient.admin.unbanUser({ userId: user.id })
			: await authClient.admin.banUser({ userId: user.id })
		if (error)
			showToast({
				title: 'Unable to update user',
				message: error.message,
				type: 'error'
			})
		else {
			showToast({
				title: user.banned ? 'User unbanned' : 'User banned',
				type: 'success'
			})
			await refresh()
		}
		setBusy(false)
	}

	const resetPassword = async (user: ManagedUser) => {
		const newPassword = window.prompt(`New password for ${user.name}`)
		if (!newPassword) return
		setBusy(true)
		const { error } = await authClient.admin.setUserPassword({
			userId: user.id,
			newPassword
		})
		showToast({
			title: error ? 'Unable to set password' : 'Password updated',
			message: error?.message,
			type: error ? 'error' : 'success'
		})
		setBusy(false)
	}

	const removeUser = async (user: ManagedUser) => {
		if (!window.confirm(`Permanently delete ${user.name} (${user.email})?`))
			return
		setBusy(true)
		const { error } = await authClient.admin.removeUser({ userId: user.id })
		if (error)
			showToast({
				title: 'Unable to delete user',
				message: error.message,
				type: 'error'
			})
		else {
			showToast({ title: 'User deleted', type: 'success' })
			await refresh()
		}
		setBusy(false)
	}

	if (sessionPending) return <p>Loading...</p>
	if (!isAdmin) return <p>Admin access is required.</p>

	return (
		<div className="space-y-8">
			<header>
				<h1 className="text-3xl font-semibold">Users</h1>
				<p className="mt-2 text-sm text-white/60">
					Create accounts and manage access.
				</p>
			</header>
			<form
				onSubmit={createUser}
				className="grid gap-3 border border-white/25 p-4 md:grid-cols-2"
			>
				<h2 className="text-lg font-semibold md:col-span-2">Create user</h2>
				<label className="text-sm">
					Name
					<input
						className="mt-1 w-full border border-white/30 bg-black p-2"
						required
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
				</label>
				<label className="text-sm">
					Username
					<input
						className="mt-1 w-full border border-white/30 bg-black p-2"
						required
						minLength={3}
						pattern="[A-Za-z0-9_.]+"
						value={username}
						onChange={(event) => setUsername(event.target.value)}
					/>
				</label>
				<label className="text-sm">
					Email
					<input
						className="mt-1 w-full border border-white/30 bg-black p-2"
						required
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
					/>
				</label>
				<label className="text-sm">
					Password
					<input
						className="mt-1 w-full border border-white/30 bg-black p-2"
						required
						minLength={8}
						type="password"
						autoComplete="new-password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
					/>
				</label>
				<label className="text-sm">
					Role
					<select
						className="mt-1 w-full border border-white/30 bg-black p-2"
						value={role}
						onChange={(event) =>
							setRole(event.target.value as 'user' | 'admin')
						}
					>
						<option value="user">User</option>
						<option value="admin">Admin</option>
					</select>
				</label>
				<button
					className="self-end border border-white bg-white p-2 font-semibold text-black disabled:opacity-50"
					disabled={busy}
					type="submit"
				>
					{busy ? 'Working...' : 'Create user'}
				</button>
			</form>
			<section className="space-y-3">
				<h2 className="text-lg font-semibold">Accounts ({total})</h2>
				{loading ? (
					<p>Loading users...</p>
				) : users.length === 0 ? (
					<p>No users found.</p>
				) : (
					<ul className="divide-y divide-white/20 border border-white/25">
						{users.map((user) => (
							<li
								key={user.id}
								className="flex flex-wrap items-center justify-between gap-4 p-4"
							>
								<div>
									<p className="font-medium">
										{user.name} {user.id === session?.user.id ? '(you)' : ''}
									</p>
									<p className="text-sm text-white/60">
										{user.username || 'No username'} · {user.email} ·{' '}
										{user.role || 'user'}
										{user.banned ? ' · banned' : ''}
									</p>
								</div>
								<div className="flex flex-wrap gap-2 text-sm">
									<button
										className="border border-white/30 px-2 py-1 disabled:opacity-40"
										disabled={busy}
										onClick={() => renameUser(user)}
									>
										Edit name
									</button>
									<button
										className="border border-white/30 px-2 py-1 disabled:opacity-40"
										disabled={busy || user.id === session?.user.id}
										onClick={() => changeRole(user)}
									>
										Make {user.role === 'admin' ? 'user' : 'admin'}
									</button>
									<button
										className="border border-white/30 px-2 py-1 disabled:opacity-40"
										disabled={busy || user.id === session?.user.id}
										onClick={() => changeBan(user)}
									>
										{user.banned ? 'Unban' : 'Ban'}
									</button>
									<button
										className="border border-white/30 px-2 py-1 disabled:opacity-40"
										disabled={busy}
										onClick={() => resetPassword(user)}
									>
										Set password
									</button>
									<button
										className="border border-red-300/60 px-2 py-1 text-red-100 disabled:opacity-40"
										disabled={busy || user.id === session?.user.id}
										onClick={() => removeUser(user)}
									>
										Delete
									</button>
								</div>
							</li>
						))}
					</ul>
				)}
				<div className="flex gap-2 text-sm">
					<button
						className="border border-white/30 px-3 py-1 disabled:opacity-40"
						disabled={offset === 0}
						onClick={() => setOffset(Math.max(0, offset - limit))}
					>
						Previous
					</button>
					<button
						className="border border-white/30 px-3 py-1 disabled:opacity-40"
						disabled={offset + limit >= total}
						onClick={() => setOffset(offset + limit)}
					>
						Next
					</button>
				</div>
			</section>
		</div>
	)
}
