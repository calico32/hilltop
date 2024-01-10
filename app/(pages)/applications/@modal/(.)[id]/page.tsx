import server from '@/_api/server'
import PageModal from '@/_components/PageModal'
import { Role } from '@prisma/client'
import { notFound } from 'next/navigation'
import ReviewApplicationPage from '../../[id]/ReviewApplicationPage'

export default async function Page({ params }: { params: { id: string } }): Promise<JSX.Element> {
  if (!params.id) return notFound()
  const application = await server.applications.get(params.id)
  if (!application) return notFound()
  const currentUser = (await server.users.get())!

  if (currentUser.role !== Role.Applicant) {
    const applicantInfo = await server.users.getSensitiveData(application.user.id)
    return (
      <PageModal>
        <ReviewApplicationPage
          modal
          application={application}
          currentUser={currentUser}
          sensitiveData={applicantInfo!}
        />
      </PageModal>
    )
  }

  return <></>
}
