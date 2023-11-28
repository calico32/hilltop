/*
  Warnings:

  - You are about to drop the column `resume` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "resume",
ADD COLUMN     "resumeId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Storage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
