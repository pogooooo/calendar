# CRONOS 배포 절차

사용자가 "배포해"라고 요청하면 기존 서비스의 웹, Windows 데스크톱, Android 비공개 테스트 Alpha를 업데이트한다. 이 문서의 경로와 계정은 2026-10-24 KST에 확인했다. 실행 전 원격 버전과 인증을 다시 확인한다.

## 배포 경로와 현재 상태

| 대상 | 경로 | 확인한 상태 |
| --- | --- | --- |
| 소스 | https://github.com/pogooooo/calendar · 기본 브랜치 `master` | 로컬 origin과 일치. 기존 Git 자격 증명으로 `pogooooo`의 push 권한 확인 |
| 웹과 공용 API | https://cronos.pogoo.workers.dev | Cloudflare Worker `cronos`. 홈페이지·다운로드·업데이터 HTTP 200 |
| Cloudflare 관리 | https://dash.cloudflare.com/b39c857d1473af13bda46e5b9b74fcb9/workers/services/view/cronos/production | Wrangler OAuth 계정 `poggo201103@gmail.com`. 최신 배포 2026-10-13 11:14 KST |
| 데스크톱 릴리스 | https://github.com/pogooooo/calendar/releases | 최신 `v1.3.1` (2026-10-13). Windows EXE/MSI와 `.sig`, `latest.json`, Android APK 포함 |
| 다운로드 | https://cronos.pogoo.workers.dev/download | Worker가 GitHub 자산을 중계. Windows·APK는 1.3.1, macOS는 1.0.1. Linux는 1.0.1 자산이 있으나 가용성 조회가 간헐적으로 없음 반환 |
| 데스크톱 자동 업데이트 | https://cronos.pogoo.workers.dev/api/update | 현재 `1.3.1`, `windows-x86_64`. GitHub 직접 주소가 예비 endpoint |
| Google Play 관리 | https://play.google.com/console/u/3/developers/6851888871428387760/app/4972920876506897910/app-dashboard | `halustudioteam@gmail.com` · 개발자 `HaluStudio` · 앱 `CRONOS: 할 일·캘린더·프로젝트` |
| Android 기존 출시 트랙 | https://play.google.com/console/u/3/developers/6851888871428387760/app/4972920876506897910/tracks/4699311535365955880 | **비공개 테스트 Alpha**, 활성. 최신 `1.2.0`, versionCode `1002000`, 2026-10-07 제공. 프로덕션으로 승급하지 않는다 |
| Android 스토어 주소 | https://play.google.com/store/apps/details?id=com.cronos.todoapp | 패키지 `com.cronos.todoapp`. 비공개 테스트이므로 참여 권한에 따라 접근 가능 |

Google 계정의 `/u/3/` 번호는 브라우저 로그인 순서에 따라 바뀔 수 있다. 이메일과 개발자 ID·앱 ID로 식별한다. Play 배포는 로그인된 Chrome 콘솔로 진행할 수 있다. Google Play Developer API의 서비스 계정 자동 업로드는 구성하지 않았다.

## 인증과 빌드 준비

```powershell
npm run deploy:check -- --live
npm run github -- run list --repo pogooooo/calendar --limit 5
npx wrangler deployments list --name cronos
git status --short
git fetch origin --tags
```

`deploy:check`는 버전 일치·패치 노트·서명 파일·Android SDK를 점검한다. `--live`는 GitHub/Cloudflare 인증과 서비스 응답도 읽기 전용으로 확인한다. 파일 존재 점검은 실제 서명이나 설치 동작 검증을 대신하지 않는다. Play의 최대 업로드 versionCode와 트랙은 콘솔에서 별도로 확인한다.

`npm run github -- <gh 명령>`은 gh 로그인 상태를 우선 사용하고, 없으면 Git Credential Manager의 기존 자격 증명을 자식 프로세스에만 전달한다. 인증 정보를 출력하거나 새 토큰을 저장하지 않는다. 기존 자격 증명이 만료된 경우 `gh auth login`, Cloudflare는 `npx wrangler login`으로 사용자가 로그인한다.

로컬 비밀 파일은 `src-tauri/updater.properties`의 `privateKey`·`password`, `src-tauri/keystore.properties`의 `storeFile`·`storePassword`·`keyAlias`·`keyPassword`다. 모두 Git에서 제외되어 있다. 기존 업로드 키와 업데이터 키를 계속 사용한다. 개인키가 바뀌면 기존 앱의 업데이트가 끊길 수 있다.

직접 다운로드 APK의 기존 인증서는 Play 업로드 키와 다르다. APK는 별도의 `src-tauri/apk-keystore.properties`에서 기존 APK 키를 읽고, AAB는 `keystore.properties`의 Play 업로드 키를 읽는다. 두 파일 모두 Git에 넣지 않는다. 2026-10-26 기존 공개 APK의 인증서 SHA-256은 `3b99f0f40c1e6fd5b1903c4814828ffa3ace95a554ee565beceeed8e2e5c4544`로 확인했으며, 새 APK를 게시하기 전에 같은지 검사한다.

Android 빌드 스크립트는 환경변수 `JAVA_HOME`, `ANDROID_HOME`/`ANDROID_SDK_ROOT`, `NDK_HOME`을 우선 사용한다. 없으면 이 컴퓨터의 `~/tools/jdk-17*`, `~/tools/android-sdk`, 그 아래 NDK를 찾는다. `src-tauri/gen/android`가 없는 새 환경에서는 먼저 `npm run tauri -- android init`을 실행한다. 네이티브 수정 원본은 추적되는 `src-tauri/android-overlay`이며 빌드 전에 자동 복사한다.

Windows 일반 권한에서 Tauri의 심볼릭 링크 생성만 실패하면, 스크립트는 방금 컴파일한 ARM64 라이브러리를 `jniLibs`로 복사하고 Gradle로 서명 패키징한다. 이 단계에서는 이미 끝난 Rust 빌드를 중복 실행하지 않는다. 시스템 개발자 모드나 관리자 권한을 바꾸지 않는다. 별도 Android 설정 파일이나 bundle.resources를 추가한 경우에는 복사 경로도 해당 설정을 반영하도록 수정해야 하며, 현재 스크립트는 반영 없이 진행하지 않는다.

Android의 Rust 라이브러리는 `src-tauri/build.rs`에서 Android 대상에만 16 KB ELF 정렬을 적용한다. 로컬 NDK r26의 기본값은 4 KB이므로 릴리스마다 `llvm-readelf -l`의 LOAD 정렬과 APK의 `zipalign -c -P 16 -v 4`를 확인한다. [Android 16 KB 지원 문서](https://developer.android.com/guide/practices/page-sizes) 참고.

## 공통 릴리스 준비

개발 중인 보석 테마는 `src/styles/themeAvailability.ts`에서 배포 빌드에 한해 숨긴다. 개발 서버에서는 계속 수정·선택할 수 있다. 저장된 보석 설정은 삭제하지 않고 배포판의 화면·위젯과 첫 배경만 Celestial로 대체한다. 공개 준비가 끝나면 이 정책을 변경하고 다시 검증한다.

1. 원격과 로컬 변경을 비교하고 배포 범위를 정한다. 사용자 작업을 삭제하거나 자동으로 덮어쓰지 않는다.
2. 새 버전을 정한다. 버전 생략 시 현재 로컬·GitHub·Play보다 높은 patch 버전을 사용한다. package.json·package-lock.json·tauri.conf.json·Cargo.toml·Cargo.lock의 cronos 버전을 맞춘다. `npm version <새버전> --no-git-tag-version`은 npm 파일을 맞추며 Tauri/Rust 파일은 별도로 수정해야 한다.
3. `src/lib/release-notes.json` 맨 위에 새 버전의 날짜(KST), 한국어·영어 변경 사항을 추가한다.
4. `npm run deploy:check`, `npm run check:widgets`, `npm run check:themes`, `npx tsc --noEmit`과 변경에 필요한 검증을 수행한다. 의존성을 새로 설치한 환경에서는 `npm ci`, `npx prisma generate`를 먼저 실행한다.
5. Google Play 앱 번들 탐색기에서 **모든 트랙 및 기존 초안에 업로드한 최대 versionCode**를 확인한다. 새 코드가 반드시 더 커야 한다. 필요하면 추적되는 `tauri.conf.json`의 `bundle.android.versionCode`로 명시한다. 생성 폴더의 값을 직접 고정하지 않는다. [Tauri Google Play 배포 문서](https://v2.tauri.app/distribute/google-play/) 참고.
6. 네이티브 빌드를 완료하고 실제 산출물·서명·버전을 검사한 뒤 해당 소스를 커밋한다. 개발 서버는 `.next-dev`로 분리되어 있다. 웹 빌드와 네이티브 빌드는 `.next`를 공유하므로 동시에 실행하지 않는다. 기존 개발 서버가 이전 설정으로 `.next`에 쓰고 있다면 새 설정으로 재시작한 후 빌드한다.

## 웹 업데이트

배포 빌드는 Next.js 16.4.3과 OpenNext Cloudflare 1.20.13을 사용한다. 기존 설정과 어댑터의 호환성을 위해 웹·네이티브 프런트엔드 모두 `next build --webpack`으로 빌드한다. 지원 종료된 Next.js를 허용하는 옵션으로 배포 검사를 건너뛰지 않는다. 배포 전에 로컬 `wrangler dev`에서 페이지 응답·인증 API·`check:ssr-styles`를 확인한다.

```powershell
npm run deploy
```

이 명령은 기존 위젯·테마 검사, OpenNext 빌드, Wrangler 배포를 순서대로 실행한다. 설정은 `wrangler.jsonc`에 확인한 Cloudflare account_id로 고정했다. Worker는 `cronos`, D1 바인딩은 `DB`, DB 이름은 `cronos`다. 직전 배포 ID를 기록한 뒤 실행하고 출력된 새 배포 버전 ID를 기록한다. 이 저장소에는 웹을 push만으로 배포하는 GitHub 워크플로가 없다.

일반 배포는 DB를 바꾸지 않는다. 스키마 변경이 있을 때만 필요한 마이그레이션을 확인하고 데이터 보존과 구버전 앱 호환성을 검토한다. `.env`, `.dev.vars`, Wrangler 인증 값과 Worker 시크릿은 커밋하지 않는다. 기존 시크릿을 빌드 산출물에 하드코딩하지 않는다.

## Windows 데스크톱과 직접 다운로드 APK

```powershell
npm run release:desktop
npm run android:release-apk
```

데스크톱 스크립트는 기존 `updater.properties`를 읽어 Tauri 서명 환경변수에 전달한다. Windows 산출물은 `src-tauri/target/release/bundle/nsis/`의 EXE와 `.sig`, `bundle/msi/`의 MSI와 `.sig`다. 커스텀 Cargo target dir가 설정된 경우 Tauri 출력 경로를 따른다. APK는 `src-tauri/gen/android/app/build/outputs/apk/arm64/release/`에 생성되며 정확한 이름은 빌드 출력을 확인한다. 기존처럼 `CRONOS-<버전>-arm64.apk`라는 이름으로 릴리스에 올린다.

2026-10-24에 `gh run list`는 실행 0건이었다. 저장소 이력에는 GitHub 계정 플래그로 Actions가 실행되지 않아 로컬 빌드로 전환한 기록이 있다. 현재도 태그 push만으로 빌드가 된다고 가정하지 않는다. GitHub Secrets의 업데이터 키는 2026-08-03 변경 기록이며, 이후 로컬 키가 교체된 이력이 있으므로 CI 재개 전 현재 공개키와 일치하는지 확인해야 한다. **확인된 배포 경로는 로컬 Windows 서명 빌드다.** macOS·Linux 최신 빌드는 이 컴퓨터에서 검증되지 않았다.

1.3.2부터 release 워크플로는 수동 실행만 받는다. 태그를 올렸을 때 검증되지 않은 CI 서명이나 자동 게시가 로컬 릴리스와 충돌하지 않도록 한 조치다. CI 경로를 다시 사용할 때는 먼저 서명 키 일치와 각 OS 빌드를 확인하고 태그 트리거를 복원한다.

로컬 빌드 경로의 게시 순서는 다음과 같다. 아래 `<새버전>`, `<커밋>`, `<파일경로>`는 실행 전에 실제 값으로 바꾼다.

1. 빌드한 소스를 커밋하고 `master`에 push한다. 태그 `v<새버전>`을 해당 커밋에 만들고 push한다. 이미 존재하는 공개 태그는 덮어쓰지 않는다. Actions가 재개된 상태라면 CI 경로로 전환하고 로컬 업로드와 중복 실행하지 않는다.
2. 한국어·영어 패치 노트로 릴리스 본문 파일을 만들고 `npm run github -- release create v<새버전> --repo pogooooo/calendar --verify-tag --draft --title "v<새버전>" --notes-file <본문파일>`로 초안을 만든다. 초안 동안 기존 최신 릴리스가 계속 제공된다.
3. `npm run github -- release upload v<새버전> <EXE경로> <EXE.sig경로> <MSI경로> <MSI.sig경로> <APK경로> --repo pogooooo/calendar`로 올린다. 공개 파일을 `--clobber`로 덮어쓰지 않는다.
4. `node scripts/build-updater-json.mjs v<새버전> --output <작업폴더>/latest.json`으로 UTF-8 BOM 없이 저장한다. stderr의 누락 플랫폼 메시지를 검토한다. 현재 기본 필수 플랫폼은 `windows-x86_64`다. 이 스크립트도 기존 Git 인증을 사용한다. 본문은 같은 스크립트에 `--release-body --output <본문파일>`을 전달해 만든다.
5. version·notes·플랫폼·다운로드 URL·서명이 새 빌드와 일치하는지 확인하고 `latest.json`을 같은 초안 릴리스에 업로드한다. macOS·Linux 자산을 제공하지 않았다면 최신 제공을 주장하지 않는다.
6. 업로드와 검증이 모두 끝나면 `npm run github -- release edit v<새버전> --repo pogooooo/calendar --draft=false --latest`로 게시한다. GitHub 릴리스와 Worker `/api/update`가 새 버전을 반환하는지 확인한다.

GitHub 직접 익명 다운로드가 404인 이력이 있어 앱의 기본 업데이터와 다운로드는 Worker 중계를 사용한다. Worker의 `GITHUB_TOKEN`이 만료되면 중계도 실패하므로 직접 GitHub 주소만 확인해서 완료로 판단하지 않는다.

## Android Google Play 업데이트

```powershell
npm run android:bundle
```

Play용 서명 AAB는 `src-tauri/gen/android/app/build/outputs/bundle/arm64Release/app-arm64-release.aab`에 생성된다. APK와 AAB는 별도 배포물이다. 웹 APK만 올려서는 Google Play 앱이 업데이트되지 않는다.

1. 위의 HaluStudio 계정과 CRONOS 앱을 연다. package ID `com.cronos.todoapp`과 **비공개 테스트 Alpha**를 확인한다.
2. 새 버전 만들기에서 새 AAB를 업로드한다. 표시되는 versionName과 versionCode, 업로드 인증서 일치를 확인한다. 기존 업로드 키를 새로 만들지 않는다.
3. 패치 노트와 콘솔의 필요한 항목을 채우고 변경 사항을 검토한다. "배포해" 요청 시 기존 Alpha의 저장·심사 제출·출시 단계를 진행한다. 국가·테스터 목록·프로덕션 승급은 요청 없이 변경하지 않는다.
4. 게시 개요에서 검토 전송 여부, 심사 중 여부, 실제 테스터 제공 여부를 확인한다. Google 심사가 끝나지 않았다면 **제출 완료/심사 중**으로 보고한다. 재로그인·본인 인증이 필요한 경우 해당 화면에서 사용자에게 넘긴다.

서비스 계정 API 배포는 구성하지 않았으므로 현재는 로그인된 Chrome Play Console 경로를 사용한다. API 자동화를 새로 연결할 경우 별도 서비스 계정과 최소 앱 권한 설정이 필요하다. [Google Play 출시 트랙 문서](https://developers.google.com/android-publisher/tracks) 참고.

## 배포 후 검증과 복구

`npm run deploy:check -- --live`를 다시 실행한다. 홈페이지·다운로드가 정상이고 `/api/update` 버전·플랫폼이 게시한 릴리스와 같아야 한다. `/api/download?platform=windows&check=1` 및 `platform=android`의 version과 파일명을 확인한다. 설치 파일 서명과 기존 설치 앱의 업데이트 확인, Android 설치/위젯 기본 동작을 가능한 기기에서 확인한다. Play Console은 새 버전과 기존 Alpha 트랙의 상태를 따로 확인한다.

웹에 문제가 생기면 배포 전에 기록한 이전 deployment의 version ID로 `npx wrangler rollback <이전버전ID>`를 사용한다. D1 데이터/마이그레이션은 Worker 롤백과 별개다. 데스크톱·Play는 설치된 앱 버전을 낮추는 대신 수정한 더 높은 버전을 배포한다. Play 단계적 출시를 쓰는 경우 필요하면 해당 출시를 중단한다. 대상별 버전, URL, 배포 ID, 실제 제공/심사 중/실패 상태와 남은 제약을 사용자에게 보고한다.

## 준비 작업 검증 결과

### 2026-10-26 실제 배포

- 최종 공개 버전: `1.3.3`, 소스 태그 `v1.3.3` / 커밋 `e0e0066`. 보석 테마는 개발 모드에만 표시하며 배포판 설정에서는 숨긴다.
- 웹 Worker 버전: `c6258a4e-4a6c-4a0b-a81e-61ea43cb4409`. 직전 복구 대상은 `d6217c75-fb47-47a4-97ba-fd1ec90094c3`이다.
- Windows EXE·MSI·업데이트 서명·`latest.json`과 기존 APK 인증서로 서명한 Android APK를 [v1.3.3 릴리스](https://github.com/pogooooo/calendar/releases/tag/v1.3.3)에 게시했다. Worker의 실제 다운로드 파일 해시가 로컬 서명 파일과 일치하며 `/api/update`도 1.3.3을 반환한다.
- Google Play 기존 비공개 테스트 Alpha에 `1.3.3` / `1003003` AAB를 업로드하고 심사 요청을 전송했다. 제출 시 콘솔은 검토 중으로 표시하며 Google의 사전 검사를 진행했다. 테스터에게 제공 완료된 상태와 구분한다. 관리형 게시는 기존처럼 꺼져 있다.
- `0005_privacy_hardening.sql`의 1~3절만 적용해 계정·일정·프로젝트 데이터를 보존했다. RateLimit 삭제 구문은 실행하지 않았다.
- macOS·Linux 신규 빌드는 게시하지 않았으며 다운로드는 기존 1.0.1을 유지한다.
- 위젯·테마·RGB·타입·빌드 검사, 로컬 Worker의 페이지/인증 API/서버 CSS, Windows 서명, Android 인증서 연속성·16 KB ELF/ZIP 정렬을 확인했다.

### 2026-10-24 배포 준비 기록

2026-10-24에 원격 인증과 웹·Windows·Android 다운로드 및 업데이터 응답을 확인했다. 위젯·테마 검사, 변경 파일 ESLint, Next 화면 빌드와 타입 검사가 통과했다. Windows EXE·MSI 및 두 업데이트 서명을 생성했고, 서명의 키 ID가 앱 설정의 공개키와 일치했다. Android ARM64 AAB는 Gradle `BUILD SUCCESSFUL`, JAR 서명 검증은 `jar verified`를 반환했다. 빌드 설정은 1.3.1, versionCode 1003001이다. 실제 기기 설치와 Play 업로드 검증은 다음 배포 과정에서 수행한다.

이 준비 작업에서는 Cloudflare 배포, Git push/태그/릴리스 게시, Play 업로드·심사 제출을 하지 않았다. 빌드 테스트 산출물은 현재 공개된 버전과 번호가 같으므로 그대로 공개 파일에 덮어쓰지 않고, 실제 배포 요청 때 새 버전으로 다시 빌드한다.
