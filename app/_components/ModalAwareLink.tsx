'use client'

import { ModalContext } from '@/_components/Modal'
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
  const modal = useContext(ModalContext)

  return (
    <Link
      href={href}
      replace={!!pageModal}
      onClick={() => {
        if (pageModal) {
          pageModal.close()
        } else {
          modal?.onClose()
        }
      }}
      {...props}
    >
      {children}
    </Link>
  )
}
