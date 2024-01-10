'use client'

import RejectApplicationButton from '@/(pages)/applications/[id]/RejectApplicationButton'
import { FullApplication } from '@/_api/applications/common'
import api from '@/_api/client'
import {
  applicationStatusColors,
  applicationStatusSelectedColors,
  applicationStatuses,
} from '@/_lib/data'
import { ApplicationStatus } from '@prisma/client'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface ApplicationStatusSelectProps {
  initialApplication: FullApplication
}

const statuses: ApplicationStatus[] = [
  ApplicationStatus.Submitted,
  ApplicationStatus.InReview,
  ApplicationStatus.Interviewing,
  ApplicationStatus.Offered,
  ApplicationStatus.Hired,
]

export default function ApplicationStatusSelect({
  initialApplication,
}: ApplicationStatusSelectProps): JSX.Element {
  const { data: status, isLoading } = api.applications.$use('getStatus', initialApplication.id)

  return (
    <>
      <div className="mb-2 mt-4 flex items-center gap-3">
        <h2 className="text-xl font-semibold">Update Status</h2>

        {isLoading && <Loader2 size={20} className="animate-spin" />}
      </div>

      <div className="flex flex-wrap gap-4">
        <RejectApplicationButton application={initialApplication} />
        <div className="flex items-stretch">
          {statuses.map((s, i) => (
            <motion.button
              key={s}
              className={clsx(
                'flex flex-grow items-center justify-center px-4 font-medium transition-colors',
                i === 0 && 'rounded-l-md',
                i === statuses.length - 1 && 'rounded-r-md',
                (status ?? initialApplication.status) === s
                  ? applicationStatusSelectedColors[s]
                  : applicationStatusColors[s],
              )}
              onClick={() => {
                api.applications.setStatus(initialApplication.id, s)
                api.applications.$mutate('getStatus', [initialApplication.id], s)
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {applicationStatuses[s]}
            </motion.button>
          ))}
        </div>
      </div>
    </>
  )
}
