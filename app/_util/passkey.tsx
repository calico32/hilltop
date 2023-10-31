import { KeyRound, MonitorSmartphone } from 'lucide-react'

export function passkeyIcon(transports: string[], size = 30): JSX.Element {
  if (transports.includes('hybrid')) {
    return <MonitorSmartphone size={size} />
  }

  return <KeyRound size={size} />
}
