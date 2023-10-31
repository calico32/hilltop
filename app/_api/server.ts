import { getApplication, getApplications, searchApplications } from '@/_api/applications'
import {
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
} from '@/_api/auth'
import { getListing, getListings } from '@/_api/listings'
import {
  beginPasskeyLogin,
  beginPasskeyRegistration,
  beginPasskeyTest,
  deletePasskey,
  getPasskeys,
  nicknamePasskey,
  passkeyLogin,
  registerPasskey,
  testPasskey,
} from '@/_api/passkeys'
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
  getListing,
  getSensitiveData,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendVerificationEmail,
  getPasskeys,
  beginPasskeyRegistration,
  registerPasskey,
  nicknamePasskey,
  beginPasskeyTest,
  testPasskey,
  beginPasskeyLogin,
  passkeyLogin,
  deletePasskey,
}

export default server
