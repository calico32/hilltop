import { KeyRound, MonitorSmartphone } from 'lucide-react'

interface PasskeyIconProps {
  transports: string[]
  size?: number
}

export function PasskeyIcon({ transports, size = 36 }: PasskeyIconProps): JSX.Element {
  if (transports.includes('hybrid')) {
    return <MonitorSmartphone size={size} />
  }

  return <KeyRound size={size} />
}
