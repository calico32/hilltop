'use client'

import Modal from '@/_components/Modal'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import React, { createContext, useEffect, useState } from 'react'

interface PageModalContext {
  close: () => void
}

export const PageModalContext = createContext<PageModalContext | null>(null)

interface PageModalProps {
  children: React.ReactNode
  className?: string
}

export default function PageModal({ children, className }: PageModalProps): JSX.Element {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(true)
  }, [])

  return (
    <PageModalContext.Provider
      value={{
        close: () => setOpen(false),
      }}
    >
      <Modal
        className={clsx('mt-12', className)}
        open={open}
        onClose={() => {
          setOpen(false)
          setTimeout(() => router.back(), 200)
        }}
      >
        {children}
      </Modal>
    </PageModalContext.Provider>
  )
}
