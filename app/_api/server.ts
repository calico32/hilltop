import applications from '@/_api/applications'
import auth from '@/_api/auth'
import listings from '@/_api/listings'
import passkeys from '@/_api/passkeys'
import users from '@/_api/users'
import 'server-only'

const server = {
  applications,
  auth,
  listings,
  passkeys,
  users,
}

export default server
