import RadialProgress from '@/(pages)/dashboard/RadialProgress'
import VerifyEmailBanner from '@/(pages)/dashboard/VerifyEmailBanner'
import server from '@/_api/server'
import Spinner from '@/_components/Spinner'
import { avatar, displayName } from '@/_lib/format'
import { ApplicationStatus, Role } from '@prisma/client'
import Image from 'next/image'
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
      <Image
        src={(await import('@/_assets/forest-bg.jpg')).default}
        width={3200}
        height={2100}
        priority
        alt="background"
        className="absolute -z-10 w-full brightness-75 object-cover object-center bleed-full h-[300px]"
      />
      <div className="text-3xl mt-10 mb-28 bg-white/80 backdrop-blur-sm p-4 rounded-md shadow-md flex gap-4 items-center">
        <Image src={avatar(user)} width={48} height={48} alt="avatar" className="rounded-full" />
        <h1>
          Welcome, <span className="font-semibold">{displayName(user)}</span>
        </h1>
      </div>
      <VerifyEmailBanner verified={user.emailVerified} />
      <div className="flex-direction-column justify-content-center flex">
        {user.role === Role.Applicant && (
          <RadialProgress
            accepted={user.applications.filter(accepted).length}
            appNum={user.applications.length}
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
