import { dangerousMimeTypes, mimeTypes } from '@/_lib/data'
import { formatBytes } from '@/_lib/format'
import { Storage } from '@prisma/client'
import { AlertTriangle, ArrowUpRightSquare, File } from 'lucide-react'

interface FileCardProps {
  file: Pick<Storage, 'id' | 'name' | 'type' | 'size'>
}

export default function FileCard({ file }: FileCardProps): JSX.Element {
  return (
    <div className="flex flex-col gap-1 p-2 bg-gray-100 rounded-md border-gray-400 border w-max pl-3 pr-4">
      <div className="flex gap-4 items-center">
        <File size={36} strokeWidth={1.2} />
        <div className="flex flex-col flex-grow">
          <div>{file.name}</div>
          <div className="text-sm text-gray-700">
            {formatBytes(file.size)} • {mimeTypes[file.type]}
          </div>
        </div>

        <a
          href={`/storage/${file.id}`}
          target="_blank"
          className="text-blue-500 hover:text-blue-700"
        >
          <ArrowUpRightSquare strokeWidth={1.5} />
        </a>
      </div>
      {dangerousMimeTypes.includes(file.type) && (
        <div>
          <AlertTriangle
            className="text-amber-600 inline align-middle mr-2 ml-1"
            size={20}
            strokeWidth={1.5}
          />
          <span className="text-sm text-gray-700">
            This file may be dangerous. Proceed with caution.
          </span>
        </div>
      )}
    </div>
  )
}
