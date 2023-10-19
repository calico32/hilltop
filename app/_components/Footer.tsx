import Link from 'next/link'

export default function Footer(): JSX.Element {
  return (
    <footer className="mt-32 mb-8 text-gray-500 text-sm leading-5">
      <div>© 2023 by the Hilltop team. All rights reserved.</div>
      <div className="mt-1">
        Hilltop is a fictitious hiring platform created for a 2023 FBLA Website Coding and
        Development competition. Your data is stored securely and will be used in accordance with
        our{' '}
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>
        . Hilltop is not affiliated with Lantern Hill, a senior living community in New Providence,
        NJ.
      </div>
    </footer>
  )
}
