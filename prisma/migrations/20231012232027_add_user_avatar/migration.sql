-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarId" TEXT;

-- CreateTable
CREATE TABLE "Storage" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" BYTEA NOT NULL,

    CONSTRAINT "Storage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Storage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
