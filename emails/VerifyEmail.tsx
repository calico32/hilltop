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
import { nanoid } from 'nanoid'
import resolveConfig from 'tailwindcss/resolveConfig'
import config from '../tailwind.config'

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ??
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.BASE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''))

export default function VerifyEmail({
  token = nanoid(),
  name = 'John Doe',
}: {
  token: string
  name: string
}) {
  const url = `${baseUrl}/verify-email?token=${token}`
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
              {/* <Section>
              <Img
                src={authorImage}
                width="96"
                height="96"
                alt={authorName}
                style={userImage}
              />
            </Section> */}
              <Section className="pb-5">
                <Row>
                  <Text className="text-3xl font-bold text-gray-700">Welcome to Hilltop</Text>
                  <Text className="mb-8 text-lg text-gray-700">
                    Thanks for joining Hilltop! We're excited to have you as part of our community.
                    Please click the button below to verify your email address. If you didn't sign
                    up for Hilltop, you can safely ignore this email.
                  </Text>

                  <Button
                    className="mx-auto mb-10 block w-max rounded-md bg-navyblue-0 px-12 py-4 text-center text-lg text-white"
                    href={url}
                  >
                    Verify email
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
