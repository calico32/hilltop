import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="flex gap-2 items-center bg-navyblue-0 text-white border-b border-b-white py-4 px-4">
        <h1 className="text-xl font-serif">Lantern Hill</h1>
        <h2 className="text-xl font-bold">Careers</h2>
        <div className="flex-grow" />

        <div className="contents lg:hidden"></div>
        <div className="hidden lg:contents">
          <Link href="/login">Log in</Link>
          <Link href="/signup">Sign up</Link>
        </div>
      </nav>
    </main>
  )
}
