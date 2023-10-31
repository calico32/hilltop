import { passkeyIcon } from '@/_util/passkey'
import { truncate } from '@/_util/string'
import { Passkey } from '@prisma/client'
import clsx from 'clsx'
import DeletePasskeyButton from './DeletePasskeyButton'
import EditPasskeyButton from './EditPasskeyButton'

interface PasskeyCardProps {
  passkey: Pick<Passkey, 'credentialId' | 'transports' | 'nickname' | 'created' | 'updated'>
  skeleton?: boolean
}

export default function PasskeyCard({ passkey, skeleton }: PasskeyCardProps): JSX.Element {
  return (
    <div
      key={passkey.credentialId}
      className={clsx(
        'flex rounded-md p-3 border border-gray-400 my-1 shadow-md',
        skeleton && 'skeleton'
      )}
    >
      <div className="mr-2">{passkeyIcon(passkey.transports)}</div>
      <div className="flex flex-col gap-1">
        <p className="">
          <span className="text-xl font-semibold mr-2">{passkey.nickname ?? 'Passkey'}</span>
          <span className="text-gray-500 text-sm">
            <code>{truncate(passkey.credentialId, 15)}</code>
          </span>
        </p>
        <div className="text-gray-500 text-sm flex gap-1.5 flex-col sm:flex-row">
          <span>Added on {new Date(passkey.created).toLocaleDateString()}</span>
          <span className="hidden sm:block">•</span>
          <span>Last used {new Date(passkey.updated).toLocaleDateString()}</span>
          {passkey.transports.length && (
            <>
              <span className="hidden sm:block">•</span>
              <span>{passkey.transports.join(', ')}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex-grow" />
      <EditPasskeyButton passkey={passkey} />
      <div className="w-1" />
      <DeletePasskeyButton passkey={passkey} />
    </div>
  )
}
