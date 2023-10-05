import NavLink from '@/_components/NavLink'
import clsx from 'clsx'
import { Menu, User2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface AppBarProps {
  light?: boolean
}

export default async function AppBar({ light }: AppBarProps) {
  return (
    <nav
      className={clsx(
        'flex items-center gap-2 min-[900px]:bleed-half bleed-none md:my-6 my-4 transition-all z-10 app-bar',
        light ? 'text-white drop-shadow-md dark' : ''
      )}
    >
      <Link href="/">
        <Image src={(await import('@/_assets/logo.png')).default} width={38} alt="" />
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

      <div className="contents sm:hidden">
        <button className="p-1.5">
          <Menu size={24} strokeWidth={1.5} />
        </button>
      </div>
      <div className="hidden sm:contents">
        <button className="p-1.5">
          <User2 size={24} strokeWidth={1.5} />
        </button>
      </div>
    </nav>
  )
}
