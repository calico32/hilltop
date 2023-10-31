import RadialProgress from '@/(pages)/dashboard/RadialProgress'
import VerifyEmailBanner from '@/(pages)/dashboard/VerifyEmailBanner'
import server from '@/_api/server'
import Spinner from '@/_components/Spinner'
import { displayName } from '@/_lib/name'
import { ApplicationStatus } from '@prisma/client'

function accepted(a: { status: ApplicationStatus }) {
  return a.status === ApplicationStatus.Accepted || a.status === ApplicationStatus.Hired
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
      <div className="flex">
        <RadialProgress
          accepted={user.applications.filter(accepted).length}
          appNum={user.applications.length}
        />
      </div>
      {/* <ColorButton>Click me</ColorButton> */}
    </>
  )
}
