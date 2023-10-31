-- CreateTable
CREATE TABLE "Passkey" (
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "nickname" TEXT,
    "type" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "signCount" INTEGER NOT NULL,
    "uvInitialized" BOOLEAN NOT NULL,
    "transports" TEXT[],
    "backupEligible" BOOLEAN NOT NULL,
    "backupState" BOOLEAN NOT NULL,
    "algorithm" INTEGER NOT NULL,

    CONSTRAINT "Passkey_pkey" PRIMARY KEY ("credentialId")
);

-- CreateTable
CREATE TABLE "PasskeyChallenge" (
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires" TIMESTAMP(3) NOT NULL,
    "id" TEXT NOT NULL,
    "challenge" BYTEA NOT NULL,

    CONSTRAINT "PasskeyChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasskeyChallenge_challenge_key" ON "PasskeyChallenge"("challenge");

-- AddForeignKey
ALTER TABLE "Passkey" ADD CONSTRAINT "Passkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
