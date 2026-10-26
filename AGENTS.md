# CRONOS 프로젝트 작업

## 배포 요청

사용자가 명시적으로 배포를 지시한 경우에만 실제 배포한다. 기능·디자인 수정, 오류 해결, 빌드·실행 확인만 요청한 경우에는 원격 배포·Git push·태그·릴리스 게시·스토어 업로드를 실행하지 않는다.

사용자가 "배포해", "배포 업데이트해"라고 하면 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)를 먼저 읽고 실행한다. 별도 대상 지정이 없으면 웹 Cloudflare Workers, Windows 데스크톱 GitHub Releases와 자동 업데이트, Android Google Play의 기존 비공개 테스트 Alpha 및 웹 APK 내려받기를 대상으로 한다. 사용자가 특정 대상만 지정하면 그 대상으로 제한한다.

실제 배포 요청은 해당 기존 채널의 빌드·서명·업로드·출시 요청이다. 준비만 요청한 대화에서는 원격 배포·릴리스·Play 출시를 실행하지 않는다. 현재 요청 범위 내의 통상적인 배포 단계를 반복해서 허락받지 않는다. 로그인 만료나 콘솔의 본인 인증 등 사용자의 조작이 필요한 경우에만 필요한 작업을 구체적으로 설명한다. Google Play 심사가 진행 중이면 심사 제출과 실제 제공 완료를 구분해서 보고한다.

배포 전에 실제 원격 상태와 버전을 다시 확인하고 변경 내용을 검증한다. `npm run deploy:check -- --live`는 읽기 전용 사전 점검이다. 사용자 작업을 삭제·덮어쓰지 말고, 배포할 변경만 포함한다. 릴리스 버전은 package.json, package-lock.json, src-tauri/tauri.conf.json, src-tauri/Cargo.toml 및 Cargo.lock의 cronos 패키지를 맞추고 src/lib/release-notes.json에 한국어·영어 노트를 추가한다. 공개된 태그와 설치 파일은 덮어쓰지 않고 새 버전을 낸다.

GitHub CLI는 `npm run github -- ...` 또는 scripts/github.mjs의 githubEnv를 사용하면 기존 Git Credential Manager 자격 증명을 이용한다. 토큰·서명 키·비밀번호는 출력하거나 Git에 넣지 않는다. Android 업로드 키와 데스크톱 업데이터 키는 서로 다르다. 기존 서명 키를 유지한다.

GitHub Actions 워크플로 파일이 있다고 성공을 가정하지 않는다. 2026-10-24 확인 시 실행 기록이 없고 최신 데스크톱 릴리스는 Windows만 제공했다. 현재 확인된 로컬 서명 빌드는 `npm run release:desktop`, Play용 AAB는 `npm run android:bundle`, 직접 내려받기용 APK는 `npm run android:release-apk`다. macOS·Linux 동시 배포는 현재 빌드 수단이 확인된 경우에만 수행하고 결과를 따로 보고한다.

DB 스키마가 바뀌면 기존 데이터를 보존하는 마이그레이션과 하위 호환성을 먼저 검토한다. 일반 배포에 DB 초기화나 시드 작업을 포함하지 않는다. 배포 후 웹 응답·다운로드·업데이터의 버전과 플랫폼·Play 트랙 상태를 확인하고 대상별 성공/실패/심사 중 상태를 보고한다.
