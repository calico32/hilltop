import { Dialog, Transition } from '@headlessui/react'
import 'client-only'
import clsx from 'clsx'
import { Fragment, ReactNode, createContext } from 'react'

interface ModalProps {
  children: ReactNode
  open: boolean
  onClose: () => void
  className?: string
}

export const ModalContext = createContext<ModalProps | null>(null)

export default function Modal({ children, open, onClose, className }: ModalProps): JSX.Element {
  return (
    <ModalContext.Provider value={{ children, open, onClose }}>
      <Transition show={open} as={Fragment}>
        <Dialog onClose={onClose ?? (() => {})} as="div" className="relative z-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-100"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-150"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className={clsx(
                    'transform overflow-hidden bg-white rounded-md p-6 z-50 max-w-4xl flex flex-col gap-4 shadow-xl',
                    className
                  )}
                >
                  {children}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </ModalContext.Provider>
  )
}
