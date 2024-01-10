import { getListing, getListings } from '@/_api/listings/get'

const listings = {
  /**
   * Retrieve job listings from the database.
   * - If the user is an applicant, only active listings are returned.
   * - If the user is not an applicant, all listings are returned.
   * @returns A promise that resolves to an array of job listings.
   */
  getAll: getListings,
  /**
   * Retrieves a job listing from the database by its ID.
   * - If the user is an applicant, only active listings are returned.
   * - If the user is not an applicant, all listings are returned.
   */
  get: getListing,
}

export default listings
