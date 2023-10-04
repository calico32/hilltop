/*
  Warnings:

  - Added the required column `positions` to the `JobListing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JobListing" ADD COLUMN     "positions" INTEGER NOT NULL;
