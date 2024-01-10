'use client'

import api from '@/_api/client'
import Button from '@/_components/Button'
import { PasskeyIcon } from '@/_components/PasskeyIcon'
import { truncate } from '@/_util/string'
import { Dialog, Transition } from '@headlessui/react'
import { Passkey } from '@prisma/client'
import { Trash2, X } from 'lucide-react'
import { Fragment, useState } from 'react'
import toast from 'react-hot-toast'

interface DeletePasskeyButtonProps {
  passkey: Pick<Passkey, 'nickname' | 'credentialId' | 'transports' | 'created' | 'updated'>
}

export default function DeletePasskeyButton({ passkey }: DeletePasskeyButtonProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <>
      <Button
        color="danger"
        minimal
        onClick={() => setOpen(true)}
        className="flex h-max items-center justify-center !p-3"
      >
        <Trash2 size={24} />
      </Button>
      <Transition show={open} as={Fragment}>
        <Dialog onClose={() => {}} as="div" className="relative z-20">
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
                <Dialog.Panel className="z-50 flex max-w-md transform flex-col gap-4 overflow-hidden rounded-md bg-white p-6 shadow-xl sm:w-[28rem]">
                  <div className="flex items-center justify-between gap-4">
                    <Dialog.Title className="text-2xl font-semibold">Delete Passkey</Dialog.Title>

                    <button onClick={() => setOpen(false)}>
                      <X size={24} />
                    </button>
                  </div>

                  <Trash2 size={48} className="mx-auto my-4 text-red-500" />

                  <p>
                    Are you sure you want to delete
                    <span className="ml-1.5 mr-0.5 inline-block align-middle">
                      <PasskeyIcon transports={passkey.transports} size={20} />
                    </span>
                    <strong>{passkey.nickname ?? truncate(passkey.credentialId, 15)}</strong>? You
                    won't be able to use it to sign in anymore.
                  </p>

                  <p>
                    <strong>This action cannot be undone.</strong>
                  </p>

                  <div className="text-sm text-gray-500">
                    <p>
                      ID: <code>{truncate(passkey.credentialId, 35)}</code>
                    </p>
                    <div className="flex gap-1.5">
                      <span>Added on {new Date(passkey.created).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Last used {new Date(passkey.updated).toLocaleDateString()}</span>
                    </div>
                    {passkey.transports.length && <span>{passkey.transports.join(', ')}</span>}
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <Button
                      onClick={() => {
                        setOpen(false)
                      }}
                      small
                      minimal
                      color="neutral"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        setLoading(true)
                        const res = await api.passkeys.delete(passkey.credentialId)
                        setLoading(false)
                        if (res.ok) {
                          setOpen(false)
                          toast.success('Passkey deleted.')
                          api.passkeys.$mutate('getAll', [], null)
                        } else {
                          toast.error('Failed to delete passkey: ' + res.error)
                        }
                      }}
                      small
                      loading={loading}
                      color="danger"
                    >
                      Delete Passkey
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
