'use client'

import LoginForm from '@/(pages)/login/LoginForm'
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
          <Menu<'div'> as="div" className="relative inline-block ml-6 text-left">
            <div>
              <Menu.Button<'button'> className="flex items-baseline w-full justify-center rounded-md font-medium focus:outline-none focus-visible:ring-2 pb-1.5">
                <Image
                  src={avatar(user)}
                  alt=""
                  width={24}
                  height={24}
                  className="self-center mr-2 rounded-full"
                />
                {displayName(user)}
                <ChevronDownIcon
                  className="self-center w-5 h-5 ml-1 -mr-1 transition-transform ui-open:rotate-180"
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
              <Menu.Items<'div'> className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y-2 divide-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1 ">
                  <Menu.Item<typeof Fragment>>
                    <Link
                      href="/profile"
                      className={`ui-active:bg-navyblue-0 ui-active:text-white text-gray-900 group flex w-full items-center rounded-md px-2 py-2`}
                    >
                      <User2 className="w-5 h-5 mr-2" aria-hidden="true" />
                      Profile
                    </Link>
                  </Menu.Item>
                  <Menu.Item<typeof Fragment>>
                    <Link
                      className={`ui-active:bg-navyblue-0 ui-active:text-white text-gray-900 group flex w-full items-center rounded-md px-2 py-2`}
                      href="/settings"
                    >
                      <Settings className="w-5 h-5 mr-2" aria-hidden="true" />
                      Settings
                    </Link>
                  </Menu.Item>
                </div>
                <div className="px-1 py-1">
                  <Menu.Item<typeof Fragment>>
                    <button
                      className={`ui-active:bg-navyblue-0 ui-active:text-white text-gray-900 group flex w-full items-center rounded-md px-2 py-2`}
                    >
                      <LifeBuoy className="w-5 h-5 mr-2" aria-hidden="true" />
                      Help
                    </button>
                  </Menu.Item>
                </div>
                <div className="px-1 py-1">
                  <Menu.Item<typeof Fragment>>
                    <button
                      className="flex items-center w-full px-2 py-2 rounded-md ui-active:bg-red-200"
                      onClick={async () => {
                        const loading = toast.loading('Signing you out...')
                        await api.logout()
                        await api.$mutate('getUser', [], null)
                        router.push('/')
                        toast.success('Signed out successfully. Have a nice day!', { id: loading })
                      }}
                    >
                      <LogOut className="w-5 h-5 mr-2 text-red-600" aria-hidden="true" />
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
        <div className="p-2 rounded-lg flex items-center flex-col gap-4 w-[30ch] xs:w-[35ch] sm:w-[45ch]">
          <h1 className="text-2xl xs:text-3xl font-semibold">Welcome back!</h1>

          <div className="text-gray-500 text-sm">
            Don't have an account?{' '}
            <Link
              href="/register"
              onClick={() => setLoginOpen(false)}
              className="underline text-blue-600"
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
          className="block px-4 py-2 ml-4 font-semibold text-white rounded-md bg-navyblue-0 hover:brightness-105"
        >
          Get started
        </Link>
      )}
    </>
  )
}
