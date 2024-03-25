import ViewApplicationPage from '@/(pages)/applications/[id]/ViewApplicationPage'
import server from '@/_api/server'
import { Role } from '@prisma/client'
import { notFound } from 'next/navigation'
import ReviewApplicationPage from './ReviewApplicationPage'

export const metadata = {
  robots: { index: false, follow: false },
}

export default async function Page({ params }: { params: { id: string } }): Promise<JSX.Element> {
  if (!params.id) return notFound()
  const application = await server.applications.get(params.id)
  if (!application) return notFound()
  const currentUser = (await server.users.get())!

  if (currentUser.role !== Role.Applicant) {
    const applicantInfo = await server.users.getSensitiveData(application.user.id)
    return (
      <ReviewApplicationPage
        application={application}
        currentUser={currentUser}
        sensitiveData={applicantInfo!}
      />
    )
  } else {
    const applicantInfo = await server.users.getSensitiveData()
    return (
      <ViewApplicationPage
        application={application}
        currentUser={currentUser}
        sensitiveData={applicantInfo!}
      />
    )
  }

  return <></>
}
