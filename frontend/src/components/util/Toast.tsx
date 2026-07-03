import * as Toast from '@radix-ui/react-toast'
import { CheckIcon, CircleAlertIcon, InfoIcon } from 'raster-react'
import './Toast.css'
import { type ToastOptions, type ToastType } from '../../context/ToastContext'

export type DisplayToastProps = ToastOptions & {
	id: number
	open: boolean
	onClose: () => void
}

const iconDisplay = ({ type }: { type: ToastType }) => {
	switch (type) {
		case 'success': {
			return <CheckIcon size={35} color="" strokeWidth={0.25} radius={1} />
		}
		case 'error': {
			return <CircleAlertIcon size={35} color="" strokeWidth={0.25} radius={1} />
		}
		case 'warning': {
			return <CircleAlertIcon size={35} color="fef493" strokeWidth={0.25} radius={1} />
		}
		case 'info': {
			return <InfoIcon size={35} color="#fefefe" strokeWidth={0.25} radius={1} />
		}
	}
}

const DisplayToast = ({
	id,
	title,
	message,
	type = 'error',
	onClose,
	open,
	showClose,
	duration = 3000
}: DisplayToastProps) => (
	<Toast.Root
		key={id}
		open={open}
		duration={duration}
		onOpenChange={(nextOpen) => {
			if (!nextOpen) {
				onClose()
			}
		}}
		className="ToastRoot inline-flex items-center gap-3 rounded-md border border-white/25 bg-black/85 p-3 text-white backdrop-blur-md"
	>
		{iconDisplay({ type })}
		<div className="min-w-0 flex-1">
			<Toast.Title className="text-sm font-semibold">{title}</Toast.Title>
			{message ? (
				<Toast.Description className="mt-1 break-words text-xs text-white/70">
					{message}
				</Toast.Description>
			) : null}
		</div>
		{showClose ? (
			<Toast.Action
				className="cursor-pointer border border-white/25 px-2 py-1 text-xs font-semibold transition hover:bg-white hover:text-black"
				onClick={onClose}
				altText="Close notification"
			>
				Close
			</Toast.Action>
		) : null}
	</Toast.Root>
)

export default DisplayToast
