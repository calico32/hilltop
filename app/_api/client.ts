import applications from '@/_api/applications'
import auth from '@/_api/auth'
import listings from '@/_api/listings'
import passkeys from '@/_api/passkeys'
import users from '@/_api/users'
import 'client-only'
import { Actions } from 'kiyoi/client'

const api = {
  applications: Actions(applications),
  auth: Actions(auth),
  listings: Actions(listings),
  passkeys: Actions(passkeys),
  users: Actions(users),
}

export default api
