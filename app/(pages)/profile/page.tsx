import server from '@/_api/server'
import ProfilePage from './[id]/page'

export default async function Page(): Promise<JSX.Element> {
  const user = (await server.getUser())!
  return <ProfilePage params={{ id: user.id }} />
}
