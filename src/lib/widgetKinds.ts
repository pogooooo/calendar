/**
 * 위젯 종류의 유일한 출처.
 *
 * 예전에는 이 목록이 세 군데에 따로 있었다 — Rust 의 WIDGET_KINDS, 설정 화면의
 * WIDGET_LIST, 그리고 실제 화면 폴더(src/app/widget/*). 셋이 어긋난 채로 지내다가
 * `due`·`nownext`·`anniversary`·`projects` 네 개는 데스크톱에서 아예 열리지 않았다.
 * Rust 가 모르는 이름이라 open_widget 이 거부했고, 실패는 콘솔에만 남아
 * 사용자에게는 "눌러도 아무 일이 없는 단추"였다.
 *
 * 이제 여기가 기준이다. 세 곳이 어긋나면 scripts/check-widget-kinds.mjs 가
 * 빌드를 멈춘다 (npm run build:desktop / build:cloudflare 에서 돈다).
 *
 * 위젯을 새로 만들 때:
 *   1. src/app/widget/<kind>/page.tsx 를 만든다
 *   2. 이 배열에 이름을 더한다
 *   3. src-tauri/src/lib.rs 의 WIDGET_KINDS 와 widget_size 에도 더한다
 */
export const WIDGET_KINDS = [
    "today",
    "quicktask",
    "due",
    "nownext",
    "weekly",
    "monthly",
    "anniversary",
    "projects",
    "challenge",
    "stats",
    "memo",
] as const;

export type WidgetKind = (typeof WIDGET_KINDS)[number];

export const isWidgetKind = (v: unknown): v is WidgetKind =>
    typeof v === "string" && (WIDGET_KINDS as readonly string[]).includes(v);
