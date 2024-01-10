import server from '@/_api/server'
import { avatar, fullName } from '@/_lib/format'
import Image from 'next/image'

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const user = (await server.users.get(id))!

  return (
    <>
      <div className="flex gap-4">
        <Image
          src={avatar(user, { size: 300 })}
          alt=""
          priority
          width={150}
          height={150}
          className="mr-2 self-center rounded-full"
        />
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">{fullName(user)}</h1>
        </div>
      </div>
    </>
  )
}
