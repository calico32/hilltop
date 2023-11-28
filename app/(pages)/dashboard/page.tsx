import RadialProgress from '@/(pages)/dashboard/RadialProgress'
import VerifyEmailBanner from '@/(pages)/dashboard/VerifyEmailBanner'
import server from '@/_api/server'
import Spinner from '@/_components/Spinner'
import { displayName } from '@/_lib/format'
import { ApplicationStatus, Role } from '@prisma/client'
import Link from 'next/link'

function accepted(a: { status: ApplicationStatus }) {
  return a.status === ApplicationStatus.Offered || a.status === ApplicationStatus.Hired
}

export default async function Page(): Promise<JSX.Element> {
  const user = await server.getUser()

  if (!user) {
    return (
      <>
        <h1 className="text-3xl">Welcome</h1>
        <Spinner />
      </>
    )
  }

  return (
    <>
      <h1 className="text-3xl mb-4">Welcome, {displayName(user)}</h1>
      <VerifyEmailBanner verified={user.emailVerified} />
      <div className="flex-direction-column justify-content-center flex">
        {user.role === Role.Applicant && (
          <RadialProgress
            accepted={2}
            // accepted={user.applications.filter(accepted).length}
            appNum={3}
            // appNum={user.applications.length}
          />
        )}
        <div className="text-emeraldgreen-1 pt-3">
          <p>
            <Link href="/applications">
              {user.role === Role.Admin ? (
                <u>Click here to review user applications.</u>
              ) : (
                <u>Click here to review your applications.</u>
              )}
            </Link>
          </p>
          <p>
            <Link href="/jobs">
              <u>Click here to browse our job list.</u>
            </Link>
          </p>
        </div>
      </div>
      <div className="text-emeraldgreen-1 pt-3 text-xl underline">
        <Link href="https://www.livecardinal.com/community/hillside-senior-living/">
          <p className="text-center">Learn More About Hillside</p>
        </Link>
        {/* {user.applications.map((application) => (
            <ApplicationCard key={application.id} application={application} currentUser={user} />
          ))} */}
      </div>
    </>
  )
}
