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
  const { data: user } = api.users.$use('get')

  let content = children
  if (adminText && user?.role === Role.Admin) {
    content = adminText
  } else if (recruiterText && user && user?.role !== Role.Applicant) {
    content = recruiterText
  }

  return (
    <Link
      href={href}
      className={clsx(
        'pb-0.5',
        'border-b-4 drop-shadow-xl hover:text-gray-900 dark:hover:text-white',
        path === href
          ? 'border-black font-medium text-black dark:border-white dark:text-white'
          : 'border-transparent text-gray-600 dark:text-gray-300',
        className,
      )}
    >
      {content}
    </Link>
  )
}
