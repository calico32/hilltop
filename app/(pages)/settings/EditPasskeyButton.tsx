'use client'

import api from '@/_api/client'
import Button from '@/_components/Button'
import styles from '@/_components/Input.module.css'
import { passkeyIcon } from '@/_util/passkey'
import { truncate } from '@/_util/string'
import { Dialog, Transition } from '@headlessui/react'
import { Passkey } from '@prisma/client'
import clsx from 'clsx'
import { Pencil, X } from 'lucide-react'
import { Fragment, useState } from 'react'
import toast from 'react-hot-toast'

interface EditPasskeyButtonProps {
  passkey: Pick<Passkey, 'nickname' | 'credentialId' | 'transports' | 'created' | 'updated'>
}

export default function EditPasskeyButton({ passkey }: EditPasskeyButtonProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [nickname, setNickname] = useState(passkey.nickname)

  return (
    <>
      <Button
        color="neutral"
        minimal
        onClick={() => setOpen(true)}
        className="flex items-center justify-center !p-0 !h-[52px] !w-[52px]"
      >
        <Pencil size={24} />
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
                <Dialog.Panel className="transform overflow-hidden bg-white rounded-md p-6 z-50 max-w-md sm:w-[28rem] flex flex-col gap-4 shadow-xl">
                  <div className="flex items-center justify-between gap-4">
                    <Dialog.Title className="text-2xl font-semibold">Edit Passkey</Dialog.Title>

                    <button onClick={() => setOpen(false)}>
                      <X size={24} />
                    </button>
                  </div>

                  <div className="mx-auto my-4">{passkeyIcon(passkey.transports, 48)}</div>

                  <p>
                    You can set a nickname for this passkey to help you identify it. This is only
                    visible to you.
                  </p>

                  <div className={clsx(styles.inputWrapper)}>
                    <input
                      className={clsx(styles.input)}
                      type="text"
                      placeholder="Nickname"
                      value={nickname ?? ''}
                      onChange={(e) => setNickname(e.target.value)}
                    />
                  </div>

                  <div className="text-gray-500 text-sm">
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

                  <div className="flex gap-4 items-center justify-center">
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
                        const res = await api.nicknamePasskey(
                          passkey.credentialId,
                          nickname || null
                        )
                        setLoading(false)
                        if (res.ok) {
                          setOpen(false)
                          toast.success('Passkey renamed!')
                          api.$mutate('getPasskeys', [], null)
                        } else {
                          toast.error('Failed to rename passkey: ' + res.error)
                        }
                      }}
                      small
                      loading={loading}
                      color="accent"
                    >
                      Set Nickname
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
