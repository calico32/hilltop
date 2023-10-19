import clsx from 'clsx'
import { Loader2 } from 'lucide-react'
import styles from './Button.module.css'

interface SpinnerProps {
  size?: number
  className?: string
}

export default function Spinner({ size = 24, className }: SpinnerProps): JSX.Element {
  return <Loader2 size={size} className={clsx('animate-spin', styles.spinner, className)} />
}
