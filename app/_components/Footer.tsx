import Logo from '@/_components/Logo'
import Link from 'next/link'

export default function Footer(): JSX.Element {
  return (
    <footer className="mt-32 self-end py-8 bg-navyblue-0 text-white wrapper !bleed-full">
      <div className="md:!bleed-half flex gap-8 sm:flex-row flex-col">
        <div className="flex flex-col md:w-max gap-4 sm:flex-1 md:flex-auto">
          <div className="flex gap-4 items-center">
            <Logo size={42} dark />
            <div className="font-semibold text-4xl font-serif">Hilltop</div>
          </div>
          <div className="font-serif">
            The hilltop is where the best views are. We're here to help you find yours.
          </div>
          <div className="flex-1" />
          <div className="md:w-max text-sm text-gray-400">
            © 2023-24 by the Hilltop team. All rights reserved.
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-[2] md:flex-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link className="font-semibold text-gray-200" href="/jobs">
              Search Jobs
            </Link>
            <Link className="font-semibold text-gray-200" href="/applications">
              View Applications
            </Link>
            <Link className="font-semibold text-gray-200" href="/dashboard">
              View your Dashboard
            </Link>
            <Link className="font-semibold text-gray-200" href="/terms">
              Terms of Service
            </Link>
            <Link className="font-semibold text-gray-200" href="/privacy">
              Privacy Policy
            </Link>
            <Link className="font-semibold text-gray-200" href="/disclaimer">
              Disclaimer
            </Link>
          </div>
          <div className="flex-1" />
          <div className="text-sm text-gray-400">
            Hilltop is a fictitious hiring platform created for the 2023-24 FBLA Website Coding and
            Development competition. All information on this website is fictitious. Hilltop is not
            affiliated with Lantern Hill, a senior living community in New Providence, NJ, or any
            other real company.
          </div>
        </div>
      </div>
    </footer>
  )
}
