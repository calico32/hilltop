import { Button } from '@react-email/button'
import { Html } from '@react-email/html'

export default function Email() {
  return (
    <Html>
      <Button
        href="https://example.com"
        style={{ background: '#000', color: '#fff', padding: '12px 20px' }}
      >
        Click me
      </Button>
    </Html>
  )
}
