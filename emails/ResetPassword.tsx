import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'
import resolveConfig from 'tailwindcss/resolveConfig'
import config from '../tailwind.config'

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ??
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.BASE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''))

export default function ResetPassword({
  url = `${baseUrl}/reset-password?token=Fe26.2**79cf5e8824657db41cb9ba20e2ada00cde93dc224061da16b5544c152c12e1e7*s1IV_B91_rHaomyjUa6pmw*Horc9N4g6sbSBdbohGmj4dclV46cPa9_L3ALDp-0HhT7ClBNQ912aEcqXxadX3tesUhdbqvb5FibGl8rJzNhFfW0dcNJO5n0ssz0Sa_WMv_7fJeOJKc8x_rdgUhbGA5Pc8pku8O9BsbNI826-yxwF7eHZSLXcEjv0RWrNN171BCKODodRq-NTHUJrx8NyD10**b07f0d80c0305497eab695f5c75608a7df27cc15d160e6d89454ebb8f84ed2a2*Jka-gTMRjeHQ0o4DbEa7R-GYK8Au0VFwmLTWl4hzKrU`,
  name = 'John Doe',
}: {
  url: string
  name: string
}) {
  return (
    <Tailwind config={resolveConfig(config) as any}>
      <Html className="bg-white font-sans">
        <Head />
        <Body
          className="bg-white"
          style={{
            fontFamily:
              '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
          }}
        >
          <Section>
            <Container className="mx-auto w-[580px] pb-12 pt-5">
              <Section className="mb-8">
                <Img
                  src={`${baseUrl}/logo-light.png`}
                  className="block dark:hidden"
                  width="84"
                  height="66"
                  alt="Hilltop"
                />
                <Img
                  src={`${baseUrl}/logo-dark.png`}
                  className="hidden dark:block"
                  width="84"
                  height="66"
                  alt="Hilltop"
                />
              </Section>
              <Section className="pb-5">
                <Row>
                  <Text className="text-3xl font-bold text-gray-700">
                    {name}, reset your password
                  </Text>
                  <Text className="mb-8 text-lg text-gray-700">
                    You recently requested to reset your password for your Hilltop account. Use the
                    button below to reset it. This password reset is only valid for the next hour.
                  </Text>
                  <Text className="mb-8 text-lg text-gray-700">
                    If you did not request a password reset, please ignore this email or{' '}
                    <Link href="mailto:contact@hilltop.works" className="text-blue-600 underline">
                      contact support
                    </Link>{' '}
                    if you have questions.
                  </Text>

                  <Button
                    className="mx-auto mb-10 block w-max rounded-md bg-navyblue-0 px-12 py-4 text-center text-lg text-white"
                    href={url}
                  >
                    Reset Password
                  </Button>

                  <Text className="text-lg text-gray-700">
                    If the button above doesn't work, paste this link into your web browser:
                  </Text>
                  <Link href={url} className="mb-8 block text-lg text-blue-600 underline">
                    {url}
                  </Link>
                </Row>
              </Section>
              <Section>
                <Text className="text-lg text-gray-700">
                  Thanks,
                  <br />
                  The Hilltop Team
                </Text>
              </Section>
            </Container>
          </Section>
        </Body>
      </Html>
    </Tailwind>
  )
}
