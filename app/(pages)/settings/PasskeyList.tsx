'use client'

import PasskeyCard from '@/(pages)/settings/PasskeyCard'
import api from '@/_api/client'
import { Passkey } from '@prisma/client'
import { Info } from 'lucide-react'

interface PasskeyListProps {
  initialData?: Pick<Passkey, 'credentialId' | 'created' | 'updated' | 'transports' | 'nickname'>[]
}

export default function PasskeyList({ initialData }: PasskeyListProps): JSX.Element {
  const { data: passkeyData, isLoading } = api.passkeys.$use('getAll')

  const passkeys = passkeyData ?? initialData

  return (
    <>
      {!passkeys || passkeys.length === 0 ? (
        <>
          <div className="mb-4 flex rounded-md border border-blue-700 bg-blue-50 p-4 text-blue-900">
            <Info size={24} className="mr-4 inline-block" />
            <span>
              Passkeys are a passwordless and more secure way to sign in to websites. Consider
              registering one today!
            </span>
          </div>
          <p className=" text-gray-500">You have no passkeys registered.</p>
        </>
      ) : (
        passkeys.map((passkey) => <PasskeyCard key={passkey.credentialId} passkey={passkey} />)
      )}
    </>
  )
}
