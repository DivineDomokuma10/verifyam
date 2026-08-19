-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "listingUrl" TEXT,
    "address" TEXT NOT NULL,
    "price" REAL,
    "agentName" TEXT,
    "agentPhone" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "result" TEXT,
    "confidence" REAL,
    "calleCallId" TEXT,
    "structuredResult" TEXT,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Verification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Verification" ("address", "agentName", "agentPhone", "calleCallId", "confidence", "createdAt", "id", "listingUrl", "price", "result", "source", "status", "structuredResult", "updatedAt", "userId") SELECT "address", "agentName", "agentPhone", "calleCallId", "confidence", "createdAt", "id", "listingUrl", "price", "result", "source", "status", "structuredResult", "updatedAt", "userId" FROM "Verification";
DROP TABLE "Verification";
ALTER TABLE "new_Verification" RENAME TO "Verification";
CREATE INDEX "Verification_userId_idx" ON "Verification"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
