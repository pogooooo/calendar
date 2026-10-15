-- 개인정보 보호 손질 (2026-10-15) — 이메일 인증·초대 수락·홈 위젯 열쇠 끊기.
-- 실서버: 웹을 배포하기 전에 먼저
--   npx wrangler d1 execute cronos --remote --file=migrations/0005_privacy_hardening.sql
-- 있던 자료는 지우지 않는다. 다시 돌려도 안전하다(IF NOT EXISTS · 이미 인증된 계정은 건너뜀).
-- (tokenVersion 열 추가는 다시 돌리면 "duplicate column" 으로 멈춘다 — 그 줄만 이미 들어간 것이니 무시)

-- 1) 홈 위젯 열쇠를 끊을 때 올리는 판 번호
ALTER TABLE "User" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;

-- 2) 이메일 인증을 새로 들이면서, 이미 쓰고 있던 계정은 인증된 것으로 둔다 — 그러지 않으면 모두 로그인이 막힌다
UPDATE "User" SET "emailVerified" = strftime('%Y-%m-%dT%H:%M:%f+00:00', 'now') WHERE "emailVerified" IS NULL;

-- 3) 수락을 기다리는 카테고리 초대
CREATE TABLE IF NOT EXISTS "CategoryInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "CategoryInvite_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "CategoryInvite_categoryId_email_key" ON "CategoryInvite"("categoryId", "email");
CREATE INDEX IF NOT EXISTS "CategoryInvite_email_idx" ON "CategoryInvite"("email");
CREATE INDEX IF NOT EXISTS "CategoryInvite_expiresAt_idx" ON "CategoryInvite"("expiresAt");

-- 4) 로그인 시도 제한 표의 끝난 줄(IP 주소가 들어 있던 열쇠)을 한 번 비운다 — 이제부터는 시도마다 치운다
DELETE FROM "RateLimit" WHERE "expiresAt" < strftime('%Y-%m-%dT%H:%M:%f', 'now') OR "key" LIKE 'login:%' OR "key" LIKE 'register:%' OR "key" LIKE 'forgot:%' OR "key" LIKE 'reset:%';
