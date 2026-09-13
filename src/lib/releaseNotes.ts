/**
 * 패치 노트 — 유일한 출처는 release-notes.json 이다.
 *
 * 세 곳이 그 파일을 읽는다:
 *   - 설정 > 정보 탭 (앱 안에서 지난 판까지 훑어본다)
 *   - 업데이트 알림 (scripts/build-updater-json.mjs 가 latest.json 의 notes 에 그 판의 글을 넣는다)
 *   - GitHub 릴리스 본문 (같은 스크립트가 만든다)
 *
 * 새 판을 내기 전에 JSON 맨 위에 항목을 더한다. 버전은 package.json 과 같아야 한다.
 * 사용자에게 보이는 글이니 코드 이름이 아니라 "무엇이 달라졌는지" 로 쓴다.
 * JSON 인 까닭: CI 의 스크립트가 tsx 없이 그대로 읽는다.
 */
import raw from "./release-notes.json";

export interface ReleaseNote {
    version: string;
    /** YYYY-MM-DD */
    date: string;
    notes: { ko: string[]; en: string[] };
}

export const RELEASE_NOTES: ReleaseNote[] = raw as ReleaseNote[];

/** 해당 버전의 노트. 없으면 null. */
export function notesFor(version: string): ReleaseNote | null {
    const v = version.replace(/^v/, "");
    return RELEASE_NOTES.find(n => n.version === v) ?? null;
}
