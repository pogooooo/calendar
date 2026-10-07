-- 프로젝트 할 일에 시각을 줄 수 있게 한다. 예전 할 일은 날짜만 고를 수 있었으므로 모두 하루 종일(true).
-- 실서버: 웹을 배포하기 *전에* 먼저 적용한다 (Prisma 가 이 열을 읽으므로, 없으면 프로젝트 조회가 전부 실패한다).
--   npx wrangler d1 execute cronos --remote --file=migrations/0002_project_task_all_day.sql
ALTER TABLE "ProjectTask" ADD COLUMN "isAllDay" BOOLEAN NOT NULL DEFAULT true;
