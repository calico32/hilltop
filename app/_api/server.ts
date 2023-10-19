import { getApplication, getApplications, searchApplications } from '@/_api/applications'
import { forgotPassword, login, logout, register, resetPassword } from '@/_api/auth'
import { getListings } from '@/_api/listings'
import { getSensitiveData, getUser, getUsers } from '@/_api/users'

const server = {
  getUser,
  getUsers,
  login,
  register,
  logout,
  getApplications,
  getApplication,
  searchApplications,
  getListings,
  getSensitiveData,
  forgotPassword,
  resetPassword,
}

export default server
