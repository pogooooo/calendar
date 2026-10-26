/**
 * 화면 효과(three.js — components/fx/FxStage)를 부르는 신호.
 *
 * 달력을 넘기거나 할 일을 끝내는 곳은 `fx.emit("complete")` 처럼 무슨 일이 있었는지만 알리고,
 * 무엇을 어떻게 그릴지는 갈래의 효과 모듈(celestial·maple·ocean)이 정한다.
 * 듣는 이가 없으면(위젯 창, 움직임 끔, 숨은 창) 아무 일도 없다 — 부르는 쪽은 신경 쓰지 않아도 된다.
 * 자리(x·y·rect)를 안 주면 무대가 방금 누른 자리(지우기는 방금 누른 항목의 상자)를 쓴다.
 */
export type FxKind =
    | "calendar-pick" // 날짜 선택 — 고른 칸에 짧은 테마 효과
    | "month-flip"   // 월간 달력을 넘김 (direction: 1 다음 달, -1 지난달)
    | "page"         // 화면을 옮김
    | "complete"     // 할 일·그날 작업·프로젝트 할 일을 끝냄
    | "sticker"      // 챌린지의 오늘 칸을 채움 (level: 0 보통, 1 연속 이정표, 2 목표를 다 채움 · count: 이어 온 칸 수)
    | "advance"      // 프로젝트 할 일을 옆 칸으로 옮김 (direction: 1 끝 쪽으로, -1 되돌림)
    | "project-done" // 프로젝트를 다 끝냄 — 마지막 할 일까지, 또는 프로젝트를 완료로
    | "drop"         // 할 일을 다른 날로 끌어다 놓음 (rect: 놓은 칸)
    | "remove"       // 무엇을 지움 — 조용히 흩어진다 (rect: 지운 것의 자리)
    | "add"          // 무엇을 새로 넣음
    | "welcome"      // 로그인·가입 — 다음 화면이 뜬 뒤에 인사한다
    | "anniversary"  // 오늘이 기념일 — 하루 한 번 (rect: 그 기념일 줄)
    | "palette"      // 빠른 이동(Ctrl K)을 엶 — 창 둘레에 작게 (rect: 그 창)
    | "widget-open"  // 위젯을 띄움
    | "theme";       // 테마를 바꿈 — 새 갈래가 제 인사를 한다

export interface FxRect { x: number; y: number; w: number; h: number }

export interface FxDetail {
    direction?: 1 | -1;
    /** 효과의 중심(화면 px). 없으면 방금 누른 자리, 그것도 없으면 화면 가운데 */
    x?: number;
    y?: number;
    /** 효과가 머물 영역(달력 칸 묶음 같은). 없으면 화면 전체 */
    rect?: FxRect;
    /** 얼마나 큰 일인가 — 0 보통, 1 이정표, 2 다 이룸 */
    level?: 0 | 1 | 2;
    /** 이어 온 횟수 같은 수 (이정표에 숫자를 띄울 때) */
    count?: number;
}

export interface FxEvent extends FxDetail { kind: FxKind }

type Listener = (e: FxEvent) => void;
const listeners = new Set<Listener>();

export const fx = {
    emit(kind: FxKind, detail: FxDetail = {}) {
        if (typeof window === "undefined") return;
        listeners.forEach((l) => l({ kind, ...detail }));
    },
    on(l: Listener) {
        listeners.add(l);
        return () => { listeners.delete(l); };
    },
};

/** 요소의 화면 위 자리. 없거나 안 보이면 undefined */
export function rectOf(el: Element | null | undefined): FxRect | undefined {
    if (!el) return undefined;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return undefined;
    return { x: r.left, y: r.top, w: r.width, h: r.height };
}

/** 연속 이정표 — 이만큼 이어 오면 효과가 한 단 커진다 */
const STREAK_MILESTONES = new Set([7, 14, 21, 30, 50, 100, 200, 365, 500, 1000]);

/** 챌린지 칸을 채웠을 때의 크기 — 목표를 다 채웠으면 2, 연속 이정표면 1 */
export function stickerLevel(streak: number, reachedTarget: boolean): 0 | 1 | 2 {
    if (reachedTarget) return 2;
    return STREAK_MILESTONES.has(streak) ? 1 : 0;
}
