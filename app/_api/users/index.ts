import { getSensitiveData, getUser, getUsers } from '@/_api/users/get'

export const users = {
  /**
   * Get a list of all non-admin users. This can only be used by admins.
   */
  getAll: getUsers,
  /**
   * Get a user by their ID, or the current user if no ID is provided. If the
   * user does not exist or the current user is not logged in, this will return
   * null.
   *
   * Users can only be retrieved by ID if the current user is an admin, or a
   * recruiter while the target user is an applicant.
   */
  get: getUser,
  /**
   * Retrieve sensitive data about the current user. This includes their date of
   * birth and the last four digits of their social security number.
   */
  getSensitiveData: getSensitiveData,
}

export default users
