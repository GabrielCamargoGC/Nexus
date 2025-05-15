/*
  Warnings:

  - Added the required column `userId` to the `Conversion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Favorite` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Conversion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "currency" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "brlValue" REAL NOT NULL,
    "usdValue" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Conversion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Conversion" ("amount", "brlValue", "createdAt", "currency", "id", "usdValue") SELECT "amount", "brlValue", "createdAt", "currency", "id", "usdValue" FROM "Conversion";
DROP TABLE "Conversion";
ALTER TABLE "new_Conversion" RENAME TO "Conversion";
CREATE TABLE "new_Favorite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "currency" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Favorite" ("currency", "id") SELECT "currency", "id" FROM "Favorite";
DROP TABLE "Favorite";
ALTER TABLE "new_Favorite" RENAME TO "Favorite";
CREATE UNIQUE INDEX "Favorite_currency_userId_key" ON "Favorite"("currency", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
