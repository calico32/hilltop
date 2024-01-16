'use client'

import clsx from 'clsx'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

export default function CareerAnimation(): JSX.Element {
  const [ref, setRef] = useState<HTMLElement | null>(null)
  const element = useMemo(
    () =>
      ref ?? typeof document !== 'undefined' ? document.getElementById('career-animation') : null,
    [ref],
  )
  const [className, setClassName] = useState<string>('')

  const [fontSize, setFontSize] = useState(0)

  const [bag, setBag] = useState<number[]>(generateBag(careers.length))
  const [bagIndex, setBagIndex] = useState(0)

  const current = useMemo(() => bag[bagIndex], [bag, bagIndex])
  const [previous, setPrevious] = useState(current)

  const [delay, setDelay] = useState(5000)
  const [duration, setDuration] = useState({ min: 0.5, max: 2 })

  useEffect(() => {
    let progress = 0
    let konamiCode = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
      'Enter',
    ]
    const detectKonamiCode = (event: KeyboardEvent) => {
      if (event.key === konamiCode[progress]) {
        progress++
        console.log(progress)
        if (progress === konamiCode.length) {
          setDelay(160)
          setDuration({ min: 0.15, max: 0.15 })
        }
      } else {
        progress = 0
      }
    }
    console.log('adding event listener')

    window.addEventListener('keydown', detectKonamiCode)
    return () => {
      window.removeEventListener('keydown', detectKonamiCode)
    }
  }, [])

  useEffect(() => {
    setClassName(!element ? '' : 'p-2')
    setFontSize(determineFontSize(window.innerWidth))
    if (!element) {
    }
    const interval = setInterval(() => {
      setPrevious(current)
      if (bagIndex === careers.length - 1) {
        setBag(generateBag(careers.length))
        setBagIndex(0)
      } else {
        setBagIndex((i) => i + 1)
      }
    }, delay)

    const onResize = (event: UIEvent) => {
      const target = event.target as Window
      const width = target.innerWidth
      setFontSize(determineFontSize(width))
    }

    window.addEventListener('resize', onResize)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', onResize)
    }
  }, [delay])

  const currentWidth = useMemo(() => {
    if (!element) return careers[current].length * 36 + 42
    return Math.round(getTextSize(careers[current], element).width + 42)
  }, [current, element, fontSize])

  const offset = Math.ceil(fontSize * 1.2)
  const spacing = Math.round(offset * 0.3)

  const delta = Math.abs(current - previous)
  const currentOffset = current * -(offset + spacing) - spacing * 0.75

  const durationDelta = (duration.max - duration.min) / careers.length
  const durationMs = duration.min + delta * durationDelta * 1.5

  return (
    <motion.div
      suppressHydrationWarning
      ref={setRef}
      id="career-animation"
      className={clsx(
        'relative mt-4 block overflow-hidden rounded-md bg-emeraldgreen-1/40 text-[#45ff85]',
        className,
      )}
      layout
      initial={{
        width: currentWidth,
        height: element ? offset + 16 : 0,
      }}
      animate={{
        width: currentWidth,
        height: element ? offset + 16 : 0,
      }}
      transition={{
        duration: durationMs,
        ease: 'easeInOut',
      }}
    >
      <motion.div
        initial={{
          translateY: currentOffset,
          translateX: '-50%',
        }}
        animate={{
          translateY: currentOffset,
          translateX: '-50%',
        }}
        transition={{
          duration: durationMs,
          ease: 'easeInOut',
        }}
        className="absolute left-1/2 top-0 w-[9999px] text-center"
      >
        {careers.map((career) => (
          <motion.div
            key={career + offset + spacing}
            className="box-border flex w-full items-center justify-center text-center"
            style={{
              height: offset,
              marginTop: spacing,
            }}
          >
            {career}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

let canvas: HTMLCanvasElement

function getTextSize(text: string, element: HTMLElement) {
  canvas ??= document.createElement('canvas')
  const font = getCanvasFont(element)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not get canvas context')
  context.font = font
  const metrics = context.measureText(text)
  return metrics
}

function getCssStyle(element: HTMLElement, prop: string) {
  return window.getComputedStyle(element, null).getPropertyValue(prop)
}

function getCanvasFont(el = document.body) {
  const fontWeight = getCssStyle(el, 'font-weight') || 'normal'
  const fontSize = getCssStyle(el, 'font-size') || '16px'
  const fontFamily = getCssStyle(el, 'font-family') || 'Times New Roman'

  return `${fontWeight} ${fontSize} ${fontFamily}`
}

function generateBag(n: number) {
  const bag = Array.from({ length: n }, (_, i) => i)
  for (let i = 0; i < n; i++) {
    const j = Math.floor(Math.random() * n)
    const temp = bag[i]
    bag[i] = bag[j]
    bag[j] = temp
  }

  return bag
}

function determineFontSize(windowWidth: number) {
  if (windowWidth >= 1280) {
    return 68
  } else if (windowWidth >= 1024) {
    return 60
  } else if (windowWidth >= 640) {
    return 48
  } else {
    return 32
  }
}

const careers = [
  'accounting',
  'architecture',
  'construction',
  'customer service',
  'data analysis',
  'data science',
  'design',
  'finance',
  'food preparation',
  'foodservice',
  'healthcare',
  'hospitality',
  'human resources',
  'legal',
  'logistics',
  'maintenance',
  'management',
  'marketing',
  'nursing',
  'operations',
  'personal care',
  'project management',
  'property management',
  'public relations',
  'real estate',
  'sales',
  'security',
  'social services',
  'software engineering',
  'technology',
  'transportation',
]
