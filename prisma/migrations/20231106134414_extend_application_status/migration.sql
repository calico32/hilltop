/*
  Warnings:

  - The values [Accepted] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApplicationStatus_new" AS ENUM ('Submitted', 'InReview', 'Interviewing', 'Rejected', 'Offered', 'Hired', 'Withdrawn');
ALTER TABLE "JobApplication" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "JobApplication" ALTER COLUMN "status" TYPE "ApplicationStatus_new" USING ("status"::text::"ApplicationStatus_new");
ALTER TYPE "ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "ApplicationStatus_old";
ALTER TABLE "JobApplication" ALTER COLUMN "status" SET DEFAULT 'Submitted';
COMMIT;
