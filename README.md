# CRONOS

> 일정과 목표를 하나의 별자리처럼.
> 캘린더 · 프로젝트 · 챌린지 · 기념일을 한 곳에서 관리하는 할 일 앱.
> **웹 · 데스크톱(Windows·macOS·Linux) · 안드로이드** 가 한 저장소에서 나오고, 데스크톱에서는 바탕화면 **위젯** 11종을 띄운다.

- 웹: https://cronos.pogoo.workers.dev
- 설치 파일: https://cronos.pogoo.workers.dev/download (GitHub 릴리스에서 가져온다)

---

## 무엇을 하는가

| 영역 | 설명 |
|---|---|
| **캘린더** | 월간 / 주간 / 일간. 기간이 있는 일정은 막대로 이어지고, 반복 일정(n일마다 · 종료일 · 횟수)은 하루만 지울 수도 있다 |
| **할 일** | 카테고리별 분류, 날짜별 완료 기록. 홈에서 한 줄로 바로 적는다 |
| **프로젝트** | 보드 + 타임라인. 태스크 선행 관계(blockedBy), 담당자, 중요도 |
| **챌린지** | "n일마다" 습관 기록. 달성한 날마다 스티커가 새겨진다 |
| **기념일** | 매년 돌아오는 날. D-day 로 홈과 캘린더에 뜬다 |
| **카테고리 협업** | 카테고리에 멤버를 초대해 할 일·프로젝트·챌린지를 함께 본다 |
| **위젯 (데스크톱)** | 오늘 할 일 · 임시 작업 · 마감 임박 · 지금/다음 · 주간 · 월간 · 기념일 · 프로젝트 · 챌린지 · 통계 · 메모. 바탕화면에 고정, 유리 배경, 잠금 |
| **테마** | Celestial 라이트 / 다크. 글꼴·크기·두께는 계정에 저장돼 어디서 열어도 같다 |
| **언어 · 시간대** | 한국어 / 영어. 시간대는 설정을 따르고, 완료 기록은 UTC 날짜로 저장한다 |
| **자동 업데이트** | 데스크톱 앱은 켜질 때 새 버전을 확인하고 서명을 검증한 뒤 설치한다 |

---

## 기술

**화면** — Next.js 15 (App Router) · React 19 · TypeScript · styled-components · Zustand · framer-motion / GSAP · react-hook-form + zod

**서버** — Next.js Route Handlers 를 **Cloudflare Workers** 에 올린다 (`@opennextjs/cloudflare`). 데이터는 **D1**, ORM 은 Prisma(wasm 쿼리 컴파일러 + D1 어댑터). 인증은 `jose` JWT — 웹은 httpOnly 리프레시 쿠키, 앱은 헤더로 갱신.

**데스크톱** — Tauri v2 (Rust). 화면은 정적으로 앱 안에 담고 데이터만 서버 API 를 부른다. Win32 FFI 로 위젯을 바탕화면 층에 붙이고, 자동 시작은 레지스트리를 직접 다룬다. 업데이트는 `tauri-plugin-updater`.

**안드로이드** — 같은 Tauri 프로젝트. 화면 전환 · 안전 영역 · 탭바 등 폰 전용 처리는 `MOBILE` / `TOUCH` 미디어 쿼리로 갈라져 있다.

```
┌──────────────────────────────────────────────────────────┐
│  Tauri (Rust)         Windows · macOS · Linux · Android    │
│   └─ 정적 화면 번들 (out-desktop) + 위젯 창 + 자동 시작       │
├──────────────────────────────────────────────────────────┤
│  Next.js 15                                                │
│   ├─ app/(main)      화면            ├─ components/*/celestial/  테마 갈래  │
│   ├─ app/widget/*    위젯 11종        ├─ store/                  Zustand   │
│   ├─ app/api/*       route.api.ts    ├─ i18n/                   ko · en   │
│   └─ app/download    소개·다운로드    └─ styles/                 토큰      │
├──────────────────────────────────────────────────────────┤
│  Cloudflare Workers + D1  (웹 화면 + 모든 플랫폼의 API)        │
└──────────────────────────────────────────────────────────┘
```

### 테마 갈래 패턴

화면마다 로직은 `XxxPage` 가 들고, 모양은 `celestial/CelestialXxx.tsx` + `CelestialXxx.styles.ts` 한 쌍이 든다.
갈래는 `usePickTheme({ celestial: CelestialXxx })` 한 줄이고, `Record<ThemeFamily, …>` 라 새 테마를 `THEME_FAMILIES` 에 더하면 `tsc` 가 아직 안 만든 화면을 전부 짚어 준다.
빌드 앞에서 두 가지를 확인한다 — 위젯 종류가 TS · Rust · 폴더 세 곳에서 같은지(`scripts/check-widget-kinds.mjs`), 테마 갈래 컴포넌트가 모양을 `*.styles.ts` 에 두었는지(`scripts/check-theme-styles.mjs`).

---

## 시작하기

```bash
npm install
npx prisma generate          # npm 11+ 는 postinstall 을 막으므로 직접 돌린다
```

`.env` 에 `AUTH_SECRET`(없으면 서버가 뜨지 않는다)과 `DATABASE_URL`(Prisma CLI 가 스키마를 읽을 때만 쓴다)을 둔다.

로컬 D1 을 한 번 만든다:

```bash
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > d1-schema.sql
npx wrangler d1 execute cronos --local --file=d1-schema.sql -y
npm run seed:dev             # test@cronos.local / Test1234! 계정과 예시 자료
```

```bash
npm run dev                  # 웹 (localhost:3000) — API 도 로컬 D1 로 동작한다
npm run tauri:dev            # 데스크톱 앱 (개발)
npm run preview              # workerd 런타임으로 배포본과 같은 조건 확인
```

배포와 릴리스 절차는 [DEPLOY.md](./DEPLOY.md), 남은 일과 결정 기록은 [TASKS.md](./TASKS.md).

---

## 데이터 모델 (요약)

`User ─< Category ─< { Todo, Project, Challenge }` · `User ─< Anniversary`

- **Category** 가 협업과 권한의 단위. `creator` + `participants`(N:M)
- **Todo / Challenge** 의 반복 완료는 `*Completion` 테이블에 `@@unique([대상, targetDate])` 로 기록 → 같은 날 중복 완료 방지
- **ProjectTask** 는 자기참조 N:M(`TaskDependencies`)으로 선행 관계를 만든다
- 삭제는 `onDelete: Cascade`

전체 스키마는 [prisma/schema.prisma](./prisma/schema.prisma).

---

## 보안 요약

- Access(1h) / Refresh(7d) 토큰 분리. 웹은 **httpOnly · SameSite=strict** 쿠키, 앱은 `X-Refresh-Token` 헤더
- 보호 API 는 JWT 검증 + **카테고리 소속 기반 권한 검사**
- bcrypt(cost 12), zod 비밀번호 정책, 로그인·회원가입 Rate Limiting, 계정 열거 방지
- 비밀번호 재설정 메일은 `APP_URL` 로 절대 주소를 만든다 (Host 헤더를 믿지 않는다)
