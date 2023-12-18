'use client'

import { ModalContext } from '@/_components/Modal'
import { Dialog } from '@headlessui/react'
import clsx from 'clsx'
import { X } from 'lucide-react'
import { useContext } from 'react'

interface ModalTitleBarProps {
  children: string | JSX.Element
  className?: string
}

export default function ModalTitleBar({ children, className }: ModalTitleBarProps) {
  const modal = useContext(ModalContext)
  if (!modal) throw new Error('Modal.TitleBar must be used inside a Modal')

  return (
    <div className={clsx('flex items-start justify-between', className)}>
      <Dialog.Title className={typeof children === 'string' ? 'text-2xl font-semibold' : ''}>
        {children}
      </Dialog.Title>

      <button onClick={modal.onClose}>
        <X size={24} />
      </button>
    </div>
  )
}
