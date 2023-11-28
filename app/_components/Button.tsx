import Spinner from '@/_components/Spinner'
import clsx from 'clsx'
import Link from 'next/link'
import React, { ComponentProps } from 'react'
import styles from './Button.module.css'

interface CommonButtonProps {
  children: React.ReactNode
  minimal?: boolean
  color?: keyof typeof colors
  loading?: boolean
  spinnerSize?: number
  small?: boolean
  disabled?: boolean
  unstyled?: boolean
  className?: string
}

export interface ButtonProps
  extends Omit<ComponentProps<'button'>, 'color' | 'as' | 'children'>,
    CommonButtonProps {}
export interface LinkButtonProps
  extends Omit<ComponentProps<typeof Link>, 'color' | 'as' | 'children'>,
    CommonButtonProps {}

const colors = {
  primary: 'bg-navyblue-0 text-white shadow-md hover:brightness-125',
  accent: 'bg-emeraldgreen-1 text-white shadow-md hover:brightness-110',
  neutral: 'bg-gray-200 text-gray-800 shadow-md hover:brightness-90',
  danger: 'bg-red-700 text-red-100 shadow-md hover:brightness-110',
  warning: 'bg-amber-600 text-amber-100 shadow-md hover:brightness-110',
}

const minimalColors = {
  primary: 'text-navyblue-0 hover:bg-navyblue-0/20 hover:bg-[#2876a6]/30',
  accent: 'text-emeraldgreen-1 ring-emeraldgreen-1 hover:bg-emeraldgreen-1/20',
  neutral: 'text-gray-600 hover:bg-gray-500/20',
  danger: 'text-red-800 hover:bg-red-600/20',
  warning: 'text-amber-800 hover:bg-amber-600/20',
}

export default function Button<Props extends CommonButtonProps = ButtonProps>({
  children,
  minimal,
  color,
  className,
  loading,
  disabled,
  spinnerSize,
  small = false,
  unstyled = false,
  __element = 'button',
  ...props
}: Props & { __element?: any }) {
  return (
    <__element
      disabled={loading || disabled}
      className={clsx(
        'z-0 relative',
        unstyled
          ? ''
          : clsx(
              'w-max font-semibold rounded-md',
              minimal ? minimalColors[color ?? 'primary'] : colors[color ?? 'primary'],
              small ? 'py-3 px-7' : 'py-4 px-10'
              // minimal && 'hover:shadow-md hover:ring-1'
            ),
        className,
        styles.button,
        loading && styles.loading,
        loading || disabled ? 'cursor-not-allowed' : unstyled ? '' : ''
      )}
      {...props}
    >
      {loading && (
        <Spinner
          size={spinnerSize ?? 24}
          className="absolute top-[calc(50%-12px)] left-[calc(50%-12px)]"
        />
      )}

      {/* any child text needs to be wrapped in a span so that visibility:hidden hides it when spinner is shown */}
      {typeof children === 'string' ? <span>{children}</span> : children}
    </__element>
  )
}

export function LinkButton(props: LinkButtonProps) {
  return <Button<LinkButtonProps> {...props} disabled={props.disabled} __element={Link} />
}
