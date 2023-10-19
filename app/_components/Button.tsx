import Spinner from '@/_components/Spinner'
import clsx from 'clsx'
import React, { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  minimal?: boolean
  color?: keyof typeof colors
  loading?: boolean
  spinnerSize?: number
}

const colors = {
  primary: 'bg-navyblue-0 text-white',
  accent: 'bg-emeraldgreen-1 text-white',
  neutral: 'bg-gray-200 text-gray-800',
  danger: 'bg-red-200 text-red-800',
}

const minimalColors = {
  primary: 'text-navyblue-0',
  accent: 'text-emeraldgreen-1',
  neutral: 'text-gray-200',
  danger: 'text-red-800',
}

export default function Button({
  children,
  minimal,
  color,
  className,
  loading,
  disabled,
  spinnerSize,
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      disabled={loading || disabled}
      className={clsx(
        'z-0 w-max p-4 px-10 rounded-md shadow-md font-semibold relative',
        minimal ? minimalColors[color ?? 'primary'] : colors[color ?? 'primary'],
        className,
        styles.button,
        loading && styles.loading,
        loading || disabled ? 'cursor-not-allowed' : 'hover:brightness-110'
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
    </button>
  )
}
