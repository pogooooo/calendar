-- 로그인·가입·비밀번호 확인 시도 횟수를 D1 에 센다 (src/lib/rateLimiter.ts). 예전엔 워커 인스턴스마다 메모리에 따로 세서 막을 만큼 쌓이지 않았다.
-- 새 표 하나뿐 — 있던 자료는 건드리지 않는다. 실서버: 웹을 배포하기 전에 먼저 (없어도 코드는 메모리로 물러서지만, 그러면 예전처럼 약하다)
--   npx wrangler d1 execute cronos --remote --file=migrations/0004_rate_limit.sql
CREATE TABLE IF NOT EXISTS "RateLimit" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "count" INTEGER NOT NULL,
    "firstAt" DATETIME NOT NULL,
    "blockedUntil" DATETIME,
    "expiresAt" DATETIME NOT NULL
);
CREATE INDEX IF NOT EXISTS "RateLimit_expiresAt_idx" ON "RateLimit"("expiresAt");
