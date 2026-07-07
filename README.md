# Chronos

> 캘린더 · 할 일 · 프로젝트 · 챌린지를 하나로 묶은 데스크톱 생산성 앱
> 웹(Next.js)으로 만든 풀스택 애플리케이션을 **Tauri로 감싸 네이티브 데스크톱 앱**으로 배포하며, 바탕화면에 붙는 **위젯** 기능까지 제공합니다.

---

## 주요 기능

| 영역 | 설명 |
|---|---|
| **캘린더** | 일간 / 주간 / 월간 뷰. 드래그 리사이즈, 멀티데이 이벤트, 반복 일정(n일마다·종료일·횟수) 지원 |
| **할 일(Todo)** | 카테고리별 분류, 날짜별 완료 토글, 반복 완료 기록 관리 |
| **프로젝트** | 보드 뷰 + 타임라인(간트) 뷰, 태스크 의존성(blockedBy/blocking), 담당자 배정, 우선순위 |
| **챌린지** | "n일마다 반복" 습관 트래커. 목표 횟수 달성 시 종료, 스티커 보드로 진행률 시각화 |
| **카테고리 협업** | 카테고리에 멤버 초대/추방. 같은 카테고리의 할 일·프로젝트·챌린지를 공유 |
| **데스크톱 위젯** | 일간/주간/월간 위젯을 바탕화면에 고정. 항상 위/항상 아래(바탕화면 레벨) 전환 |
| **테마 시스템** | Celestial(라이트·다크) / Botanical 디자인 언어. 사용자별 서버 저장 |
| **다국어(i18n)** | 한국어 / 영어 |

---

## 기술 스택

### Frontend
- **Next.js 15** (App Router, Turbopack)
- **React 19** / **TypeScript**
- **styled-components** — 테마 토큰 기반 디자인 시스템
- **Zustand** — 클라이언트 전역 상태 관리
- **framer-motion** / **GSAP** — 모달·스티커 애니메이션
- **react-hook-form** + **zod** — 폼 검증

### Backend (Next.js Route Handlers)
- **Prisma ORM** + **SQLite**
- **JWT**(jsonwebtoken) 기반 인증 — Access / Refresh 토큰 분리
- **bcryptjs** — 비밀번호 해싱
- **zod** — 서버 사이드 입력 검증
- 자체 구현 **메모리 기반 Rate Limiter**

### Desktop
- **Tauri v2** (Rust)
- Win32 / DWM API 직접 호출(FFI)로 위젯의 바탕화면 고정, 그림자/테두리 제거, 자동 시작 레지스트리 제어
- 프로덕션 빌드 시 Rust가 Next.js standalone 서버(`node server.js`)를 자식 프로세스로 기동

---

## 아키텍처

```
┌─────────────────────────────────────────────┐
│  Tauri (Rust)  — 네이티브 셸 / 위젯 / 자동시작  │
│   └─ 프로덕션: Next standalone 서버를 spawn      │
├─────────────────────────────────────────────┤
│  Next.js 15 App Router                        │
│   ├─ /app/(main)      화면 라우트              │
│   ├─ /app/api/*       REST API (Route Handler) │
│   ├─ /components      테마별 컴포넌트            │
│   │     └─ celestial/ · botanical/            │
│   ├─ /store           Zustand 스토어            │
│   ├─ /lib             jwt · prisma · zod · RL  │
│   └─ /i18n            ko · en                  │
├─────────────────────────────────────────────┤
│  Prisma + SQLite                              │
└─────────────────────────────────────────────┘
```

### 테마 분리 패턴
화면마다 `CelestialXxx` / `BotanicalXxx` 컴포넌트를 두고, 데이터·로직은 상위 `XxxPage`가 전담합니다. 테마 컴포넌트는 props만 받아 **디자인만 담당**합니다.

```ts
if (themeName.startsWith("celestial")) return <CelestialSettings {...props} />;
if (themeName === "botanical")        return <BotanicalSettings {...props} />;
```

> Celestial 디자인 토큰·패턴 명세는 [CELESTIAL_DESIGN.md](./CELESTIAL_DESIGN.md) 참고.

---

## 시작하기

### 환경 변수 (`.env`)
```bash
DATABASE_URL="file:./prisma/Chronos.db"
AUTH_SECRET="<충분히 긴 랜덤 시크릿>"     # 미설정 시 서버 부팅 차단
```

### 설치 & 실행
```bash
npm install
npx prisma migrate dev      # DB 스키마 적용

npm run dev                 # 웹 개발 서버 (localhost:3000)
npm run tauri:dev           # 데스크톱 앱(개발)
npm run tauri:build         # 데스크톱 앱 배포 빌드
```

---

## 데이터 모델 (요약)

`User ─< Category ─< { Todo, Project, Challenge }`

- **Category** 가 협업·권한의 단위. `creator` + `participants`(N:M)
- **Todo / Challenge** 의 반복 완료는 `*Completion` 테이블에 `@@unique([대상, targetDate])` 로 기록 → 같은 날 중복 완료 방지
- **ProjectTask** 는 자기참조 N:M(`TaskDependencies`)으로 의존성 그래프 구성
- 삭제 시 `onDelete: Cascade` 로 연관 데이터 정리

전체 스키마는 [prisma/schema.prisma](./prisma/schema.prisma) 참고.

---

## 보안

인증·인가·입력검증·요청제한 등 보안 설계는 별도 문서로 정리했습니다 → [SECURITY.md](./SECURITY.md)

핵심 요약:
- Access(1h) / Refresh(7d, **httpOnly·SameSite=strict** 쿠키) 토큰 분리
- 모든 보호 API에서 JWT 검증 + **카테고리 소속 기반 권한 검사**(IDOR 방지)
- bcrypt(cost 12) 해싱, zod 비밀번호 정책
- 로그인/회원가입 **Rate Limiting**, 계정 열거(account enumeration) 방지

---

## 프로젝트 문서
- [CELESTIAL_DESIGN.md](./CELESTIAL_DESIGN.md) — Celestial 디자인 시스템 명세
- [SECURITY.md](./SECURITY.md) — 보안 설계 상세
- [PORTFOLIO.md](./PORTFOLIO.md) — 기술적 의사결정 · 문제 해결 기록(포트폴리오용)
