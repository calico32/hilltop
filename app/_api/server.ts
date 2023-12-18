import {
  addApplicationNote,
  deleteApplicationNote,
  getApplication,
  getApplicationNotes,
  getApplications,
  searchApplications,
} from '@/_api/applications'
import {
  forgotPassword,
  isPasswordResetTokenValid,
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
  /**
   * Get a user by their ID, or the current user if no ID is provided. If the
   * user does not exist or the current user is not logged in, this will return
   * null.
   *
   * Users can only be retrieved by ID if the current user is an admin, or a
   * recruiter while the target user is an applicant.
   */
  getUser,
  /**
   * Get a list of all non-admin users. This can only be used by admins.
   */
  getUsers,
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
   * Retrieve job applications from the database.
   * - If the user is an applicant, only their applications are returned.
   * - If the user is not an applicant, all applications are returned.
   * @returns A promise that resolves to an array of job applications.
   */
  getApplications,
  /**
   * Retrieves a job application from the database by its ID.
   * - If the user is an applicant, only their applications are returned.
   * - If the user is not an applicant, all applications are returned.
   * @param id - The ID of the job application to retrieve.
   * @returns A promise that resolves to the retrieved job application, or null if the application is not found or the user is not authorized to view it.
   */
  getApplication,
  /**
   * Search for job applications by their title or description. If the user is
   * an applicant, only their applications are returned. If the user is not an
   * applicant, all applications are returned.
   */
  searchApplications,
  /**
   * Retrieve notes for a job application.
   */
  getApplicationNotes,
  /**
   * Add a note to a job application.
   */
  addApplicationNote,
  /**
   * Delete a note from a job application.
   */
  deleteApplicationNote,
  /**
   * Retrieve job listings from the database.
   * - If the user is an applicant, only active listings are returned.
   * - If the user is not an applicant, all listings are returned.
   * @returns A promise that resolves to an array of job listings.
   */
  getListings,
  /**
   * Retrieves a job listing from the database by its ID.
   * - If the user is an applicant, only active listings are returned.
   * - If the user is not an applicant, all listings are returned.
   */
  getListing,
  /**
   * Retrieve sensitive data about the current user. This includes their date of
   * birth and the last four digits of their social security number.
   */
  getSensitiveData,
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
  /**
   * Verify a user's email address with the given token. If the token is invalid,
   * this will return an error.
   */
  verifyEmail,
  /**
   * Send a verification email to the current user.
   */
  sendVerificationEmail,
  /**
   * Retrieve the current user's passkeys.
   * @returns A promise that resolves to an array of passkeys.
   */
  getPasskeys,
  /**
   * Begin the passkey registration process.
   * @returns
   */
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
