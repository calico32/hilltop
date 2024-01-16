import { fullName } from '@/_lib/format'
import { JobListing, User } from '@prisma/client'
import {
  Body,
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
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.BASE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')

export default function ApplicationRejected({
  application: { user, listing } = {
    user: {
      firstName: 'Alice',
      lastName: 'Smith',
      preferredName: null,
    },
    listing: {
      title: 'Software Engineer',
    },
  },
}: {
  application: {
    user: Pick<User, 'firstName' | 'lastName' | 'preferredName'>
    listing: Pick<JobListing, 'title'>
  }
}) {
  return (
    <Tailwind config={resolveConfig(config) as any}>
      <Html className="bg-white font-sans">
        <Head>
          <style>
            {`
              @media (prefers-color-scheme: dark) {
                .dark\\:hidden {
                  display: none;
                }
              }
            `}
          </style>
        </Head>
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
                  <Text className="mb-8 text-lg text-gray-700">Dear {fullName(user)},</Text>

                  <Text className="mb-8 text-lg text-gray-700">
                    Thank you for applying to the position of <strong>{listing.title}</strong> at
                    Lantern Hill. We are honored that you took the time and effort to apply for one
                    of our positions, and we sincerely appreciate your interest in working for our
                    organization.
                  </Text>

                  <Text className="mb-8 text-lg text-gray-700">
                    After carefully reviewing many applications, we regret to inform you that we
                    will be moving forward with other candidates at this time. Though we were
                    impressed with your qualifications, we have decided to pursue other candidates
                    who we feel are better suited for this role.
                  </Text>

                  <Text className="mb-8 text-lg text-gray-700">
                    Once again, we appreciate your interest in working with us and wish you the best
                    of luck in your future endeavors. If you have any questions or need additional
                    information, please feel free to reach out to us at{' '}
                    <Link className="underline" href="mailto:contact@hilltop.works">
                      contact@hilltop.works
                    </Link>
                    .
                  </Text>
                </Row>
              </Section>
              <Section>
                <Text className="text-lg text-gray-700">
                  Best,
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
