'use client'

import { PageModalContext } from '@/_components/PageModal'
import Link, { LinkProps } from 'next/link'
import React, { AnchorHTMLAttributes, useContext } from 'react'

type NextLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & LinkProps

interface ModalAwareLinkProps extends NextLinkProps {
  children: React.ReactNode
}

export default function ModalAwareLink({
  children,
  href,
  ...props
}: ModalAwareLinkProps): JSX.Element {
  const pageModal = useContext(PageModalContext)

  return (
    <Link
      href={href}
      replace
      onClick={() => {
        pageModal?.close()
      }}
      {...props}
    >
      {children}
    </Link>
  )
}
