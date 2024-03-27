-- CreateTable
CREATE TABLE "EncryptedDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "encryptedContent" BLOB NOT NULL,
    "userId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "serverSidePasswordSalt" BLOB NOT NULL,
    "documentSalt" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "passwordSalt" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "EncryptedDocument_userId_idx" ON "EncryptedDocument"("userId");

