'use client'

import LoginForm from '@/(pages)/(auth)/login/LoginForm'
import api from '@/_api/client'
import Modal from '@/_components/Modal'
import ModalTitleBar from '@/_components/ModalTitleBar'
import NavLink from '@/_components/NavLink'
import Spinner from '@/_components/Spinner'
import { avatar, displayName } from '@/_lib/format'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon, LifeBuoy, LogOut, Settings, User2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Fragment, useState } from 'react'
import toast from 'react-hot-toast'

interface AppBarMenuProps {
  landing?: boolean
}

export default function AppBarMenu({ landing }: AppBarMenuProps): JSX.Element {
  const { isLoading, data: user } = api.$use('getUser')

  const router = useRouter()

  return (
    <div className="hidden sm:contents">
      {isLoading ? (
        <Spinner />
      ) : !user ? (
        <LoginMenu />
      ) : (
        <>
          <div className="hidden md:contents">
            <NavLink href="/dashboard">Your Dashboard</NavLink>
          </div>
          <Menu<'div'> as="div" className="relative ml-6 inline-block text-left">
            <div>
              <Menu.Button<'button'> className="flex w-full items-baseline justify-center rounded-md pb-1.5 font-medium focus:outline-none focus-visible:ring-2">
                <Image
                  src={avatar(user)}
                  alt=""
                  width={24}
                  height={24}
                  className="mr-2 self-center rounded-full"
                />
                {displayName(user)}
                <ChevronDownIcon
                  className="-mr-1 ml-1 h-5 w-5 self-center transition-transform ui-open:rotate-180"
                  aria-hidden="true"
                />
              </Menu.Button>
            </div>
            <Transition<typeof Fragment>
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items<'div'> className="absolute right-0 mt-2 w-56 origin-top-right divide-y-2 divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1 ">
                  <Menu.Item<typeof Fragment>>
                    <Link
                      href="/profile"
                      className={`group flex w-full items-center rounded-md px-2 py-2 text-gray-900 ui-active:bg-navyblue-0 ui-active:text-white`}
                    >
                      <User2 className="mr-2 h-5 w-5" aria-hidden="true" />
                      Profile
                    </Link>
                  </Menu.Item>
                  <Menu.Item<typeof Fragment>>
                    <Link
                      className={`group flex w-full items-center rounded-md px-2 py-2 text-gray-900 ui-active:bg-navyblue-0 ui-active:text-white`}
                      href="/settings"
                    >
                      <Settings className="mr-2 h-5 w-5" aria-hidden="true" />
                      Settings
                    </Link>
                  </Menu.Item>
                </div>
                <div className="px-1 py-1">
                  <Menu.Item<typeof Fragment>>
                    <Link
                      className={`group flex w-full items-center rounded-md px-2 py-2 text-gray-900 ui-active:bg-navyblue-0 ui-active:text-white`}
                      href="/help"
                    >
                      <LifeBuoy className="mr-2 h-5 w-5" aria-hidden="true" />
                      Help
                    </Link>
                  </Menu.Item>
                </div>
                <div className="px-1 py-1">
                  <Menu.Item<typeof Fragment>>
                    <button
                      className="flex w-full items-center rounded-md px-2 py-2 ui-active:bg-red-200"
                      onClick={async () => {
                        const loading = toast.loading('Signing you out...')
                        await api.logout()
                        await api.$mutate('getUser', [], null)
                        router.push('/')
                        toast.success('Signed out successfully. Have a nice day!', { id: loading })
                      }}
                    >
                      <LogOut className="mr-2 h-5 w-5 text-red-600" aria-hidden="true" />
                      <span className="text-red-800">Sign out</span>
                    </button>
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </>
      )}
    </div>
  )
}

function LoginMenu() {
  const pathname = usePathname()
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <>
      {pathname !== '/login' && <button onClick={() => setLoginOpen(true)}>Sign in</button>}

      <Modal open={loginOpen} onClose={() => setLoginOpen(false)}>
        <ModalTitleBar className="absolute right-8 top-8">
          <></>
        </ModalTitleBar>
        <div className="flex w-[30ch] flex-col items-center gap-4 rounded-lg p-2 xs:w-[35ch] sm:w-[45ch]">
          <h1 className="text-2xl font-semibold xs:text-3xl">Welcome back!</h1>

          <div className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Link
              href="/register"
              onClick={() => setLoginOpen(false)}
              className="text-blue-600 underline"
            >
              Register
            </Link>{' '}
            today!
          </div>

          <LoginForm />
        </div>
      </Modal>

      {pathname !== '/register' && (
        <Link
          href="/register"
          className="ml-4 block rounded-md bg-navyblue-0 px-4 py-2 font-semibold text-white hover:brightness-105"
        >
          Get started
        </Link>
      )}
    </>
  )
}
