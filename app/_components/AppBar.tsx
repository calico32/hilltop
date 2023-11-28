import AppBarMenu from '@/_components/AppBarMenu'
import AppBarMobileMenu from '@/_components/AppBarMobileMenu'
import Logo from '@/_components/Logo'
import NavLink from '@/_components/NavLink'
import ScrollHandler from '@/_components/ScrollHandler'
import clsx from 'clsx'
import Link from 'next/link'

interface AppBarProps {
  landing?: boolean
  className?: string
}

export default async function AppBar({ landing }: AppBarProps) {
  return (
    <nav
      className={clsx(
        'wrapper fixed top-0 left-0 right-0 py-4 transition-all z-10 app-bar',
        landing
          ? 'drop-shadow-md dark app-bar-scroll text-white'
          : 'bg-opacity-75 bg-white backdrop-blur-md shadow pb-3'
      )}
    >
      <ScrollHandler />
      <div className="flex items-baseline bleed-none min-[900px]:bleed-half h-[40px]">
        <Link href="/" className="self-center mr-4 mb-2">
          <Logo dark={landing} size={36} />
        </Link>

        <Link href="/">
          <h1 className="font-serif text-2xl font-medium">Hilltop</h1>
        </Link>

        <div className="hidden sm:contents">
          <NavLink className="ml-8" href="/jobs">
            Search Jobs
          </NavLink>
          <NavLink className="ml-6" href="/applications" recruiterText="Review Applications">
            Your Applications
          </NavLink>
        </div>

        <div className="flex-grow" />

        <AppBarMobileMenu landing={landing} />
        <AppBarMenu landing={landing} />
      </div>
    </nav>
  )
}
