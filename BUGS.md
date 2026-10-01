# 버그 기록

고친 버그와 까닭을 한 줄씩 남긴다. 같은 함정에 두 번 빠지지 않기 위한 것이므로,
**증상 → 까닭 → 고친 방법(파일)** 만 적는다. 새 버그는 맨 위에 붙인다.
(문서는 이 파일 하나만 둔다. 옛 README·TASKS·DEPLOY·발주서는 git 안에 남아 있다 — `git log --diff-filter=D -- "*.md"`)

| 날짜 | 증상 | 까닭 | 고친 방법 |
|---|---|---|---|
| 2026-10-01 | 폰에서 할 일 추가 시트의 아래(입력칸·저장 단추)가 자판·아래 막대에 가려 안 보임 | ① 크롬 기본값은 자판이 화면을 덮을 뿐 줄이지 않는다 ② 안드로이드 앱은 `enableEdgeToEdge` 로 끝까지 그려 시스템이 자판만큼 창을 줄여 주지 않는다 ③ 웹뷰 140 미만은 `env(safe-area-inset-*)` 이 0 이다 | viewport `interactiveWidget: resizes-content`, 시트 바탕 `100dvh` + 사파리용 visual viewport 맞춤(`BaseModal`). `MainActivity.fitSystemEdges` 가 자판 높이만큼 웹뷰를 줄이고 막대 높이를 `--native-inset-*` 로 넣는다 → CSS 는 `SAFE_T`/`SAFE_B`(`breakpoints.ts`). 시트 아래 여백이 두 번 더해지던 것도 하나로 |
| 2026-10-01 | Maple 폰 달력의 떠 있는 + 단추가 오른쪽 아래가 아니라 달력 칸 위에 박힘 | 도장 단추(`stampButton`)의 `position: relative` 가 `fixed` 를 덮었다. 지킴 스크립트는 `paperCard` 하나만 보고 있었다 | Fab 에 `position: fixed` 를 다시 적고, `check-maple-position.mjs` 가 자리를 거는 조각 목록 전부를 보게 |
| 2026-10-01 | 키 작은 폰(360×640)에서 달력 아래 고른 날 목록이 머리줄만 남고, + 단추가 "N일간 >" 을 덮음 | 월간 격자 높이를 칸 폭으로만 정해 화면 높이를 몰랐다 | 격자 `max-height` 를 화면 높이 − 320px 까지로, 목록 머리줄은 + 단추 폭만큼 비켜 둠 |
| 2026-09-30 | 내려받기와 자동 업데이트가 모두 끊김 — 받기 단추는 "준비 중", 앱은 새 판을 못 찾음 | GitHub 계정이 플래그되어 저장소·릴리스·자산이 **익명에게는 404** 다. `/api/download` 는 익명으로 API 를 부르고, 업데이터는 `releases/latest/download/latest.json` 을 앱이 직접 불렀다 | 서버가 토큰(`GITHUB_TOKEN` Worker 시크릿)으로 읽어 흘려보낸다 — `src/lib/githubRelease.ts`, `/api/download/<파일>`, 새 업데이트 자리 `/api/update` (latest.json 의 주소를 우리 쪽으로 바꿔 준다). `tauri.conf.json` 의 endpoints 를 우리 주소 먼저로 (옛 GitHub 주소는 뒤에 남겨 둔다) |
| 2026-09-30 | 주간·월간 위젯에서 Maple 의 테이프 막대·먹 아이콘·요일 머리 물감이 안 보이고, 화살표도 안 보임 | 두 위젯만 `& * { background-color: transparent !important }` 로 속을 몽땅 비웠다. Maple 은 마스크에 색을 부어 그리므로 그림 자체가 지워진다 | 그 규칙을 지웠다 — 달력은 바탕을 칠하지 않아 위젯 껍데기의 종이가 그대로 비친다 (두 갈래 모두 확인, `src/app/widget/{weekly,monthly}/page.tsx`) |
| 2026-09-30 | 위젯이 떠 있을 때 앱 아이콘을 눌러도 안 켜짐 (1차 수정 뒤에도 남음) | 두 번째 인스턴스가 첫 인스턴스에 보내는 창 메시지가 사라지는 경우가 있다 — 부팅 직후 첫 인스턴스가 아직 창을 못 만든 때, 그리고 업데이트 설치 프로그램이 앱을 관리자 권한으로 띄운 뒤 바로가기(일반 권한)로 켤 때(UIPI 가 막는다) | 켤 때마다 `%APPDATA%/com.cronos.todoapp/launch-request.json` 에 pid·시각을 남기고, 첫 인스턴스가 0.7초마다 읽어 제 것이 아니면 창을 띄운다. single-instance 플러그인도 맨 앞으로 옮겼다 (`src-tauri/src/lib.rs`) |
| 2026-09-22 | Maple 에서 날짜/시간 고르개가 화면 밖에 열림. 셀렉트 메뉴·드롭다운·우클릭 메뉴·사람 쪽지도 같은 증상 | `paperCard` 조각이 거는 `position: relative` 가 Celestial 의 `fixed`/`absolute` 를 덮었다 (갈래 클래스가 나중에 붙는다) | 떠 있어야 하는 일곱 곳에서 조각 뒤에 자리 지정을 다시 적고, `scripts/check-maple-position.mjs` 가 빌드 때 확인한다 |
| 2026-09-22 | 데스크톱 위젯에서 카테고리 색 표식이 안 보임 (Celestial 포함) | 위젯 페이지의 `& * { background-color: transparent }` 가 마스크의 색까지 지웠다 | 같은 색 그라데이션으로 칠한다 (`ink.ts` 의 `inkFill`) |
| 2026-09-22 | 주간 달력이 React 경고를 뿜음 | 화면이 안 쓰는 상태값(`currentDate`·`selectedDate`)이 `...props` 로 DOM 까지 흘러갔다 | View 에서 그 값들을 받아 두고 넘기지 않는다 |
| 2026-09-17 | 폰 월간 아래 "고른 날" 목록이 안 뜨거나 켤 때 같은 자료를 두 번 읽음 | 화면 전환과 스토어 초기화가 겹쳤다 | 읽기를 한 번으로 묶고(`fetchOnce`) 목록을 월간 아래에 고정 |
| 2026-09-14 | 위젯이 떠 있을 때 메인 창을 닫으면 앱이 안 켜짐 | 위젯 때문에 프로세스는 살아 있는데 메인 창이 없어 아이콘을 눌러도 아무 일이 없었다 | 위젯이 있으면 닫기 대신 숨기고, 창이 없으면 설정대로 다시 만든다. 마지막 위젯이 닫히고 메인이 숨어 있으면 앱을 끝낸다 |
| 2026-09-14 | 업데이트 뒤에도 옛 아이콘이 보임 | 실행 파일 경로가 그대로라 윈도우가 아이콘 캐시를 계속 썼다 | 설치 훅에서 `SHChangeNotify` + `ie4uinit -show` (`src-tauri/windows/hooks.nsh`) |
| 2026-09-14 | 안드로이드 홈 위젯이 늘 빈 그림 | 화면 밖 WebView 는 `tauri.localhost` 를 못 연다 | 앱이 재료를 `widget-snapshot.json` 에 쓰고 Kotlin 이 RemoteViews 로 그린다 |
| 2026-09-13 | 윈도우 자동 업데이트가 안 됨 | `latest.json` 에 windows 항목이 빠져 있었다 | 빌드 스크립트가 세 플랫폼 항목을 모두 쓰게 (`scripts/build-updater-json.mjs`) |
| 2026-09-12 | 밝은 테마 위젯이 흰 바탕에 흰 글씨 | 벽지를 읽기 전에는 글자색을 정할 수 없었다 | 벽지 전에 바탕색으로 글자색을 먼저 정한다 |
| 2026-09-10 | 안 보이는 단추가 눌려 태스크 상태가 조용히 바뀜 | 투명해진 단추가 여전히 클릭을 받았다 | 숨길 때 `pointer-events: none` 까지 |
| 2026-09-09 | 브라우저 번역을 켜면 앱이 통째로 죽음 | 번역기가 글자 노드를 `font` 태그로 감싸 옮기면 React 가 붙잡고 있던 노드가 부모를 잃는다 (`removeChild NotFoundError`) | 문서 언어를 ko 로 바로잡고 번역 금지를 명시, 한 엘리먼트 안에서 쪼개져 있던 글자를 하나로 합쳤다 |
| 2026-09-08 | 데스크톱 로그인·가입 화면이 타이틀바에 가려짐 | 그 화면들은 `(main)` 레이아웃 밖이라 타이틀바 높이만큼의 자리가 없었다 | `DesktopDragRegion` 이 자리를 만들고 타이틀바를 얹는다 |
| 2026-09-07 | 새로 고칠 때마다 로그아웃되거나, 창을 여러 개 열면 토큰이 서로를 무효화 | 창마다 따로 리프레시를 돌려 회전한 토큰이 엇갈렸다 | 창 간 잠금(`useAuthFetch`)으로 갱신을 한 번만, 일시적 네트워크 오류는 로그아웃으로 보지 않는다 |
| 2026-09-06 | 완료 체크가 하루씩 밀리고 위젯과 달력의 기록이 어긋남 | 날짜를 시각(Date)으로 주고받아 시간대마다 다른 날로 읽혔다 | 날짜 키(`YYYY-MM-DD`, `lib/dateKey.ts`)로 계약을 통일 |
| 2026-09-05 | 위젯이 마우스에 들썩이고 벽지 엔진과 겹쳐 깜빡임 | z순서를 루프로 강제하고 있었다 | `WM_WINDOWPOSCHANGING` 서브클래싱으로 교체 |
| 2026-09-05 | 앱을 두 번 켜면 위젯이 두 벌 생김 | 인스턴스가 여러 개 떴다 | single-instance 플러그인 + 메인 스레드에서 한 번 더 확인 |
| 2026-09-04 | 업데이트하면 위젯 배치가 초기화됨 | 웹뷰 저장소가 비워졌다 | 위젯 상태를 설정 폴더의 파일로도 남기고 켤 때 복원 (`widgetStateFile.ts`) |
| 2026-09-03 | API 응답에 비밀번호 해시가 섞여 나감 | 사용자 레코드를 통째로 돌려줬다 | 응답에서 민감한 필드를 지운다 |

## 되풀이되는 함정

- **Maple 조각(`paperCard`·`stampButton`…)은 `position: relative` 를 건다.** 떠 있어야 하는 것(팝오버·메뉴)은 조각 **뒤에** 자리 지정을 다시 적을 것. 가드: `scripts/check-maple-position.mjs`
- **위젯 화면은 바탕색을 통째로 지운다.** 마스크에 색을 입힐 때는 `inkFill`(그라데이션)로. 주간·월간은 아예 그 규칙을 뺐다.
- **`next build` 를 dev 서버가 도는 중에 돌리면** `.next` 가 섞여 dev 서버가 500 을 뱉는다. 빌드 뒤에는 `.next` 를 지우고 dev 서버를 다시 켠다.
- **갈래 폴더 밖에서 `theme.family` 로 모양을 가르지 말 것.** 가드: `scripts/check-theme-styles.mjs`
- **폰의 상태 표시줄·아래 막대 높이는 `SAFE_T`/`SAFE_B` 로.** `env(safe-area-inset-*)` 을 바로 쓰면 안드로이드 앱(웹뷰 140 미만)에서 0 이다.
- **날짜는 날짜 키로 주고받는다.** `Date` 를 그대로 넘기면 시간대에서 하루가 밀린다.
