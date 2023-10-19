import logo from '@/_assets/logo.png'
import AppBarMenu from '@/_components/AppBarMenu'
import AppBarMobileMenu from '@/_components/AppBarMobileMenu'
import NavLink from '@/_components/NavLink'
import ScrollHandler from '@/_components/ScrollHandler'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'

interface AppBarProps {
  landing?: boolean
  className?: string
}

export default async function AppBar({ landing: landing }: AppBarProps) {
  return (
    <nav
      className={clsx(
        'wrapper fixed top-0 left-0 right-0 py-4  transition-all z-10 min-h-[40px] app-bar',
        landing
          ? 'drop-shadow-md dark app-bar-scroll text-white'
          : 'bg-opacity-75 bg-white backdrop-blur-md shadow'
      )}
    >
      <ScrollHandler />
      <div className="flex items-baseline gap-2 bleed-none min-[900px]:bleed-half">
        <Link href="/" className="self-center">
          <Image src={logo} width={38} alt="" />
        </Link>

        <div className="flex items-baseline h-full gap-6">
          <Link href="/">
            <h1 className="font-serif text-2xl font-medium">Hilltop</h1>
          </Link>
          <div className="hidden sm:contents">
            <NavLink href="/jobs">Search Jobs</NavLink>
            <NavLink href="/applications">Your Applications</NavLink>
          </div>
        </div>

        <div className="flex-grow" />

        <AppBarMobileMenu landing={landing} />
        <AppBarMenu landing={landing} />
      </div>
    </nav>
  )
}
