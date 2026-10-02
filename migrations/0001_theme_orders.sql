-- Apply to local D1 for sandbox development. Production migration is a separate release step.
CREATE TABLE IF NOT EXISTS "ThemeOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "customerKey" TEXT NOT NULL,
    "paymentKey" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "environment" TEXT NOT NULL DEFAULT 'test',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" DATETIME
);
CREATE UNIQUE INDEX IF NOT EXISTS "ThemeOrder_paymentKey_key" ON "ThemeOrder"("paymentKey");
CREATE INDEX IF NOT EXISTS "ThemeOrder_userId_themeId_environment_status_idx" ON "ThemeOrder"("userId", "themeId", "environment", "status");
