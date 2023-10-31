import Spinner from '@/_components/Spinner'
import clsx from 'clsx'
import React, { ComponentProps, JSXElementConstructor } from 'react'
import styles from './Button.module.css'

export type ButtonProps<As extends JSXElementConstructor<any> | keyof JSX.IntrinsicElements> = Omit<
  ComponentProps<As>,
  'color' | 'as'
> & {
  as: As
  children: React.ReactNode
  minimal?: boolean
  color?: keyof typeof colors
  loading?: boolean
  spinnerSize?: number
  small?: boolean
  disabled?: boolean
  unstyled?: boolean
}

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
export default function Button<
  As extends JSXElementConstructor<any> | keyof JSX.IntrinsicElements = 'button'
>({
  children,
  minimal,
  color,
  className,
  loading,
  disabled,
  spinnerSize,
  as,
  small = false,
  unstyled = false,
  ...props
}: As extends 'button'
  ? Omit<ButtonProps<As>, 'as'> & { as?: 'button' }
  : ButtonProps<As>): JSX.Element {
  const Element = as ?? 'button'
  return (
    <Element
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
    </Element>
  )
}
