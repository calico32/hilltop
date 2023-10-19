import 'client-only'
import { Actions } from 'kiyoi/client'

import server from '@/_api/server'

const api = Actions(server)

export default api
