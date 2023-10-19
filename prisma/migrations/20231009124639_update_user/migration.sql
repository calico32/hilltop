-- AlterTable
ALTER TABLE "User" ADD COLUMN     "middleInitial" TEXT,
ADD COLUMN     "preferredName" TEXT,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "address2" DROP NOT NULL;
