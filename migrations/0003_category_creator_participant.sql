-- 가입 때 만든 기본 카테고리('할 일')에 만든 사람이 참여자로 들어 있지 않았다 (다른 카테고리는 만들 때 넣는다).
-- 그래서 그 카테고리의 프로젝트·작업 담당자 고르개가 비어 자기를 담당으로 걸 수 없었고, 멤버 수가 0 으로 보였다.
-- 빠진 만든 이를 참여자로 채운다 — 이미 있으면 건너뛴다(몇 번 돌려도 같다). 열을 바꾸지 않으므로 웹 배포 앞뒤 어느 때나 된다.
--   npx wrangler d1 execute cronos --remote --file=migrations/0003_category_creator_participant.sql
INSERT OR IGNORE INTO "_CategoryParticipants" ("A", "B")
SELECT c."id", c."creatorId" FROM "Category" c
WHERE EXISTS (SELECT 1 FROM "User" u WHERE u."id" = c."creatorId");
