# Chronos — 프로젝트 상세 설명 (포트폴리오 / 이력서용)

> 이력서·포트폴리오에 그대로 옮겨 쓸 수 있도록, **무엇을 만들었고 / 어떤 기술로 / 어떤 문제를 어떻게 풀었는지** 중심으로 정리한 문서입니다.

---

## 한 줄 요약

> 캘린더·할 일·프로젝트·습관 챌린지를 통합한 **데스크톱 생산성 앱**. Next.js 풀스택으로 개발하고 **Tauri(Rust)** 로 네이티브 앱화했으며, **바탕화면 위젯**과 **JWT 기반 인증·인가 시스템**을 직접 구현.

---

## 이력서용 요약 문장 (복사용)

- Next.js 15 / React 19 / TypeScript 기반 풀스택 데스크톱 앱을 **기획·설계·개발 1인 진행**, Tauri v2로 Windows 네이티브 앱 배포
- Access/Refresh 토큰 분리, httpOnly 쿠키, **카테고리 기반 권한 검사(IDOR 방지)**, Rate Limiting, zod 검증을 포함한 **인증·인가 시스템 직접 설계**
- Rust ↔ Win32/DWM API를 **FFI로 직접 호출**해 바탕화면에 고정되는(Win+D 무시) 데스크톱 위젯 구현
- styled-components 토큰 기반 **멀티 테마 디자인 시스템**(Celestial/Botanical, 라이트·다크)과 컴포넌트-데이터 분리 아키텍처 구축

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 기간 | (직접 기입) |
| 인원 | 1인 (풀스택 · 데스크톱 · 디자인) |
| 형태 | 웹 풀스택 앱 + Tauri 데스크톱 패키징 |
| 핵심 가치 | "일정 관리 + 협업 + 습관 형성"을 한 앱에서, 바탕화면 위젯으로 상시 노출 |

**구현한 도메인**: 캘린더(일/주/월), 할 일(반복·완료기록), 프로젝트(보드+간트 타임라인+의존성), 챌린지(습관 트래커), 카테고리 기반 멤버 협업, 데스크톱 위젯, 멀티 테마, 다국어.

---

## 2. 기술 스택과 선택 이유

### Next.js 15 (App Router) — 프론트와 백엔드를 한 코드베이스로
- Route Handler(`/app/api/*`)로 별도 백엔드 서버 없이 REST API 구현 → 1인 개발에서 컨텍스트 전환 비용 최소화.
- 동시에, 프로덕션에서는 **standalone 출력**을 만들어 Tauri가 로컬 Node 서버로 직접 띄우는 구조로 확장(아래 4-3 참고).

### Tauri v2 (Rust) — Electron 대신
- 번들 용량·메모리 사용량이 Electron보다 훨씬 작음(시스템 WebView 사용).
- **Rust로 OS 네이티브 API에 직접 접근**해야 하는 위젯 요구사항(바탕화면 고정 등)에 적합.

### Prisma + SQLite
- 스키마 우선(schema-first) 설계로 도메인 관계를 명확히 표현.
- 로컬 우선 데스크톱 앱 특성상 임베디드 DB(SQLite)가 배포·백업에 단순.

### Zustand
- Redux 대비 보일러플레이트가 적고, 도메인별 스토어(`useTodoStore`, `useProjectStore` …)로 분리해 관심사 정리.

### styled-components + 디자인 토큰
- 테마(`theme.colors.primary` 등)를 prop으로 주입받아 **런타임 테마 전환**(라이트/다크/다른 디자인 언어)을 자연스럽게 처리.

---

## 3. 아키텍처에서 신경 쓴 점

### 3-1. "데이터/로직"과 "디자인"의 분리
화면별로 `XxxPage`(데이터·상태·핸들러 전담) → `CelestialXxx` / `BotanicalXxx`(props로 받아 렌더만) 구조.

```ts
// SettingsPage.tsx 가 모든 상태/핸들러를 소유하고, 테마 컴포넌트엔 props만 전달
if (themeName.startsWith("celestial")) return <CelestialSettings {...themeProps} />;
if (themeName === "botanical")        return <BotanicalSettings {...themeProps} />;
```

**효과**: 디자인이 두 벌이어도 비즈니스 로직·i18n·API 호출은 **단일 출처(single source of truth)**. 새 테마 추가 시 JSX만 작성하면 됨.

### 3-2. 도메인 모델링
- **Category를 협업·권한의 단위**로 삼아, 그 아래 Todo/Project/Challenge가 매달리는 구조 → 권한 검사 로직을 카테고리 한 곳으로 수렴.
- **반복 일정의 완료 기록**을 별도 테이블(`TodoCompletion`, `ChallengeCompletion`)로 분리하고 `@@unique([대상, targetDate])` 제약 → "반복 일정"을 매 발생일마다 레코드로 복제하지 않고, 원본 1개 + 완료한 날짜만 기록하는 경량 설계.
- **ProjectTask 자기참조 N:M**(`blockedBy`/`blocking`)으로 태스크 의존성 그래프 → 타임라인에서 의존선(SVG) 렌더링.

---

## 4. 기술적으로 어려웠던 문제와 해결

### 4-1. 바탕화면에 "붙는" 위젯 — Win+D를 눌러도 안 사라지게
**문제**: 위젯을 항상 아래(바탕화면 레벨)에 두고 싶은데, 일반 always-on-bottom 창은 `Win+D`(바탕화면 보기)에 함께 최소화됨.

**해결**: Rust에서 Win32 API를 FFI로 직접 호출해, 위젯 창의 부모(owner)를 **바탕화면 셸 윈도우("Progman")로 설정**. 바탕화면의 자식 창으로 취급되어 `Win+D`의 영향을 받지 않게 함.

```rust
// src-tauri/src/lib.rs
pub unsafe fn bypass_win_d(hwnd: isize, enable: bool) {
    let owner = if enable {
        let mut p = FindWindowW(progman_class.as_ptr(), null()); // "Progman"
        if p.is_null() { p = GetDesktopWindow(); }               // fallback
        p
    } else { null_mut() };
    SetWindowLongPtrW(hwnd, GWLP_HWNDPARENT, owner as isize);
}
```

추가로 `DwmSetWindowAttribute`로 그림자·테두리 제거, `WS_EX_NOACTIVATE`로 클릭 시 포커스를 빼앗지 않도록 처리. 30ms 주기 워커가 최소화/숨김된 위젯을 다시 띄우고 Z-order를 바닥으로 유지.

> **배운 점**: 고수준 프레임워크(Tauri)가 추상화하지 못하는 OS별 동작은 결국 네이티브 API를 직접 다뤄야 함. Rust FFI와 Windows 윈도우 모델(owner/parent, Z-order, DWM)을 학습.

### 4-2. 데스크톱 앱인데 백엔드(API·DB)가 필요한 구조
**문제**: Tauri는 정적 프론트만 띄우는 것이 일반적인데, 이 앱은 Next.js API Route와 DB가 필요.

**해결**: 프로덕션 빌드에서 Next.js **standalone 서버**를 만들고, Rust가 앱 시작 시 이를 **자식 프로세스로 spawn**(`node server.js`, `127.0.0.1:3457`)한 뒤 준비될 때까지 헬스체크. 앱 종료(`WindowEvent::Destroyed`) 시 자식 프로세스를 `kill`하여 좀비 프로세스 방지.

```rust
// 개발: localhost:3000 (next dev) / 프로덕션: 127.0.0.1:3457 (spawn된 standalone)
#[cfg(debug_assertions)]      const BASE_URL: &str = "http://localhost:3000";
#[cfg(not(debug_assertions))] const BASE_URL: &str = "http://127.0.0.1:3457";
```

> **배운 점**: 빌드 타깃(dev/prod)에 따라 실행 토폴로지를 분기. 프로세스 생명주기 관리(spawn/health-check/kill)를 직접 다룸.

### 4-3. 토큰 만료로 인한 요청 실패 — 사용자가 못 느끼게
**문제**: Access Token 수명을 짧게(1h) 두면 보안엔 좋지만, 만료 시 요청이 깨짐.

**해결**: `authFetch` 래퍼가 401을 감지하면 자동으로 Refresh → **원래 요청 재시도** → 실패 시에만 로그아웃. 호출부는 토큰 만료를 신경 쓸 필요가 없음(4-1 in SECURITY.md).

> **배운 점**: 보안(짧은 토큰 수명)과 UX(끊김 없는 경험)는 트레이드오프가 아니라, 갱신 레이어를 두면 둘 다 잡을 수 있음.

### 4-4. 권한 우회(IDOR) 차단
**문제**: 로그인만 확인하고 리소스 소유권을 확인하지 않으면, 남의 리소스 ID로 조회·수정 가능.

**해결**: 모든 보호 API에서 JWT의 `userId`를 추출하고, 리소스가 속한 카테고리에 사용자가 **생성자이거나 멤버인지** 검사(`checkCategoryPermission`). 조회는 `where` 절에 소유 조건을 직접 결합해 권한 없는 데이터가 결과에 포함되지 않게 함(SECURITY.md 2장).

> **배운 점**: 인증(authentication)과 인가(authorization)는 별개. "URL/body의 ID를 신뢰하지 말 것"이 OWASP가 1위로 꼽는 취약점(Broken Object Level Authorization)의 핵심.

### 4-5. 소셜 로그인 신원 위변조 차단 (직접 발견한 취약점)
**문제**: Google 로그인 초기 구현은 클라이언트가 Google에서 받은 `email`/`googleId`를 서버로 보내고 서버가 그대로 신뢰했음. 이 경우 위조된 body로 **타인 계정 탈취**가 가능(인증 우회).

**해결**: 신원을 클라이언트가 아니라 **서버가 Google에서 직접 받아오도록** 재설계. 클라이언트는 access_token만 보내고, 서버는 Google `tokeninfo`로 **토큰의 대상(audience)이 우리 앱 client_id와 일치하는지** 검증(다른 앱 토큰 도용=confused deputy 차단) 후, 검증된 신원(`email_verified` 포함)만 사용.

> **배운 점**: "Google이 줬다"와 "Google이 우리에게 줬다"는 다름. OAuth에서 토큰의 audience 검증을 빠뜨리면 인증이 무력화됨. 신뢰 경계(trust boundary)를 클라이언트가 아닌 IdP(Google)에 둬야 함.

### 4-6. 반복 일정 모델링
**문제**: "매일 / n일마다 / 종료일까지 / n회"의 반복 일정을 어떻게 저장할 것인가. 발생할 때마다 레코드를 복제하면 데이터가 폭증.

**해결**: 원본 일정 1개 + 반복 규칙(interval, repeatEndDate, repeatCount)만 저장하고, **실제 발생일은 클라이언트에서 계산해 렌더**. 완료 여부만 `Completion` 테이블에 발생일(`targetDate`) 기준으로 기록(`@@unique`로 중복 방지). 챌린지의 "스티커 보드"도 동일 원리로 시작일+interval로 슬롯을 계산.

> **배운 점**: 파생 가능한 데이터(발생일)는 저장하지 않고 계산. 저장은 "사실(완료했다)"만.

---

## 5. UI / 디자인 시스템

- **두 개의 디자인 언어**: Celestial(골드 포인트·직각·세리프 타이포·글로우)과 Botanical(따뜻한 자연톤). 각각 라이트/다크.
- 디자인 토큰·컴포넌트 패턴을 [CELESTIAL_DESIGN.md](./CELESTIAL_DESIGN.md)에 문서화 → 일관성 유지 및 재사용.
- framer-motion(모달 전환), GSAP(챌린지 스티커가 달성 시 초승달→보름달로 모핑되는 애니메이션) 활용.

---

## 6. 성과 / 결과 (직접 수치 기입 권장)

- 구현 화면 수: 캘린더 3종 + 프로젝트 2뷰 + 카테고리/챌린지/설정/홈 등
- API 엔드포인트: 14개 라우트(auth 5 + 도메인 9)
- 데이터 모델: 12개 모델, N:M·자기참조·Cascade 포함
- (선택) 번들 크기/메모리: Electron 대비 절감폭, 콜드 스타트 시간 등 측정해 기입

---

## 7. 면접에서 말할 수 있는 포인트

1. **"왜 Electron이 아니라 Tauri인가?"** → 용량·메모리, 그리고 위젯을 위한 네이티브 API 접근.
2. **"JWT 로그아웃은 어떻게?"** → Refresh를 DB에 저장·대조해 stateless의 한계를 보완(서버측 무효화 가능).
3. **"IDOR를 어떻게 막았나?"** → 카테고리 소유 조건을 쿼리에 결합, ID를 신뢰하지 않음.
4. **"반복 일정을 어떻게 저장했나?"** → 규칙만 저장, 발생일은 계산, 완료만 기록.
5. **"멀티 테마를 어떻게 관리했나?"** → 데이터/디자인 분리 + 토큰 시스템.

---

## 관련 문서
- [README.md](./README.md) — 기능·실행법
- [SECURITY.md](./SECURITY.md) — 보안 설계 상세
- [CELESTIAL_DESIGN.md](./CELESTIAL_DESIGN.md) — 디자인 시스템 명세
