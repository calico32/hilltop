import { sendRejectionEmail } from '@/_api/applications/email'
import { getApplication, getApplications } from '@/_api/applications/get'
import {
  addApplicationNote,
  deleteApplicationNote,
  getApplicationNotes,
} from '@/_api/applications/note'
import { searchApplications } from '@/_api/applications/search'
import { getApplicationStatus, setApplicationStatus } from '@/_api/applications/status'

const applications = {
  /**
   * Retrieves a job application from the database by its ID.
   * - If the user is an applicant, only their applications are returned.
   * - If the user is not an applicant, all applications are returned.
   * @param id - The ID of the job application to retrieve.
   * @returns A promise that resolves to the retrieved job application, or null
   * if the application is not found or the user is not authorized to view it.
   */
  get: getApplication,
  /**
   * Retrieve job applications from the database.
   * - If the user is an applicant, only their applications are returned.
   * - If the user is not an applicant, all applications are returned.
   * @returns A promise that resolves to an array of job applications.
   */
  getAll: getApplications,

  /**
   * Retrieve the status of a job application.
   * @param id - The ID of the job application to retrieve.
   * @returns A promise that resolves to the status of the job application, or
   * null if the application is not found or the user is not authorized to view
   * it.
   */
  getStatus: getApplicationStatus,
  /**
   * Set the status of a job application.
   * @param id - The ID of the job application to update.
   * @param status - The new status of the job application.
   * @returns A promise that resolves to the updated job application, or null
   * if the application is not found or the user is not authorized to view it.
   */
  setStatus: setApplicationStatus,

  /**
   * Search for job applications by their title or description. If the user is
   * an applicant, only their applications are returned. If the user is not an
   * applicant, all applications are returned.
   */
  search: searchApplications,

  /**
   * Retrieve notes for a job application.
   */
  getNotes: getApplicationNotes,
  /**
   * Add a note to a job application.
   */
  addNote: addApplicationNote,
  /**
   * Delete a note from a job application.
   */
  deleteNote: deleteApplicationNote,

  sendRejectionEmail: sendRejectionEmail,
}

export default applications
