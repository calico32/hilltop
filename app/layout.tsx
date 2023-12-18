import { Analytics } from '@vercel/analytics/react'
import clsx from 'clsx'
import type { Metadata } from 'next'
import { Figtree, Lora } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={clsx(serif.variable, sans.variable, 'font-sans min-h-screen')}>
        <Toaster position="top-center" />
        <div className="wrapper">{children}</div>
        <Analytics />
      </body>
    </html>
  )
}
