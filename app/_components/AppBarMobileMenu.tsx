'use client'

import api from '@/_api/client'
import Button from '@/_components/Button'
import Logo from '@/_components/Logo'
import NavLink from '@/_components/NavLink'
import Spinner from '@/_components/Spinner'
import { avatar, fullName } from '@/_lib/format'
import { Dialog, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { LogOut, MenuIcon, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Fragment, useState } from 'react'
import toast from 'react-hot-toast'

interface AppBarMobileMenuProps {
  landing?: boolean
}

export default function AppBarMobileMenu({ landing }: AppBarMobileMenuProps): JSX.Element {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { data: user, isLoading } = api.users.$use('get')
  const pathname = usePathname()
  const [signingOut, setSigningOut] = useState(false)

  return (
    <div className="contents sm:hidden">
      {isLoading ? (
        <Spinner />
      ) : !user ? (
        pathname !== '/register' ? (
          <Link
            href="/register"
            className="ml-4 mr-2 block rounded-md bg-navyblue-0 px-4 py-2 font-semibold text-white hover:brightness-105"
          >
            Get started
          </Link>
        ) : (
          <Link href="/login" className={clsx(landing ? '' : 'mr-2 font-semibold text-navyblue-0')}>
            Sign in
          </Link>
        )
      ) : (
        <Image
          src={avatar(user)}
          alt=""
          width={32}
          height={32}
          className={clsx(
            'mr-2 self-center rounded-full',
            landing ? 'shadow' : 'border-2 border-gray-400',
          )}
        />
      )}
      <button
        className="flex items-baseline justify-center self-center rounded-md p-1.5"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <MenuIcon size={24} strokeWidth={1.5} />
      </button>
      <Transition show={open} as={Fragment}>
        <Dialog onClose={() => setOpen(false)} className="absolute inset-0 z-50">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-200"
            enterFrom="transform opacity-0 -translate-y-full"
            enterTo="transform opacity-100 translate-y-0"
            leave="transition ease-in-out duration-200"
            leaveFrom="transform opacity-100 translate-y-0"
            leaveTo="transform opacity-0 -translate-y-full"
          >
            <div className="fixed left-0 right-0 top-0 w-screen">
              <Dialog.Panel className="w-full divide-y-2 divide-gray-200 bg-white p-4">
                <div>
                  <div className="flex h-full items-baseline">
                    <Link href="/" className="mr-4 self-center">
                      <Logo size={36} />
                    </Link>
                    <Link href="/">
                      <h1 className="font-serif text-2xl font-medium">Hilltop</h1>
                    </Link>
                    <div className="flex-grow" />
                    <button
                      className="flex items-center justify-center rounded-md p-1.5"
                      onClick={() => setOpen(false)}
                    >
                      <X size={24} strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="mb-4 mt-6 flex flex-col gap-3">
                    <NavLink className="w-max" href="/jobs">
                      Search Jobs
                    </NavLink>
                    <NavLink className="w-max" href="/applications">
                      Your Applications
                    </NavLink>
                    <NavLink className="w-max" href="/companies">
                      Your Dashboard
                    </NavLink>
                  </div>
                  {!user && (
                    <div className="flex items-baseline justify-end">
                      <Link href="/login" onClick={() => setOpen(false)} className="">
                        Sign in
                      </Link>

                      <Link
                        href="/register"
                        className="ml-4 block rounded-md bg-navyblue-0 px-4 py-2 font-semibold text-white hover:brightness-105"
                      >
                        Get started
                      </Link>
                    </div>
                  )}
                </div>
                {user && (
                  <div>
                    <div className="mt-4 flex items-center gap-4">
                      <Image
                        src={avatar(user)}
                        alt=""
                        width={42}
                        height={42}
                        className="self-center rounded-full"
                      />
                      <div className="flex flex-col">
                        <span className="text-lg font-semibold">{fullName(user)}</span>
                        <span className="text-sm text-gray-500">{user.email}</span>
                      </div>
                      <div className="flex-grow" />
                      <div>
                        <Button
                          loading={signingOut}
                          color="danger"
                          minimal
                          className="flex w-full items-center rounded-md px-6 py-2 text-base"
                          onClick={async () => {
                            setSigningOut(true)
                            const loading = toast.loading('Signing you out...')
                            await api.auth.logout()
                            await api.users.$mutate('get', [], null)
                            router.push('/')
                            toast.success('Signed out successfully. Have a nice day!', {
                              id: loading,
                            })
                          }}
                        >
                          <span>Sign out</span>
                          <LogOut className="ml-3 h-5 w-5" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </div>
  )
}
