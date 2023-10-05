'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

interface NavLinkProps {
  href: string
  children: React.ReactNode
}

export default function NavLink({ href, children }: NavLinkProps): JSX.Element {
  const path = usePathname()
  return (
    <Link
      href={href}
      className={clsx(
        'pb-1.5',
        'hover:text-gray-900  dark:hover:text-white',
        path === href
          ? 'text-black dark:text-white font-medium border-b-4 border-black dark:border-white'
          : 'text-gray-600 dark:text-gray-300'
      )}
    >
      {children}
    </Link>
  )
}
