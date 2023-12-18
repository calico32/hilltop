'use client'

import {
  applicationStatusColors,
  applicationStatusSelectedColors,
  applicationStatuses,
} from '@/_lib/data'
import { ApplicationStatus } from '@prisma/client'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface ApplicationStatusSelectProps {
  initialStatus: ApplicationStatus
}

const statuses: ApplicationStatus[] = [
  ApplicationStatus.Submitted,
  ApplicationStatus.InReview,
  ApplicationStatus.Interviewing,
  ApplicationStatus.Offered,
]

export default function ApplicationStatusSelect({
  initialStatus,
}: ApplicationStatusSelectProps): JSX.Element {
  const [status, setStatus] = useState(initialStatus)

  return (
    <div className="flex items-stretch">
      {statuses.map((s, i) => (
        <motion.button
          key={s}
          className={clsx(
            'flex-grow flex items-center justify-center px-4 font-medium transition-colors',
            i === 0 && 'rounded-l-md',
            i === statuses.length - 1 && 'rounded-r-md',
            status === s ? applicationStatusSelectedColors[s] : applicationStatusColors[s]
          )}
          onClick={() => setStatus(s)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {applicationStatuses[s]}
        </motion.button>
      ))}
    </div>
  )
}
