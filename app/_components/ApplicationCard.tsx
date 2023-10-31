import { JobApplication, JobListing } from '@prisma/client'

interface ApplicationCardProps {
  application: JobApplication & { listing: JobListing }
}

export default function ApplicationCard({ application }: ApplicationCardProps): JSX.Element {
  return (
    <div className="flex flex-col p-3 gap-2 rounded-md shadow-md border border-gray-300">
      <div className="font-semibold my-auto">
        <h1>{application.listing.title}</h1>
        <h1>Submitted: {application.created.toDateString()}</h1>
        <h1>Status: {application.status.toString()}</h1>
      </div>
      <hr />
      <p className="ml-4">{application.listing.requirements}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button>
          <strong>
            <span style={{ color: '#00843d' }}>Accept Application</span>
          </strong>
        </button>
        <button>
          <strong>
            <span style={{ color: 'darkred' }}>Reject Application</span>
          </strong>
        </button>
      </div>
    </div>
  )
}
