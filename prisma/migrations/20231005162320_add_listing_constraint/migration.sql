/*
  Warnings:

  - A unique constraint covering the columns `[listingId,userId]` on the table `JobApplication` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_listingId_userId_key" ON "JobApplication"("listingId", "userId");
