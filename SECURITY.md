# 보안 설계 (Security)

Chronos의 인증·인가·입력 검증·요청 제한 설계를 정리한 문서입니다. 실제 구현 코드 위치를 함께 표기합니다.

---

## 1. 인증 (Authentication)

### 1.1 Access / Refresh 토큰 분리

`src/lib/jwt.ts`

| 토큰 | 수명 | 저장 위치 | 용도 |
|---|---|---|---|
| Access Token | **1시간** | 클라이언트 메모리(Zustand) | API 요청 시 `Authorization: Bearer` 헤더 |
| Refresh Token | **7일** | **httpOnly 쿠키** + DB(`RefreshToken`) | Access 재발급 |

- Access Token을 `localStorage`가 아니라 **메모리에만** 보관 → 페이지 새로고침 시 사라지지만, XSS로 토큰이 영구 탈취되는 위험을 줄임.
- Refresh Token은 JS에서 접근 불가능한 **httpOnly 쿠키**에 저장.

```ts
cookieStore.set({
    name: "refreshToken",
    value: refreshToken,
    httpOnly: true,                                   // JS 접근 차단 (XSS 완화)
    secure: process.env.NODE_ENV === "production",    // 운영 시 HTTPS 전용
    sameSite: "strict",                               // CSRF 완화
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
});
```

### 1.2 자동 토큰 갱신 (Silent Refresh)

`src/hooks/useAuthFetch.tsx`

모든 API 호출은 `authFetch` 래퍼를 거칩니다. 401 응답을 받으면:
1. `/api/auth/refresh` 를 호출해 새 Access Token 발급 시도
2. 성공 → 새 토큰으로 **원래 요청을 자동 재시도** (사용자는 끊김 없음)
3. 실패 → 로그아웃 후 로그인 페이지로 이동

→ 짧은 Access Token 수명(1h)으로 토큰 탈취 시 피해 시간을 제한하면서도 UX는 유지.

### 1.3 Refresh Token 서버 검증 (DB 대조 + 회전)

`src/app/api/auth/refresh/route.ts`

Refresh Token은 JWT 서명 검증만으로 끝내지 않고 **DB의 `RefreshToken` 레코드와 대조**합니다.

- 로그인 시 `deleteMany`로 기존 토큰을 지우고 새로 발급 → **한 계정당 활성 세션 단일화**
- 로그아웃(`/api/auth/logout`) 시 DB 레코드 삭제 + 쿠키 삭제 → 서버 측에서 세션을 즉시 무효화 가능 (순수 stateless JWT의 "로그아웃 불가" 문제 해결)
- 만료 레코드는 조회 시점에 삭제

### 1.4 비밀번호 해싱

`bcryptjs`, cost factor **12** (`register`, `user` PATCH)

```ts
const hashedPassword = await bcrypt.hash(password, 12);
```

---

## 2. 인가 (Authorization) — IDOR 방지

가장 신경 쓴 부분. JWT로 "누구인지"(authentication)를 확인한 뒤, 모든 리소스 접근에서 "이 리소스에 권한이 있는지"(authorization)를 **별도로** 검사합니다.

`src/app/api/todo/route.ts` 외 전 API 공통 패턴:

```ts
const checkCategoryPermission = async (categoryId: string, userId: string) => {
    const category = await prisma.category.findFirst({
        where: {
            id: categoryId,
            OR: [
                { creatorId: userId },                    // 생성자 본인
                { participants: { some: { id: userId } } } // 초대된 멤버
            ]
        },
        select: { id: true }
    });
    return !!category;
};
```

- **단건 조회**: `where`에 소유 조건을 함께 걸어, 권한 없는 리소스는 애초에 쿼리 결과에 안 나옴(`findFirst` + OR 조건).
- **생성/수정/삭제**: 대상 리소스의 `categoryId`를 먼저 조회 → 권한 검사 → 통과 시에만 실행.
- **카테고리 이동**: Todo의 카테고리를 옮길 때, **원본과 대상 카테고리 둘 다** 권한을 검사.

> 이렇게 하지 않으면 `PATCH /api/todo {id: "남의_todo_id"}` 같은 요청으로 타인의 데이터를 조작할 수 있음(IDOR, Broken Object Level Authorization). URL/body의 ID를 신뢰하지 않는 것이 핵심.

---

## 3. 입력 검증 (Input Validation)

`src/lib/schema.ts` — 모든 API가 **zod 스키마**로 요청 본문을 검증.

- 클라이언트 검증은 UX용일 뿐, **서버에서 다시 검증**(클라이언트 우회 가능성 전제).
- `safeParse` 실패 시 첫 번째 에러 메시지만 반환 → 내부 스키마 구조 노출 최소화.

### 비밀번호 정책
```ts
export const passwordSchema = z.string()
    .min(8, "최소 8자")
    .max(72, "72자 초과 불가")          // bcrypt 72바이트 한계 (조용한 truncation 방지)
    .regex(/[A-Z]/, "대문자 포함")
    .regex(/[0-9]/, "숫자 포함")
    .regex(/[^A-Za-z0-9]/, "특수문자 포함");
```

- `color`는 `#RRGGBB` 정규식, `status`/`priority`는 `z.enum`으로 화이트리스트만 허용.

> ORM(Prisma)을 사용하므로 SQL Injection은 구조적으로 차단됨(파라미터 바인딩). zod는 그 위에서 **타입·형식·값 범위**를 보장.

---

## 4. 요청 제한 (Rate Limiting)

`src/lib/rateLimiter.ts` — IP 단위 메모리 기반 슬라이딩 윈도우.

| 엔드포인트 | 정책 |
|---|---|
| 로그인 | 10분 내 10회 초과 → **15분 차단** |
| 회원가입 | 1시간 내 5회 초과 → **1시간 차단** |

- 차단 시 `429 Too Many Requests` + `Retry-After` 헤더 반환.
- 로그인 **성공 시 카운터 초기화**(`resetRateLimit`) → 정상 사용자 불이익 없음.
- IP는 `x-forwarded-for` → `x-real-ip` 순으로 추출.

→ 무차별 대입(brute-force)·자동 가입 봇 완화.

> 단일 서버 메모리 기반이라 다중 인스턴스 환경에서는 한계가 있음. 운영 확장 시 **Redis(Upstash 등)** 로 교체하도록 코드에 명시해둠.

---

## 5. 계정 열거 방지 (Account Enumeration)

`src/app/api/auth/login/route.ts`

이메일이 없을 때와 비밀번호가 틀렸을 때 **동일한 메시지·동일한 상태코드(401)** 반환:

```ts
if (!user || !user.password) {
    return NextResponse.json(
        { message: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 }
    );
}
```

→ 응답 차이로 "이 이메일이 가입되어 있는지"를 알아내는 정보 누출 차단.

---

## 6. 시크릿 관리

`src/lib/jwt.ts`

```ts
const SECRET_KEY = process.env.AUTH_SECRET
    ?? (() => { throw new Error("AUTH_SECRET 환경변수가 설정되지 않았습니다."); })();
```

- JWT 서명 키를 **하드코딩하지 않고** 환경변수에서만 로드.
- 미설정 시 서버 부팅 자체를 차단(fail-fast) → 약한/누락된 시크릿으로 운영되는 사고 예방.

---

## 7. 계정 삭제 — 트랜잭션 정합성

`src/app/api/user/route.ts` (DELETE)

- 비밀번호 재확인 후 진행(소셜 계정은 비밀번호 없으므로 예외 처리).
- `prisma.$transaction([...])` 으로 연관 데이터(토큰·설정·daily 데이터)와 N:M 관계 해제, 계정 삭제를 **원자적으로** 수행 → 중간 실패 시 전체 롤백, 고아 데이터 방지.

---

## 8. 소셜 로그인 신원 위변조 방지 (Google OAuth)

`src/app/api/auth/google/route.ts`

**문제가 됐던 설계**: 초기 구현은 클라이언트가 Google에서 받은 프로필(`email`, `googleId` 등)을 직접 서버로 보내고, 서버가 그 값을 **그대로 신뢰**해 로그인 처리했음. 이 경우 공격자가 임의의 body(`{ email: "victim@gmail.com", googleId: "..." }`)를 POST하면 **타인 계정으로 로그인**할 수 있었음(인증 우회).

**해결**: 신원 정보는 클라이언트가 아니라 **서버가 Google로부터 직접 받아오도록** 변경.

1. 클라이언트는 신원 claim 대신 **Google access_token만** 전송.
2. 서버는 `https://oauth2.googleapis.com/tokeninfo` 로 토큰을 검증하고, **토큰의 대상(`aud`/`azp`)이 우리 앱의 `GOOGLE_CLIENT_ID`와 일치하는지** 확인 → 다른 앱에 발급된 토큰을 가져다 쓰는 **혼동된 대리자(confused deputy) 공격 차단**.
3. 검증 통과 후에만 Google `userinfo`에서 프로필을 가져와 사용하며, **`email_verified`가 true인 경우에만** 로그인 허용.

```ts
const audience = tokenInfo.aud ?? tokenInfo.azp;
if (!GOOGLE_CLIENT_ID || audience !== GOOGLE_CLIENT_ID) return null;  // 토큰 대상 검증
// ...
if (!sub || !email || !emailVerified) return null;                    // 검증된 신원만 신뢰
```

→ 클라이언트가 보낸 어떤 값도 신원 판단에 사용하지 않음. 신원의 출처는 항상 Google.

---

## 9. 응답·로깅 위생

- 모든 `catch`에서 내부 에러 객체를 클라이언트에 노출하지 않고 일반화된 메시지만 반환, 상세는 `console.error`로 서버 로그에만 기록.
- 회원가입 시 검증 에러도 첫 메시지만 노출.

---

## 알려진 한계 / 향후 개선

| 항목 | 현재 | 개선 방향 |
|---|---|---|
| Rate Limiter | 단일 서버 메모리 | Redis 분산 저장소 |
| Refresh 토큰 | 평문 저장 | DB에는 해시 저장 |
| 전송 구간 | 로컬 HTTP(데스크톱) | 원격 배포 시 HTTPS 강제 |
