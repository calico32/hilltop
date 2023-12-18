import server from '@/_api/server'
import PageModal from '@/_components/PageModal'
import { Role } from '@prisma/client'
import { notFound } from 'next/navigation'
import ReviewApplicationPage from '../../../applications/[id]/ReviewApplicationPage'

export default async function Page({ params }: { params: { id: string } }): Promise<JSX.Element> {
  if (!params.id) return notFound()
  const application = await server.getApplication(params.id)
  if (!application) return notFound()
  const currentUser = (await server.getUser())!

  if (currentUser.role !== Role.Applicant) {
    const applicantInfo = await server.getSensitiveData(application.user.id)
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
