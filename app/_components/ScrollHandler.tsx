'use client'

import { useEffect, useState } from 'react'

type ScrollInfo = {
  direction: 'up' | 'down'
  top: number
  /* the amount of pixels the user has scrolled since changing directions */
  deltaDirChange: number
}

export default function ScrollHandler(): JSX.Element {
  const [scrollInfo, setScrollInfo] = useState<ScrollInfo>({
    direction: 'down',
    top: 0,
    deltaDirChange: 0,
  })

  useEffect(() => {
    let lastDirChange = 0

    const handleScroll = () => {
      const top = window.scrollY
      const direction = top > scrollInfo.top ? 'down' : 'up'
      if (scrollInfo.direction !== direction) {
        lastDirChange = top
      }
      const deltaDirChange = Math.abs(top - lastDirChange)

      setScrollInfo({
        direction,
        top,
        deltaDirChange,
      })
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    let hidden
    if (scrollInfo.top < 250) {
      hidden = false
    } else if (scrollInfo.direction === 'down') {
      hidden = true
    } else {
      scrollInfo.deltaDirChange < 200
    }

    const appBar = document.querySelector('nav')
    if (appBar) {
      appBar.classList.toggle('app-bar-hidden', hidden)
    }
  }, [scrollInfo])

  return <></>
}
