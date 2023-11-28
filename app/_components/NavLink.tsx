'use client'

import api from '@/_api/client'
import { Role } from '@prisma/client'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  recruiterText?: React.ReactNode
  adminText?: React.ReactNode
}

export default function NavLink({
  href,
  children,
  className,
  adminText,
  recruiterText,
}: NavLinkProps): JSX.Element {
  const path = usePathname()
  const { data: user } = api.$use('getUser')

  let content = children
  if (adminText && user?.role === Role.Admin) {
    content = adminText
  } else if (recruiterText && user?.role !== Role.Applicant) {
    content = recruiterText
  }

  return (
    <Link
      href={href}
      className={clsx(
        'pb-1.5',
        'hover:text-gray-900  dark:hover:text-white border-b-4',
        path === href
          ? 'text-black dark:text-white font-medium border-black dark:border-white'
          : 'text-gray-600 dark:text-gray-300 border-transparent',
        className
      )}
    >
      {content}
    </Link>
  )
}
