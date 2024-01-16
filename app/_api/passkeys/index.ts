import { beginPasskeyLogin, passkeyLogin } from '@/_api/passkeys/login'
import { deletePasskey, getPasskeys, nicknamePasskey } from '@/_api/passkeys/manage'
import { beginPasskeyRegistration, registerPasskey } from '@/_api/passkeys/register'
import { beginPasskeyTest, testPasskey } from '@/_api/passkeys/test'

const passkeys = {
  /**
   * Begin the passkey registration process.
   * @returns The configuration object required for the passkey registration process.
   */
  beginRegistration: beginPasskeyRegistration,
  /**
   * Register a new passkey.
   * @param credential The data returned from the calling `navigator.credentials.create()` with the passkey registration configuration.
   */
  register: registerPasskey,

  /**
   * Begin the passkey test process. This will test that a newly registered passkey can be used to log in.
   * @returns A configuration object that can be passed to `navigator.credentials.get()`.
   */
  beginTest: beginPasskeyTest,
  /**
   * Test a passkey. This will test that a newly registered passkey can be used to log in.
   * @param credential The data returned from the calling `navigator.credentials.get()` with the passkey test configuration.
   */
  test: testPasskey,

  /**
   * Begin the passkey login process.
   * @returns A configuration object that can be passed to `navigator.credentials.get()`.
   */
  beginLogin: beginPasskeyLogin,
  /**
   * Log in with a passkey. The user's session will be updated.
   * @param credential The data returned from the calling
   * `navigator.credentials.get()` with the passkey login configuration.
   * @returns The user's data.
   */
  login: passkeyLogin,

  /**
   * Set a nickname for a passkey.
   */
  nickname: nicknamePasskey,
  /**
   * Retrieve the current user's passkeys.
   * @returns A promise that resolves to an array of passkeys.
   */
  getAll: getPasskeys,
  /**
   * Delete a passkey.
   */
  delete: deletePasskey,
}

export default passkeys
