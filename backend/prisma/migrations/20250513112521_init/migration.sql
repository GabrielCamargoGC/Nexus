-- CreateTable
CREATE TABLE "Conversion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "currency" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "brlValue" REAL NOT NULL,
    "usdValue" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "currency" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_currency_key" ON "Favorite"("currency");
