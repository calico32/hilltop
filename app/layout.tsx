import Footer from '@/_components/Footer'
import clsx from 'clsx'
import type { Metadata } from 'next'
import { Figtree, Lora } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { SWRDevTools } from 'swr-devtools'
import './globals.css'

const serif = Lora({ subsets: ['latin'], variable: '--serif' })
const sans = Figtree({ subsets: ['latin'], variable: '--sans' })

export const metadata: Metadata = {
  title: 'Hilltop',
  description: 'Find your next job at Hilltop',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={clsx(serif.variable, sans.variable, 'font-sans wrapper')}>
        {process.env.NODE_ENV === 'development' ? (
          <SWRDevTools>
            <Toaster position="top-center" />
            {children}
            <Footer />
          </SWRDevTools>
        ) : (
          <>
            <Toaster position="top-center" />
            {children}
            <Footer />
          </>
        )}
      </body>
    </html>
  )
}
