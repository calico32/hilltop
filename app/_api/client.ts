import server from '@/_api/server'
import 'client-only'
import { Actions } from 'kiyoi/client'

const api = Actions(server)
export default api
