'use client'

import clsx from 'clsx'
import { useCallback, useEffect, useState } from 'react'

export default function Default() {
  return null
}

function A(): JSX.Element {
  const [open, setOpen] = useState(false)

  const listener = useCallback((e: KeyboardEvent) => {
    if (e.key === 'F4') {
      e.preventDefault()
      e.stopPropagation()
      setOpen((o) => !o)
    }
  }, [])

  const [calculatedWidth, setCalculatedWidth] = useState(900)

  useEffect(() => {
    const listener = () => {
      const width = window.innerWidth
      setCalculatedWidth(width - 32)
    }
    listener()
    window.addEventListener('resize', listener)
    return () => window.removeEventListener('resize', listener)
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  const className = open ? 'opacity-100 scale-100' : 'opacity-0 pointer-events-none'

  const ratio = 569 / 960
  const width = Math.min(calculatedWidth, 1280)
  const height = width * ratio

  return (
    <>
      <div className={clsx('fixed inset-0 z-50 transition', className)}>
        <div className={clsx('fixed inset-0 bg-black/30')} />

        <div className="fixed inset-0 grid place-items-center overflow-y-auto">
          <iframe
            className="rounded-md bg-[#e5e7e8] p-2 pb-0 shadow-xl"
            src="https://docs.google.com/presentation/d/e/2PACX-1vR8mBIe52EF43JEGci7A9NyT0aG35j2nNO_IphrD51Jaj2InzSUhC3i3cMi2G3b3mXFxMvniWfDAUdw/embed?start=false&loop=false&delayms=60000"
            frameBorder="0"
            width={width}
            height={height}
            allowFullScreen
            // @ts-ignore
            mozallowfullscreen="true"
            // @ts-ignore
            webkitallowfullscreen="true"
          />
        </div>
      </div>
    </>
  )
}
