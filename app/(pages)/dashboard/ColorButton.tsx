'use client'

import Button from '@/_components/Button'
import { ReactNode, useState } from 'react'

interface ColorButtonProps {
  children: ReactNode
}

function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function randomColor() {
  const r = randomNumber(0, 255)
  const g = randomNumber(0, 255)
  const b = randomNumber(0, 255)

  return `rgb(${r}, ${g}, ${b})`
}

export default function ColorButton({ children }: ColorButtonProps): JSX.Element {
  const [color, setColor] = useState(randomColor())

  return (
    <Button
      style={{
        backgroundColor: color,
      }}
      onClick={() => {
        setColor(randomColor())
      }}
    >
      {children}
    </Button>
  )
}
