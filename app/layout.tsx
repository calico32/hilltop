import '@/globals.css'
import clsx from 'clsx'
import type { Metadata } from 'next'
import { Figtree, Lora } from 'next/font/google'

const serif = Lora({ subsets: ['latin'], variable: '--serif' })
const sans = Figtree({ subsets: ['latin'], variable: '--sans' })

export const metadata: Metadata = {
  title: 'Hilltop',
  description: 'Find your next job at Hilltop',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={clsx(serif.variable, sans.variable, 'font-sans wrapper')}>{children}</body>
    </html>
  )
}
