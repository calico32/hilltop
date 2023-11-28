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
  process.env.BASE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')

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
      <Html className="font-sans bg-white">
        <Head />
        <Body
          className="bg-white"
          style={{
            fontFamily:
              '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
          }}
        >
          <Section>
            <Container className="mx-auto pt-5 pb-12 w-[580px]">
              <Section>
                <Img src={`${baseUrl}/logo.png`} width="96" height="30" alt="Hilltop" />
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
                  <Text className="text-lg text-gray-700 mb-8">
                    Thanks for joining Hilltop! We're excited to have you as part of our community.
                    Please click the button below to verify your email address. If you didn't sign
                    up for Hilltop, you can safely ignore this email.
                  </Text>

                  <Button
                    className="py-4 px-12 rounded-md text-white bg-navyblue-0 text-lg text-center w-max mx-auto block mb-10"
                    href={url}
                  >
                    Verify email
                  </Button>

                  <Text className="text-lg text-gray-700">
                    If the button above doesn't work, paste this link into your web browser:
                  </Text>
                  <Link href={url} className="text-lg text-blue-600 underline block mb-8">
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
