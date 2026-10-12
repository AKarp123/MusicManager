import { forwardRef, type ComponentProps } from 'react'

type ButtonProps = ComponentProps<'button'> & {
	variant?: 'primary' | 'secondary' | 'danger' | 'plain'
	size?: 'default' | 'small'
}

const variants = {
	primary: 'border-white bg-white text-black hover:bg-black hover:text-white',
	secondary: 'border-white/25 text-white hover:bg-white hover:text-black',
	danger: 'border-red-300/60 text-red-100 hover:bg-red-100 hover:text-black',
	plain: 'border-white/30 text-white hover:bg-white/10'
}

const sizes = {
	default: 'px-4 py-2.5 text-sm',
	small: 'px-2 py-1 text-xs'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant = 'secondary',
			size = 'default',
			className = '',
			type = 'button',
			...props
		},
		ref
	) => (
		<button
			ref={ref}
			type={type}
			className={`cursor-pointer border font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${className}`}
			{...props}
		/>
	)
)

Button.displayName = 'Button'
