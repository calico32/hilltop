import { developmentDeleteUser } from '@/_api/auth/dev'
import { sendVerificationEmail, verifyEmail } from '@/_api/auth/email'
import { login, logout, register } from '@/_api/auth/login'
import { forgotPassword, isPasswordResetTokenValid, resetPassword } from '@/_api/auth/password'

const auth = {
  /**
   * Authenticate a user with their email and password. If the credentials are
   * invalid, this will return an error. If the credentials are valid, the
   * user's session will be updated and their data will be returned.
   * @returns The user's data.
   */
  login,
  /**
   * Register a new user with the given data. If the data is invalid, this will
   * return an error. An email will be sent to the user with a link to verify
   * their email address.
   * @returns The newly registered user's ID and role.
   */
  register,
  /**
   * Log the current user out. This is a no-op if the user is not logged in.
   * @returns Promise that resolves when the user is logged out.
   */
  logout,

  /**
   * Send a forgot password email to the user with the given email address. If
   * the email address is not found, this will return an error.
   */
  forgotPassword,
  /**
   * Reset a user's password with the given token. If the token is invalid or
   * expired, this will return an error.
   */
  resetPassword,
  /**
   * Check if a password reset token is valid.
   * @returns True if the token is valid, false otherwise.
   */
  isPasswordResetTokenValid,

  developmentDeleteUser,

  /**
   * Send a verification email to the current user.
   */
  sendVerificationEmail,
  /**
   * Verify a user's email address with the given token. If the token is invalid,
   * this will return an error.
   */
  verifyEmail,
}

export default auth
