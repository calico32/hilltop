import LogoutButton from '@/(pages)/dashboard/LogoutButton'
import server from '@/_api/server'
import { displayName } from '@/_lib/name'

export default async function Page(): Promise<JSX.Element> {
  const user = await server.getUser() // middleware

  return (
    <>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-xl">Welcome, {displayName(user)}!</p>
      <LogoutButton />
    </>
  )
}
