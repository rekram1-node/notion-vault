-- CreateTable
CREATE TABLE "EncryptedDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notionPageId" TEXT NOT NULL,
    "encryptedContent" BLOB,
    "passwordHash" TEXT,
    "serverSidePasswordSalt" BLOB,
    "documentSalt" TEXT,
    "iv" TEXT,
    "passwordSalt" TEXT
);

-- CreateIndex
CREATE INDEX "EncryptedDocument_userId_idx" ON "EncryptedDocument"("userId");

