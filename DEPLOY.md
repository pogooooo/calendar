# CRONOS 배포 가이드

- **웹**: Cloudflare Workers + D1 에 배포되어 있습니다. 화면과 API를 모두 제공합니다.
- **데스크톱 앱**: 화면을 앱 안에 정적으로 담고(번들), 데이터만 배포된 서버의 API를 호출합니다.

## 배포 현황

| 항목 | 값 |
| --- | --- |
| 웹 주소 | https://cronos.pogoo.workers.dev |
| 소개·다운로드 페이지 | https://cronos.pogoo.workers.dev/download |
| Worker 이름 | `cronos` |
| D1 데이터베이스 | `cronos` (b14d1f13-9acf-4706-989b-254650c4276c) |

## 0. 로컬 개발

```bash
npm run preview     # workerd 런타임 + 로컬 D1 — API까지 정상 동작
npm run dev         # 화면 작업 전용. API 라우트는 동작하지 않음
```

> `next dev` 는 Node 런타임이라 Prisma 의 wasm 쿼리 컴파일러를 읽지 못합니다.
> API 를 함께 확인해야 하면 `npm run preview` 를 쓰세요.

## 1. 웹 재배포

```bash
npm run deploy      # 빌드 + 배포
```

스키마를 바꿨다면 먼저 D1 에 반영합니다.

```bash
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > d1-schema.sql
npx wrangler d1 execute cronos --remote --file=d1-schema.sql
```

### 시크릿

- `AUTH_SECRET` — 설정 완료 (JWT 서명용, 무작위 생성값)
- `GOOGLE_CLIENT_ID` — **미설정**. 구글 로그인을 쓰려면 아래를 실행하고, Google Cloud Console 의 승인된 자바스크립트 원본에 배포 주소를 추가해야 합니다. 빌드 시점 변수 `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 도 함께 필요합니다.

```bash
npx wrangler secret put GOOGLE_CLIENT_ID
```

이메일·비밀번호 로그인은 지금도 정상 동작합니다.

- 메일 시크릿 — **미설정**. 비밀번호 재설정 메일 발송에 필요합니다.
  없으면 메일이 나가지 않고 링크가 서버 로그에만 찍히므로, 배포에서는 반드시 넣어야 합니다.

### 구글 SMTP 릴레이 (현재 방식)

도메인도 회사 정보도 필요 없고 무료 500통/일입니다. 구글이 직접 보내므로 SPF·DKIM 이
정확히 맞아 스팸함 위험도 낮습니다.

1. 구글 계정 → 보안 → **2단계 인증**을 켭니다 (앱 비밀번호의 전제 조건입니다).
2. 같은 화면에서 **앱 비밀번호**를 발급합니다. 16자리 문자열이 나옵니다.
   계정 비밀번호가 아니라 이 값을 씁니다.
3. 시크릿을 등록합니다.

```bash
npx wrangler secret put SMTP_USER   # you@gmail.com
npx wrangler secret put SMTP_PASS   # 앱 비밀번호 16자리
npx wrangler secret put MAIL_FROM   # CRONOS <you@gmail.com>
npx wrangler secret put APP_URL     # https://cronos.pogoo.workers.dev
```

- `MAIL_FROM` 의 주소는 `SMTP_USER` 와 같아야 합니다. 구글은 다른 주소로 보내는 것을 막습니다.
- `SMTP_HOST` / `SMTP_PORT` 는 생략하면 `smtp.gmail.com:465` 입니다.
- `APP_URL` 은 재설정 링크의 절대 주소입니다 — 설정하지 않으면 요청 origin 으로 떨어지는데,
  Host 헤더는 위조할 수 있어 토큰이 공격자 도메인으로 새어 나갈 수 있습니다. 반드시 지정하세요.

> Workers 는 아웃바운드 **25번 포트가 막혀 있어** 자체 메일 서버로 직접 배달할 수 없습니다.
> 그래서 465(암시적 TLS)로 구글에 로그인해 대신 보내는 릴레이 방식을 씁니다.
> 구현은 `src/lib/smtp.ts` (nodemailer 는 workerd 에서 동작하지 않아 직접 작성했습니다).

### 대안 (HTTP API)

`src/lib/mailer.ts` 는 세 방식을 지원하고 설정된 값을 보고 위에서부터 고릅니다.

| 순위 | 설정 | 무료 한도 | 발신 인증 |
| --- | --- | --- | --- |
| 1 | `SMTP_USER` + `SMTP_PASS` | 500통/일 | 구글 앱 비밀번호 |
| 2 | `BREVO_API_KEY` | 300통/일 | 발신 **주소**만 인증 |
| 3 | `RESEND_API_KEY` | 100통/일 | 발신 **도메인** 인증 필수 |

나중에 도메인을 사면 `RESEND_API_KEY` 로 바꿔 넣기만 하면 됩니다.

## 2. 데스크톱 앱 릴리스 (아직 하지 않음)

설치 파일을 배포하려면 **서명 키가 필요하고, 비밀키는 직접 만드셔야 합니다.**

```bash
npx tauri signer generate -w "$HOME/.tauri/cronos.key"
```

1. 출력된 **공개키**를 `src-tauri/tauri.conf.json` 의 `plugins.updater.pubkey` 에 붙여넣습니다 (지금은 `PASTE_TAURI_UPDATER_PUBLIC_KEY_HERE` 자리표시자).
2. 저장소 Settings → Secrets and variables → Actions 에 등록합니다.
   - `TAURI_SIGNING_PRIVATE_KEY` — 비밀키 파일 내용
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` — 키 비밀번호 (없으면 빈 값)
3. 같은 화면 **Variables** 탭에 `NEXT_PUBLIC_API_BASE_URL` = `https://cronos.pogoo.workers.dev` 를 등록합니다.
4. 버전을 올리고 태그를 밀면 `.github/workflows/release.yml` 이 Windows·macOS·Linux 설치 파일을 만들어 서명하고, 업데이트 정보(`latest.json`)와 함께 GitHub 릴리스에 올립니다.

```bash
git commit -am "release: v0.1.1" && git tag v0.1.1 && git push --follow-tags
```

릴리스가 올라가면 `/download` 페이지의 다운로드 버튼이 그 파일을 가리킵니다.

## 3. 자동 업데이트 동작

- 앱 실행 시 `https://github.com/pogooooo/calendar/releases/latest/download/latest.json` 을 확인합니다.
- 새 버전이 있으면 오른쪽 아래에 알림이 뜨고, `지금 설치` 를 누르면 내려받아 적용한 뒤 앱을 한 번 다시 시작합니다.
- 서명이 맞지 않거나 네트워크가 끊겨 있으면 조용히 넘어갑니다.

---

## 구조 메모

### API 라우트 파일 이름
API 핸들러는 `route.api.ts` 입니다. 데스크톱 정적 빌드에서는 서버 라우트를 담을 수 없어서 `pageExtensions` 로 웹 빌드에서만 인식되게 분리했습니다. **새 API 도 `route.api.ts` 로 만드세요.**

### Prisma on Workers
- `previewFeatures = ["driverAdapters", "queryCompiler"]` — Rust 엔진 없이 wasm 으로 동작합니다.
- `src/lib/prisma.ts` 는 `@prisma/client/wasm` 을 임포트하고 요청 시점에 D1 바인딩(`env.DB`)으로 클라이언트를 만듭니다.
- `next.config.ts` 의 `serverExternalPackages` 로 Prisma 를 webpack 번들에서 제외해야 workerd 빌드가 선택됩니다. **이 세 가지 중 하나라도 빠지면 배포본에서 DB 접근이 실패합니다.**

### 인증
- 웹: 리프레시 토큰을 httpOnly 쿠키로 사용
- 데스크톱: `X-Client: desktop` 을 붙이면 서버가 리프레시 토큰을 응답 본문에도 넣어주고, 앱은 `X-Refresh-Token` 헤더로 갱신합니다. 서드파티 쿠키에 의존하지 않습니다.
- JWT 는 `jose` 로 서명·검증합니다 (엣지 런타임 호환).

### 위젯 창
- 개발(`tauri dev`): `http://localhost:3000/widget/{kind}`
- 릴리스: 앱에 담긴 `widget/{kind}/index.html`

### 위젯 요청량
위젯 창은 각각 독립된 페이지라, 예전에는 창 하나당 8개 안팎의 API 요청이 나갔습니다. 두 가지를 고쳤습니다.

- `useWidgetInit(need)` — 위젯이 실제로 쓰는 데이터만 받습니다. 패널이 스스로 받는 경우(프로젝트·챌린지·일일 데이터)는 `[]` 를 넘깁니다.
- `StoreInitializer` 는 `/widget` 경로에서 앱 전체 데이터를 받지 않습니다.

배포본 실측: 일일 메모 2건, 오늘 할 일 2건, 프로젝트 보드 1건. 위젯 6개를 띄운 실행 기준 약 56건 → 10건 안팎입니다.

## 남은 작업

- 구글 로그인 시크릿 설정
- 데스크톱 설치 파일 릴리스 (서명 키 필요)
- 오프라인 사용: 화면은 앱 안에 있어 열리지만 데이터는 서버에서 오므로, 로컬 캐시 + 동기화 큐가 필요합니다.
