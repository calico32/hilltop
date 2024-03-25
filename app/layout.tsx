import { Analytics } from '@vercel/analytics/react'
import clsx from 'clsx'
import type { Metadata } from 'next'
import { Figtree, Lora } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

import DisclaimerDialog from '@/_components/DisclaimerDialog'
import Footer from '@/_components/Footer'
import './globals.css'

const serif = Lora({ subsets: ['latin'], variable: '--serif' })
const sans = Figtree({ subsets: ['latin'], variable: '--sans' })

export const metadata: Metadata = {
  title: 'Hilltop',
  description: 'Find your next job at Hilltop',
  icons: [
    { url: '/icon-light.png', media: '(prefers-color-scheme: light)' },
    { url: '/icon-dark.png', media: '(prefers-color-scheme: dark)' },
  ],
}

export default function RootLayout({
  children,
  presentation,
}: {
  children: React.ReactNode
  presentation: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={clsx(serif.variable, sans.variable, 'wrapper font-sans')}>
        <Toaster position="top-center" />
        {children}
        {presentation}
        <Footer />
        <Analytics />
        <DisclaimerDialog />
      </body>
    </html>
  )
}
