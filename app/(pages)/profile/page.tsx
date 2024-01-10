import server from '@/_api/server'
import ProfilePage from './[id]/page'

export default async function Page(): Promise<JSX.Element> {
  const user = (await server.users.get())!
  return <ProfilePage params={{ id: user.id }} />
}
