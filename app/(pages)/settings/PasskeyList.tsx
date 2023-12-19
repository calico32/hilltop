'use client'

import PasskeyCard from '@/(pages)/settings/PasskeyCard'
import api from '@/_api/client'
import { Passkey } from '@prisma/client'
import { Info } from 'lucide-react'

interface PasskeyListProps {
  initialData?: Pick<Passkey, 'credentialId' | 'created' | 'updated' | 'transports' | 'nickname'>[]
}

export default function PasskeyList({ initialData }: PasskeyListProps): JSX.Element {
  const { data: passkeyData, isLoading } = api.$use('getPasskeys')

  // if (isLoading) {
  //   const data: Pick<Passkey, 'credentialId' | 'created' | 'updated' | 'transports' | 'nickname'> =
  //     {
  //       credentialId: '12345678901234567890',
  //       created: new Date(),
  //       updated: new Date(),
  //       transports: ['usb'],
  //       nickname: 'Test Nickname',
  //     }
  //   return (
  //     <>
  //       <PasskeyCard passkey={data} skeleton />
  //       <PasskeyCard passkey={data} skeleton />
  //     </>
  //   )
  // }

  const passkeys = passkeyData ?? initialData

  return (
    <>
      {!passkeys || passkeys.length === 0 ? (
        <>
          <div className="bg-blue-50 p-4 border rounded-md text-blue-900 border-blue-700 mb-4 flex">
            <Info size={24} className="inline-block mr-4" />
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
