'use client'

import api from '@/_api/client'
import NavLink from '@/_components/NavLink'
import Spinner from '@/_components/Spinner'
import { displayName } from '@/_lib/name'
import { avatar } from '@/_util/avatar'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon, LifeBuoy, LogOut, Settings, User2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Fragment } from 'react'
import toast from 'react-hot-toast'

interface AppBarMenuProps {
  landing?: boolean
}

export default function AppBarMenu({ landing }: AppBarMenuProps): JSX.Element {
  const { isLoading, data: user } = api.use('getUser')

  // const fn = getUser
  // const fnName = 'getUser'
  // const args: never[] = []

  // const key = useMemo(() => swrKey(fnName, ...args), [fnName, args])
  // const {
  //   data: user,
  //   error,
  //   isLoading,
  //   isValidating,
  //   // mutate,
  // } = useSWR(
  //   key,
  //   async (k) => {
  //     const data = await fn(...args)
  //     console.log('use', key, data)
  //     return data
  //   },
  //   { revalidateOnMount: true }
  // )

  const router = useRouter()

  return (
    <div className="hidden sm:contents">
      {isLoading ? (
        <Spinner />
      ) : !user ? (
        <LoginMenu />
      ) : (
        <>
          <NavLink href="/dashboard" className="hidden md:contents">
            Your Dashboard
          </NavLink>
          <Menu as="div" className="relative inline-block ml-4 text-left">
            <div>
              <Menu.Button className="flex items-baseline w-full justify-center rounded-md font-medium focus:outline-none focus-visible:ring-2 pb-1.5">
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
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y-2 divide-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1 ">
                  <Menu.Item>
                    <button
                      className={`ui-active:bg-navyblue-0 ui-active:text-white text-gray-900 group flex w-full items-center rounded-md px-2 py-2`}
                    >
                      <User2 className="w-5 h-5 mr-2" aria-hidden="true" />
                      Profile
                    </button>
                  </Menu.Item>
                  <Menu.Item>
                    <button
                      className={`ui-active:bg-navyblue-0 ui-active:text-white text-gray-900 group flex w-full items-center rounded-md px-2 py-2`}
                    >
                      <Settings className="w-5 h-5 mr-2" aria-hidden="true" />
                      Settings
                    </button>
                  </Menu.Item>
                </div>
                <div className="px-1 py-1">
                  <Menu.Item>
                    <button
                      className={`ui-active:bg-navyblue-0 ui-active:text-white text-gray-900 group flex w-full items-center rounded-md px-2 py-2`}
                    >
                      <LifeBuoy className="w-5 h-5 mr-2" aria-hidden="true" />
                      Help
                    </button>
                  </Menu.Item>
                </div>
                <div className="px-1 py-1">
                  <Menu.Item>
                    <button
                      className="flex items-center w-full px-2 py-2 rounded-md ui-active:bg-red-200"
                      onClick={async () => {
                        const loading = toast.loading('Signing you out...')
                        await api.logout()
                        await api.mutate('getUser', [], null)
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

  return (
    <>
      {pathname !== '/login' && (
        <Link href="/login" className="">
          Sign in
        </Link>
      )}

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
