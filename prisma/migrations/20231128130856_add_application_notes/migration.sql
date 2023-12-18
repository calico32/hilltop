-- CreateTable
CREATE TABLE "JobApplicationNote" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "JobApplicationNote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobApplicationNote" ADD CONSTRAINT "JobApplicationNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationNote" ADD CONSTRAINT "JobApplicationNote_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
