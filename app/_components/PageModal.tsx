'use client'

import Modal from '@/_components/Modal'
import { useRouter } from 'next/navigation'
import React, { createContext, useEffect, useState } from 'react'

interface PageModalContext {
  close: () => void
}

export const PageModalContext = createContext<PageModalContext | null>(null)

export default function PageModal({ children }: { children: React.ReactNode }): JSX.Element {
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
        className="mt-12"
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
