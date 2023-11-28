-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('Draft', 'Active', 'Closed');

-- AlterTable
ALTER TABLE "JobListing" ADD COLUMN     "status" "ListingStatus" NOT NULL DEFAULT 'Draft';
