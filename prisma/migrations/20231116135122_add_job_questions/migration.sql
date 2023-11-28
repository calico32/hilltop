/*
  Warnings:

  - You are about to drop the column `resume` on the `JobApplication` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('ShortText', 'LongText', 'Number', 'Boolean', 'File', 'Select', 'MultiSelect');

-- AlterTable
ALTER TABLE "JobApplication" DROP COLUMN "resume",
ADD COLUMN     "resumeId" TEXT;

-- CreateTable
CREATE TABLE "JobListingQuestion" (
    "listingId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL,
    "type" "QuestionType" NOT NULL,
    "min" INTEGER,
    "max" INTEGER,

    CONSTRAINT "JobListingQuestion_pkey" PRIMARY KEY ("listingId","sequence")
);

-- CreateTable
CREATE TABLE "JobApplicationQuestion" (
    "listingId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "applicationId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "JobApplicationQuestion_pkey" PRIMARY KEY ("applicationId","sequence")
);

-- AddForeignKey
ALTER TABLE "JobListingQuestion" ADD CONSTRAINT "JobListingQuestion_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "JobListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Storage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationQuestion" ADD CONSTRAINT "JobApplicationQuestion_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "JobListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationQuestion" ADD CONSTRAINT "JobApplicationQuestion_listingId_sequence_fkey" FOREIGN KEY ("listingId", "sequence") REFERENCES "JobListingQuestion"("listingId", "sequence") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationQuestion" ADD CONSTRAINT "JobApplicationQuestion_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
